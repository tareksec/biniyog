import fs from 'fs';
import path from 'path';

// Using ES modules since vite.config.ts is usually module context
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, 'src', 'review', 'all review - Sheet1.csv');
const sqlFilePath = path.join(__dirname, 'testimonials_seed.sql');

if (fs.existsSync(csvFilePath)) {
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentCell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentCell);
          currentCell = '';
        } else if (char === '\n' || char === '\r') {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          currentRow.push(currentCell);
          rows.push(currentRow);
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
    }
    
    if (currentCell !== '' || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
    return rows;
  }

  const parsedRows = parseCSV(csvContent);
  const headers = parsedRows[0].map(h => h.trim());

  let sqlStatements = [];
  let totalReviews = 0;

  function escapeSql(str) {
    return str.replace(/'/g, "''");
  }

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) continue;

    for (let j = 0; j < headers.length; j++) {
      const brandName = headers[j];
      const quote = row[j] ? row[j].trim() : '';
      
      if (quote) {
        totalReviews++;
        const escapedBrand = escapeSql(brandName);
        const escapedQuote = escapeSql(quote);
        
        // Exact case-insensitive match
        const sql = `INSERT INTO testimonials (name, brand_name, quote, related_opportunity_id) VALUES ('বিনিয়োগকারী', '${escapedBrand}', '${escapedQuote}', (SELECT id FROM opportunities WHERE name ILIKE '${escapedBrand}' LIMIT 1));`;
        sqlStatements.push(sql);
      }
    }
  }

  fs.writeFileSync(sqlFilePath, sqlStatements.join('\n'));

  // Generate report
  const pubProjPath = path.join(__dirname, 'src', 'data', 'public-projects.json');
  const matchedBrands = new Set();
  const missingBrands = new Set();
  
  try {
    const pubProj = JSON.parse(fs.readFileSync(pubProjPath, 'utf-8'));
    const oppNames = pubProj.map(p => p.project_name.toLowerCase());
    
    headers.forEach(brand => {
      if (oppNames.includes(brand.toLowerCase())) {
        matchedBrands.add(brand);
      } else {
        missingBrands.add(brand);
      }
    });
    
    fs.writeFileSync(path.join(__dirname, 'csv_stats.json'), JSON.stringify({
      totalReviews,
      matchedBrands: Array.from(matchedBrands),
      missingBrands: Array.from(missingBrands)
    }));
  } catch (e) {
    console.error("Error reading public-projects.json", e);
  }
}
