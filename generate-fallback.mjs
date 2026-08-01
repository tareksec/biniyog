/**
 * generate-fallback.mjs
 *
 * Pulls all opportunities from the live Supabase database and writes a
 * static JSON snapshot to src/data/opportunities-fallback.json.
 *
 * Sensitive fields (bank_details, owner_phone) are stripped out.
 *
 * Usage:
 *   npm run generate-fallback
 *   # or directly:
 *   node generate-fallback.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/** Fields to EXCLUDE from the public fallback snapshot. */
const SENSITIVE_FIELDS = ["bank_details", "owner_phone"];

async function main() {
  console.log("⏳ Fetching opportunities from Supabase…");

  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase error:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error("❌ No opportunities found — aborting to avoid empty fallback.");
    process.exit(1);
  }

  // Strip sensitive fields
  const sanitized = data.map((row) => {
    const clean = { ...row };
    for (const field of SENSITIVE_FIELDS) {
      delete clean[field];
    }
    return clean;
  });

  const outPath = resolve(__dirname, "src/data/opportunities-fallback.json");
  writeFileSync(outPath, JSON.stringify(sanitized, null, 2), "utf-8");

  console.log("⏳ Fetching homepage reviews from Supabase…");
  const { data: hrData, error: hrError } = await supabase
    .from("homepage_reviews")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!hrError && hrData) {
    const hrPath = resolve(__dirname, "src/data/homepage-reviews-fallback.json");
    writeFileSync(hrPath, JSON.stringify(hrData, null, 2), "utf-8");
    console.log(`✅ Wrote ${hrData.length} homepage reviews.`);
  }

  console.log("⏳ Fetching opportunity testimonials from Supabase…");
  const { data: tmData, error: tmError } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (!tmError && tmData) {
    const tmPath = resolve(__dirname, "src/data/testimonials-fallback.json");
    writeFileSync(tmPath, JSON.stringify(tmData, null, 2), "utf-8");
    console.log(`✅ Wrote ${tmData.length} testimonials.`);
  }

  // Compute summary stats
  const activeStatuses = [
    "বিনিয়োগ নেওয়া চলমান-সুযোগ আছে",
    "বিনিয়োগ নেওয়া শেষের দিকে",
  ];
  const activeCount = sanitized.filter((r) =>
    activeStatuses.includes(r.status || "")
  ).length;

  // Extract profit percentages
  const profitNums = sanitized
    .map((r) => {
      const en = String(r.expected_profit || "").replace(/[০-৯]/g, (d) =>
        String("০১২৩৪৫৬৭৮৯".indexOf(d))
      );
      const nums = en.match(/\d+(?:\.\d+)?/g);
      return nums ? Math.max(...nums.map(parseFloat)) : NaN;
    })
    .filter((v) => !isNaN(v) && v > 0);

  const profitMin = profitNums.length > 0 ? Math.floor(Math.min(...profitNums)) : "?";
  const profitMax = profitNums.length > 0 ? Math.ceil(Math.max(...profitNums)) : "?";

  console.log(`✅ Wrote ${sanitized.length} opportunities to:`);
  console.log(`   ${outPath}`);
  console.log(`   Active: ${activeCount} | Profit range: ${profitMin}–${profitMax}%`);
  console.log(`   Generated at: ${new Date().toISOString()}`);
}

main();
