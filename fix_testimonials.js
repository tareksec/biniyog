import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching testimonials with NULL related_opportunity_id...");
  const { data: testimonials, error: tError } = await supabase
    .from('testimonials')
    .select('id, brand_name, quote')
    .is('related_opportunity_id', null)
    .not('brand_name', 'is', null)
    .neq('brand_name', '');

  if (tError) {
    console.error("Error fetching testimonials:", tError);
    return;
  }

  console.log(`Found ${testimonials.length} unlinked testimonials.\n`);

  console.log("Fetching all opportunities...");
  const { data: opportunities, error: oError } = await supabase
    .from('opportunities')
    .select('id, name, slug');

  if (oError) {
    console.error("Error fetching opportunities:", oError);
    return;
  }

  const linked = [];
  const unmatched = [];
  let updatedCount = 0;

  for (const t of testimonials) {
    // Attempt to match
    const bName = t.brand_name.toLowerCase().trim();
    
    // Normalize string for better matching
    const match = opportunities.find(o => {
      const oName = o.name.toLowerCase().trim();
      if (oName === bName) return true;
      if (bName === 'মেড ইজি' && oName.includes('medeasy')) return true;
      if (bName === 'hr knitting' && oName.includes('hr knitting')) return true;
      if (bName === 'ফ্রান্স এক্সপোর্ট wak and sa' && oName.includes('wak and sa')) return true;
      if (bName === "কাচ্চি খানা'স" && (oName.includes('kacchi') || oName.includes('কাচ্চি'))) return true;
      if (bName === 'আমার ফুডস' && oName.includes('amar food')) return true;
      if (bName === 'food network agro' && oName.includes('food network')) return true;
      if (bName === 'শাহী ভ্যারাইটি স্টোর' && oName.includes('shahi')) return true;
      return false;
    });

    if (match) {
      // Execute UPDATE
      const { error: updateError } = await supabase
        .from('testimonials')
        .update({ related_opportunity_id: match.id })
        .eq('id', t.id);

      if (updateError) {
        console.error(`Failed to update testimonial for ${t.brand_name}:`, updateError);
      } else {
        linked.push({ brand: t.brand_name, match: match.name });
        updatedCount++;
      }
    } else {
      unmatched.push(t.brand_name);
    }
  }

  console.log("\n================ REPORT ================\n");
  console.log(`Total testimonials updated: ${updatedCount}`);
  
  console.log("\n✅ NEWLY LINKED BRAND NAMES:");
  linked.forEach(l => console.log(`  - ${l.brand} -> ${l.match}`));

  console.log("\n❌ UNMATCHED BRAND NAMES (No corresponding opportunity found yet):");
  unmatched.forEach(u => console.log(`  - ${u}`));
  console.log("\nThese remain correctly showing on /reviews but not on detail pages.");
  console.log("\n========================================\n");
}

run();
