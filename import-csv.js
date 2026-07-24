import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. Simple CSV parser that handles quotes and newlines
function parseCSV(text) {
  const result = [];
  let row = [];
  let inQuotes = false;
  let val = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i+1] === '"') {
          val += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        val += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(val);
        val = '';
      } else if (char === '\n' || char === '\r') {
        row.push(val);
        // Only push non-empty rows
        if (row.some(r => r.trim() !== '')) {
          result.push(row);
        }
        row = [];
        val = '';
        if (char === '\r' && text[i+1] === '\n') i++;
      } else {
        val += char;
      }
    }
  }
  if (val || row.length > 0) {
    row.push(val);
    if (row.some(r => r.trim() !== '')) {
      result.push(row);
    }
  }
  return result;
}

// Helper to escape SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  // Escape single quotes by doubling them
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Helper to generate a slug that supports Bengali/Unicode characters
function generateSlug(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Keep Unicode letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-')              // Replace spaces with hyphens
    .replace(/-+/g, '-')               // Remove consecutive hyphens
    .trim();
  
  return slug || `opp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Map CSV statuses to the dashboard's accepted statuses
function mapStatus(rawStatus) {
  const s = (rawStatus || '').trim();
  if (s.includes('চলমান')) return 'বিনিয়োগ নেওয়া চলমান-সুযোগ আছে';
  if (s.includes('শেষের দিকে')) return 'বিনিয়োগ নেওয়া শেষের দিকে';
  if (s.includes('সামনে আবার শুরু হবে')) return 'বিনিয়োগ নেওয়া শেষ-সামনে আবার শুরু হবে';
  if (s.includes('pending') || s.includes('Pending')) return 'পেন্ডিং';
  return 'বিনিয়োগ নেওয়া চলমান-সুযোগ আছে'; // Default fallback
}

function run() {
  console.log("Reading CSV...");
  const csvContent = fs.readFileSync('src/data/Webiste For data  .csv', 'utf-8');
  
  // Parse CSV
  const rows = parseCSV(csvContent);
  const dataRows = rows.slice(1);
  
  console.log(`Found ${dataRows.length} opportunity records.`);
  
  let sql = '-- Generated Seed Data for Opportunities\n\n';
  
  for (const row of dataRows) {
    if (row.length < 15) continue;
    
    const name = row[0] ? row[0].trim() : '';
    if (!name) continue;
    
    const slug = generateSlug(name);
    const owner_name = row[1] ? row[1].trim() : null;
    const owner_phone = row[2] ? row[2].trim() : null;
    const cfa_comment = row[3] ? row[3].trim() : null;
    const guarantee = row[4] ? row[4].trim() : null;
    const category = row[5] ? row[5].trim() : null;
    const bank_details = row[6] ? row[6].trim() : null;
    const investment_type = row[7] ? row[7].trim() : null;
    const investment_amount = row[8] ? row[8].trim() : null;
    const expected_profit = row[9] ? row[9].trim() : null;
    const profit_period = row[10] ? row[10].trim() : null;
    const status = mapStatus(row[11]);
    const description = row[12] ? row[12].trim() : null;
    const address = row[13] ? row[13].trim() : null;
    const organization_type = row[14] ? row[14].trim() : null;
    const estimated_capital = row[15] ? row[15].trim() : null;
    const website_url = row[16] ? row[16].trim() : null;
    const image_url = row[17] ? row[17].trim() : null;
    
    const values = `(${escapeSql(slug)}, ${escapeSql(name)}, ${escapeSql(owner_name)}, ${escapeSql(owner_phone)}, ${escapeSql(cfa_comment)}, ${escapeSql(guarantee)}, ${escapeSql(category)}, ${escapeSql(bank_details)}, ${escapeSql(investment_type)}, ${escapeSql(investment_amount)}, ${escapeSql(expected_profit)}, ${escapeSql(profit_period)}, ${escapeSql(status)}, ${escapeSql(description)}, ${escapeSql(address)}, ${escapeSql(organization_type)}, ${escapeSql(estimated_capital)}, ${escapeSql(website_url)}, ${escapeSql(image_url)})`;
    
    sql += `INSERT INTO public.opportunities (slug, name, owner_name, owner_phone, cfa_comment, guarantee, category, bank_details, investment_type, investment_amount, expected_profit, profit_period, status, description, address, organization_type, estimated_capital, website_url, image_url) VALUES ${values};\n\n`;
  }
  
  fs.writeFileSync('seed.sql', sql, 'utf-8');
  console.log("🎉 Successfully generated seed.sql!");
  console.log("Please copy the contents of seed.sql and paste it into the Supabase SQL Editor to run it.");
}

run();
