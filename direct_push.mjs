import { execSync } from 'child_process';
import fs from 'fs';

const token = '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';
const repoUrl = `https://${token}@github.com/tareksec/biniyog.git`;
const authUrl = `https://x-access-token:${token}@github.com/tareksec/biniyog.git`;

try {
  console.log('Pushing...');
  const out = execSync(`git -c credential.helper= push ${authUrl} main`, {
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    stdio: 'pipe',
    timeout: 30000
  });
  console.log('Success:', out.toString());
  fs.writeFileSync('git_push_status.txt', 'SUCCESS:\n' + out.toString());
} catch (err) {
  const msg = (err.stdout ? err.stdout.toString() : '') + '\n' + (err.stderr ? err.stderr.toString() : '') + '\n' + err.message;
  console.error('Push failed:', msg);
  fs.writeFileSync('git_push_status.txt', 'PUSH ERROR:\n' + msg);
}
