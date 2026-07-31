/**
 * Database Audit Script — queries the LIVE Supabase database
 * to verify schema integrity for Phase 1 audit.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dfblfoyjhxhxmnckyspa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3y9kJ9oUgbFvz1HNBrR-uA_b2Nz2KDp';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function audit() {
  console.log('=== DATABASE AUDIT ===\n');

  // 1. Check each table exists by trying to SELECT from it
  const tables = [
    'opportunities',
    'testimonials',
    'homepage_reviews',
    'opportunity_risks',
    'opportunity_payouts',
    'opportunity_legal_checks',
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`X ${table}: ERROR - ${error.message}`);
    } else {
      const cols = data && data.length > 0 ? Object.keys(data[0]) : '(empty table)';
      console.log(`OK ${table}: exists, columns=${JSON.stringify(cols)}`);
    }
  }

  // 2. Check opportunities columns in detail
  console.log('\n=== OPPORTUNITIES SCHEMA CHECK ===');
  const { data: opps, error: oppErr } = await supabase
    .from('opportunities')
    .select('*')
    .limit(1);
  
  if (oppErr) {
    console.log('X Cannot fetch opportunities:', oppErr.message);
  } else if (opps && opps.length > 0) {
    const cols = Object.keys(opps[0]);
    console.log('Columns present:', cols);
    
    const required = [
      'image_urls', 'status', 'category', 'owner_phone',
      'cfa_comment', 'guarantee', 'bank_details', 'slug',
      'investment_amount', 'expected_profit', 'profit_period',
      'organization_type', 'estimated_capital', 'address',
      'investment_type', 'website_url', 'owner_name', 'description'
    ];
    for (const col of required) {
      console.log(`  ${cols.includes(col) ? 'OK' : 'MISSING'} ${col}`);
    }
    
    const sampleImgUrls = opps[0].image_urls;
    console.log(`  image_urls type: ${typeof sampleImgUrls}, isArray: ${Array.isArray(sampleImgUrls)}, value: ${JSON.stringify(sampleImgUrls)}`);
    console.log(`  status value: "${opps[0].status}"`);
    
    if (cols.includes('image_url')) {
      console.log('  WARN OLD image_url column still exists!');
    } else {
      console.log('  OK Old image_url column removed');
    }
  } else {
    console.log('WARN opportunities table is empty');
  }

  // 3. Get all opportunity statuses
  console.log('\n=== ALL OPPORTUNITY STATUSES ===');
  const { data: allOpps } = await supabase
    .from('opportunities')
    .select('id, name, status');
  
  if (allOpps) {
    const statuses = new Set(allOpps.map(o => o.status));
    console.log('Unique statuses:', [...statuses]);
    console.log(`Total opportunities: ${allOpps.length}`);
  }

  // 4. Check for orphaned FK rows
  console.log('\n=== ORPHANED FK CHECK ===');
  const oppIds = new Set((allOpps || []).map(o => o.id));
  
  for (const subTable of ['opportunity_risks', 'opportunity_payouts', 'opportunity_legal_checks']) {
    const { data: subData } = await supabase.from(subTable).select('id, opportunity_id');
    if (subData && subData.length > 0) {
      const orphaned = subData.filter(r => !oppIds.has(r.opportunity_id));
      if (orphaned.length > 0) {
        console.log(`WARN ${subTable}: ${orphaned.length} orphaned rows`);
      } else {
        console.log(`OK ${subTable}: ${subData.length} rows, no orphans`);
      }
    } else {
      console.log(`OK ${subTable}: 0 rows (empty)`);
    }
  }

  // 5. Check testimonials expanded columns
  console.log('\n=== TESTIMONIALS SCHEMA CHECK ===');
  const { data: tests } = await supabase.from('testimonials').select('*').limit(1);
  if (tests && tests.length > 0) {
    const cols = Object.keys(tests[0]);
    console.log('Columns:', cols);
    const expectedCols = ['brand_name', 'related_opportunity_id', 'role_title', 'rating', 'avatar_url', 'investment_amount'];
    for (const col of expectedCols) {
      console.log(`  ${cols.includes(col) ? 'OK' : 'MISSING'} ${col}`);
    }
  } else {
    console.log('WARN testimonials table is empty');
  }

  // 6. Check homepage_reviews
  console.log('\n=== HOMEPAGE_REVIEWS SCHEMA CHECK ===');
  const { data: reviews } = await supabase.from('homepage_reviews').select('*').limit(1);
  if (reviews && reviews.length > 0) {
    const cols = Object.keys(reviews[0]);
    console.log('Columns:', cols);
    const expectedCols = ['name', 'location', 'quote', 'rating', 'avatar_url', 'sort_order'];
    for (const col of expectedCols) {
      console.log(`  ${cols.includes(col) ? 'OK' : 'MISSING'} ${col}`);
    }
  } else {
    console.log('WARN homepage_reviews table is empty');
  }

  // 7. RLS test - try to INSERT as anon (should fail)
  console.log('\n=== RLS INSERT TEST (should fail for anon) ===');
  for (const table of tables) {
    let testRow;
    if (table === 'opportunities') {
      testRow = { name: 'RLS_TEST', slug: 'rls-test-' + Date.now() };
    } else if (table === 'testimonials') {
      testRow = { name: 'RLS_TEST', quote: 'test' };
    } else if (table === 'homepage_reviews') {
      testRow = { name: 'RLS_TEST', quote: 'test' };
    } else if (table === 'opportunity_risks') {
      testRow = { opportunity_id: '00000000-0000-0000-0000-000000000000', risk_name: 'test', risk_level: 'low' };
    } else if (table === 'opportunity_payouts') {
      testRow = { opportunity_id: '00000000-0000-0000-0000-000000000000', cycle_name: 'test' };
    } else if (table === 'opportunity_legal_checks') {
      testRow = { opportunity_id: '00000000-0000-0000-0000-000000000000', check_text: 'test' };
    }

    const { data: insertData, error: insertErr } = await supabase
      .from(table)
      .insert(testRow)
      .select();
    
    if (insertErr) {
      console.log(`OK ${table}: INSERT blocked - ${insertErr.message.substring(0, 80)}`);
    } else {
      console.log(`FAIL ${table}: INSERT SUCCEEDED as anon!`);
      if (insertData && insertData.length > 0) {
        await supabase.from(table).delete().eq('id', insertData[0].id);
      }
    }
  }

  // 8. Storage
  console.log('\n=== STORAGE CHECK ===');
  const { data: files, error: fileErr } = await supabase.storage
    .from('opportunity-images')
    .list('', { limit: 5 });
  
  if (fileErr) {
    console.log('WARN Cannot list files:', fileErr.message);
  } else {
    console.log('Files in bucket (top 5):', files?.map(f => f.name));
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

audit().catch(console.error);
