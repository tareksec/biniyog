/**
 * compress-hero-images.mjs
 * 
 * Compresses the hero background images from MB-scale PNGs to optimized 
 * versions. Run this once before deploying:
 * 
 *   npx sharp-cli -i public/herouse.png -o public/herouse.webp -f webp -q 78 -- --resize 1920
 *   npx sharp-cli -i public/heromobile.png -o public/heromobile.webp -f webp -q 78 -- --resize 828
 * 
 * Or install sharp and run: node compress-hero-images.mjs
 */
import { existsSync, statSync, renameSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');
const backupDir = join(publicDir, '_originals');

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('sharp is not installed. Run: npm install --save-dev sharp');
    console.error('Or use the npx commands listed at the top of this file.');
    process.exit(1);
  }

  // Backup originals
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

  const tasks = [
    { input: 'herouse.png', output: 'herouse.png', maxWidth: 1920 },
    { input: 'heromobile.png', output: 'heromobile.png', maxWidth: 828 },
  ];

  for (const task of tasks) {
    const inputPath = join(publicDir, task.input);
    if (!existsSync(inputPath)) {
      console.log(`Skipping ${task.input} (not found)`);
      continue;
    }

    const inputSize = statSync(inputPath).size;
    console.log(`\n${task.input}: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);

    // Backup original
    const backupPath = join(backupDir, task.input);
    if (!existsSync(backupPath)) {
      copyFileSync(inputPath, backupPath);
      console.log(`  Backed up to ${backupPath}`);
    }

    // Optimize PNG in-place (resize + max compression)
    const tmpPath = inputPath + '.tmp';
    await sharp(inputPath)
      .resize({ width: task.maxWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(tmpPath);
    
    renameSync(tmpPath, inputPath);
    const newSize = statSync(inputPath).size;
    console.log(`  Optimized PNG: ${(newSize / 1024).toFixed(0)} KB (${((1 - newSize / inputSize) * 100).toFixed(1)}% smaller)`);
  }

  console.log('\nDone! Images optimized in-place. Originals backed up in public/_originals/');
}

main().catch(console.error);
