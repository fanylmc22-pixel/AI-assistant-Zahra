import { exec } from 'child_process';
const proc = exec('npm run dev');
proc.stdout.on('data', console.log);
proc.stderr.on('data', console.error);
setTimeout(() => {
   proc.kill();
   console.log('killed');
}, 5000);
