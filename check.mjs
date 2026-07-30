import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('testimonials').select('*').not('related_opportunity_id', 'is', null);
  if (error) console.error("Error specific:", error);
  else console.log(`Found ${data.length} specific testimonials`);
  
  const { data: all, error: errAll } = await supabase.from('testimonials').select('*');
  if (errAll) console.error("Error all:", errAll);
  else console.log(`Found ${all?.length} total testimonials`);
}

check();
