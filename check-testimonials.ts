import { supabase } from './src/lib/supabase';

async function check() {
  const { data, error } = await supabase.from('testimonials').select('*').not('related_opportunity_id', 'is', null);
  if (error) console.error("Error specific:", error);
  else console.log(`Found ${data.length} specific testimonials`);
  
  const { data: all, error: errAll } = await supabase.from('testimonials').select('*');
  if (errAll) console.error("Error all:", errAll);
  else console.log(`Found ${all?.length} total testimonials`);
}

check();
