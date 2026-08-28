import { execSync } from 'child_process';
import fs from 'fs';

const repoUrl = 'https://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@github.com/tareksec/biniyog.git';

try {
  // Stage all changes
  execSync('git add .', { stdio: 'pipe' });
  
  // Try to commit
  try {
    execSync('git commit -m "feat: Restrict review submission to authenticated users and make feedback mandatory"', { stdio: 'pipe' });
  } catch (e) {}
  
  // Pull remote changes (merge commit style, no rebase to avoid rewriting history)
  try {
    execSync(`git pull ${repoUrl} main --no-rebase`, { stdio: 'pipe' });
  } catch (e) {
    let errorMsg = e.message;
    if (e.stderr) errorMsg += '\nSTDERR:\n' + e.stderr.toString();
    if (e.stdout) errorMsg += '\nSTDOUT:\n' + e.stdout.toString();
    fs.writeFileSync('git_push_status.txt', 'PULL ERROR:\n' + errorMsg);
    process.exit(0);
  }

  // Push
  const result = execSync(`git push ${repoUrl} HEAD`, { stdio: 'pipe' });
  
  fs.writeFileSync('git_push_status.txt', 'SUCCESS\n' + result.toString());
} catch (e) {
  let errorMsg = e.message;
  if (e.stderr) errorMsg += '\nSTDERR:\n' + e.stderr.toString();
  if (e.stdout) errorMsg += '\nSTDOUT:\n' + e.stdout.toString();
  fs.writeFileSync('git_push_status.txt', 'ERROR:\n' + errorMsg);
}
