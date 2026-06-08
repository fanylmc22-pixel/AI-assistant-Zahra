async function run() {
  const payload = { text: 'bonjour', lang: 'fr' };
  const res = await fetch('http://localhost:3000/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log('Status', res.status);
  const data = await res.json();
  console.log('Got audio?', !!data.audio);
}
run();
