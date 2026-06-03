import { exec } from 'child_process';
const proc = exec('npm run dev');
proc.stdout.on('data', (d) => process.stdout.write(d));
proc.stderr.on('data', (d) => process.stderr.write(d));
// Keep the process running for 5s to see output
setTimeout(() => proc.kill(), 5000);
