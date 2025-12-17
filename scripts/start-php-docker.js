#!/usr/bin/env node
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const root = process.cwd();
const ps1 = path.join(root, 'backend', 'serve-php.ps1');
const sh = path.join(root, 'backend', 'serve-php.sh');

let cmd, args;

if (os.platform() === 'win32') {
  // Use PowerShell
  cmd = 'powershell';
  args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1];
} else {
  cmd = 'sh';
  args = [sh];
}

console.log('Starting PHP dev server via Docker...');
const p = spawn(cmd, args, { stdio: 'inherit' });

p.on('close', (code) => {
  console.log(`PHP server process exited with code ${code}`);
});
