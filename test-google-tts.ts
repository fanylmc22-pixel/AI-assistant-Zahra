import * as googleTTS from 'google-tts-api';

async function test() {
  const base64Audio = await googleTTS.getAudioBase64(
    "Bonjour c'est un test",
    {
      lang: 'fr',
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    }
  );
  console.log("Got audio?", !!base64Audio);
}
test().catch(console.error);
