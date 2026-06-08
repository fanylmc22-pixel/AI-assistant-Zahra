async function run() {
  const payload = { messages: [{ role: 'user', text: 'bonjour' }] };
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
