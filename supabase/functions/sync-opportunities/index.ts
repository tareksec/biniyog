import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple slugify function for generating IDs from names
function generateSlug(text: string) {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\p{L}\p{N}\-]+/gu, '') // Keep all letters (including Bengali), numbers, and dashes
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');    // Trim dashes from start/end

  if (!slug) {
    slug = `project-${Math.random().toString(36).substring(2, 9)}`;
  }
  return slug;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Sheet ID from secret/env
    const sheetId = Deno.env.get("GOOGLE_SHEET_ID");
    const apiKey = Deno.env.get("GOOGLE_SHEETS_API_KEY");

    if (!sheetId || !apiKey) {
      throw new Error("Missing Google Sheets credentials (GOOGLE_SHEET_ID, GOOGLE_SHEETS_API_KEY)");
    }

    const range = "Sheet1!A:Z";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values as string[][];

    if (!rows || rows.length < 2) {
      return new Response(JSON.stringify({ message: "No data found in sheet." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const headers = rows[0];
    const sheetIds = new Set<string>();
    
    // 2. Strict mapping to opportunities table schema
    const opportunities = rows.slice(1)
      .filter((row) => row.some((cell) => cell && cell.trim())) // skip fully empty rows
      .map((row) => {
      const obj: Record<string, any> = {};
      
      headers.forEach((header, i) => {
        const val = row[i] || null;
        const normalizedHeader = header.toLowerCase().trim();
        
        if (normalizedHeader === "id") obj.id = val;
        else if (normalizedHeader === "opportunities") obj.name = val;
        else if (normalizedHeader === "name" || normalizedHeader === "founder") obj.founder_name = val;
        else if (normalizedHeader === "cfa-comment") obj.cfa_comment = val;
        else if (normalizedHeader === "guarantee") obj.guarantee = val;
        else if (normalizedHeader === "category") obj.category = val;
        else if (normalizedHeader === "invetment-type" || normalizedHeader === "investment-type") obj.investment_type = val;
        else if (normalizedHeader === "investment_amount" || normalizedHeader === "investment-amount") obj.investment_amount = val;
        else if (normalizedHeader === "expected_profit" || normalizedHeader === "expected-profit") obj.expected_profit = val;
        else if (normalizedHeader === "profit-period") obj.profit_period = val;
        else if (normalizedHeader === "status") obj.status = val;
        else if (normalizedHeader === "description") obj.description = val;
        else if (normalizedHeader === "adress" || normalizedHeader === "address") obj.address = val;
        else if (normalizedHeader === "organization-type") obj.organization_type = val;
        else if (normalizedHeader === "estimated-capital") obj.estimated_capital = val;
        else if (normalizedHeader === "image_url" || normalizedHeader === "image-url" || normalizedHeader === "image-link" || normalizedHeader === "image_urls") {
          obj.image_urls = val ? val.split(',').map((u: string) => u.trim()).filter(Boolean) : null;
        }
        else if (normalizedHeader === "website_url" || normalizedHeader === "website-url" || normalizedHeader === "links") obj.links = val;
      });
      
      // Skip rows that have no name (likely blank rows)
      if (!obj.name || !obj.name.trim()) return null;

      // 3. Unique id/slug generation if id is missing to prevent duplicates
      if (!obj.id && obj.name) {
        obj.id = generateSlug(obj.name);
      } else if (!obj.id) {
        obj.id = `unknown-${Math.random().toString(36).substring(7)}`;
      }
      
      if (obj.id) sheetIds.add(obj.id);
      
      return obj;
    }).filter(Boolean); // remove nulls from blank rows

    // Deduplicate opportunities by ID (keep the last occurrence if duplicates exist)
    const uniqueOpportunities = Array.from(
      new Map(opportunities.map(opp => [opp!.id, opp])).values()
    );

    // Upsert the data from the sheet
    const { error: upsertError } = await supabaseClient
      .from("opportunities")
      .upsert(uniqueOpportunities, { onConflict: "id" });

    if (upsertError) {
      throw upsertError;
    }

    // 4. HARD DELETE rows that were removed from the sheet
    if (sheetIds.size > 0) {
      const { data: existingRecords, error: fetchError } = await supabaseClient
        .from("opportunities")
        .select("id");
        
      if (!fetchError && existingRecords) {
        const idsToDelete = existingRecords
          .map(r => r.id)
          .filter(id => !sheetIds.has(id));
          
        if (idsToDelete.length > 0) {
          await supabaseClient
            .from("opportunities")
            .delete()
            .in("id", idsToDelete);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      synced: uniqueOpportunities.length,
      message: `Successfully synced ${uniqueOpportunities.length} opportunities.` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
