import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Stage all changes
  execSync('git add .', { stdio: 'ignore' });
  
  // Try to commit (this might throw if nothing to commit, which is fine)
  try {
    execSync('git commit -m "Auto-commit from Antigravity IDE"', { stdio: 'ignore' });
  } catch (e) {
    // Ignore error if there's nothing to commit
  }
  
  // Push with the token
  execSync('git push https://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@github.com/tareksec/biniyog.git HEAD', { stdio: 'ignore' });
  
  // Write a success file so we can verify it ran
  fs.writeFileSync('git_push_status.txt', 'SUCCESS');
} catch (e) {
  fs.writeFileSync('git_push_status.txt', 'ERROR: ' + e.message);
}
