import { spawn } from 'child_process';
const server = spawn('npx', ['tsx', 'server.ts'], { stdio: 'pipe' });

server.stdout.on('data', (d) => process.stdout.write('[server] ' + d));
server.stderr.on('data', (d) => process.stderr.write('[server err] ' + d));

setTimeout(async () => {
    try {
        console.log('Sending chat post request...');
        const res = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({messages: [{role: 'user', text: 'bonjour'}]})
        });
        console.log('Chat response status:', res.status);
        console.log('Chat response body:', await res.text());

        console.log('Sending tts post request...');
        const ttsRes = await fetch('http://localhost:3000/api/tts', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: 'bonjour', lang: 'fr'})
        });
        console.log('TTS response status:', ttsRes.status);
    } catch (e: any) {
        console.error('Fetch error:', e.message);
    }
    server.kill();
}, 2000);
