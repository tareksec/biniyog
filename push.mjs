import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Stage all changes
  execSync('git add .', { stdio: 'pipe' });
  
  // Try to commit (this might throw if nothing to commit, which is fine)
  try {
    execSync('git commit -m "Auto-commit from Antigravity IDE: Homepage Reviews"', { stdio: 'pipe' });
  } catch (e) {
    // Ignore error if there's nothing to commit
  }
  
  // Push with the token
  const result = execSync('git push https://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@github.com/tareksec/biniyog.git HEAD', { stdio: 'pipe' });
  
  // Write a success file so we can verify it ran
  fs.writeFileSync('git_push_status.txt', 'SUCCESS\n' + result.toString());
} catch (e) {
  let errorMsg = e.message;
  if (e.stderr) errorMsg += '\nSTDERR:\n' + e.stderr.toString();
  if (e.stdout) errorMsg += '\nSTDOUT:\n' + e.stdout.toString();
  fs.writeFileSync('git_push_status.txt', 'ERROR:\n' + errorMsg);
}
