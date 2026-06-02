import React, { useState, useEffect, useRef } from 'react';
import { Message, TabState, Language } from './types';
import { VoiceTab, ChatTab, HistoryTab, SettingsTab } from './components';
import { MessageCircle, Mic, RotateCcw, Settings, Type } from 'lucide-react';

const AVATAR_URL = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabState>('voice');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lang, setLang] = useState<Language>('fr');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakText = async (text: string, currentLang: Language) => {
    const cleanText = text.replace(/[*#_]/g, '');
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: cleanText })
      });
      if (!res.ok) throw new Error("TTS API Error");
      const data = await res.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        await audio.play();
        return;
      }
      throw new Error("No audio payload from server");
    } catch (err) {
      // Gemini TTS unavailable, falling back to browser synthesis.
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = currentLang === 'fr' ? 'fr-FR' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => 
        v.lang.startsWith(currentLang === 'fr' ? 'fr' : 'en') && 
        (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'))
      );
      if (preferred) utterance.voice = preferred;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'fr' ? "La reconnaissance vocale n'est pas supportée. (Utilisez Chrome)" : "Speech recognition not supported (use Chrome).");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim());
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);
    setIsGenerating(true);

    try {
      const payloadMessages = [...messages, newUserMsg];
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });
      
      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(`Server returned invalid response: ${textResponse || 'Empty response'}`);
      }
      
      if (!res.ok) {
         throw new Error(data.error || "Server error");
      }
      if (data.error) {
         throw new Error(data.error);
      }

      const resText = data.text || "Désolé, je ne sais pas quoi répondre.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'zahra',
        text: resText
      }]);
      await speakText(resText, lang);
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        // AI API Quota Exceeded. Using fallback text.
      } else {
        // Chat API fallback triggered
      }
      const errText = "Je rencontre un léger problème technique. Fany est une Chargée de Marketing Digital talentueuse avec de l'expérience chez LexisNexis. Contactez-la à flouismondesir@hotmail.com !";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'zahra',
        text: errText
      }]);
      await speakText(errText, lang);
    } finally {
      setIsGenerating(false);
    }
  };

  const navItems = [
    { id: 'chat', icon: MessageCircle, label_fr: 'Chat', label_en: 'Chat' },
    { id: 'voice', icon: Mic, label_fr: 'Voix', label_en: 'Voice' },
    { id: 'history', icon: RotateCcw, label_fr: 'Historique', label_en: 'History' },
    { id: 'settings', icon: Settings, label_fr: 'Réglages', label_en: 'Settings' }
  ] as const;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e9e4e6] sm:p-6 font-sans text-[#4f494b] selection:bg-accent/20">
      
      <div className="relative w-full h-[100dvh] sm:h-[852px] sm:max-h-[min(100vh,852px)] sm:w-[393px] bg-gradient-to-b from-[#f9dde7] via-[#fdf4f1] to-[#f8dae5] flex flex-col overflow-hidden sm:rounded-[42px] shadow-[0_30px_80px_rgba(120,40,70,0.18)]">
        
        {/* Header */}
        <header className="flex-none grid grid-cols-[44px_1fr_44px] items-center px-5 py-[14px] bg-white/40 border-b border-[#785a64]/5 backdrop-blur-md z-20">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'fr' : 'en')}
            className="w-10 h-10 -ml-1 rounded-[14px] flex items-center justify-center text-[#4f494b] hover:bg-black/5 active:bg-black/10 transition-colors"
          >
             <Type size={22} className="opacity-80" strokeWidth={2} />
          </button>
          
          <h1 className="text-center font-bold text-[20px] text-[#4f494b] tracking-[-0.015em] m-0">
            Zahra
          </h1>
          
          <div className="flex justify-end pr-0.5">
             <img src={AVATAR_URL} alt="Fany" className="w-[42px] h-[42px] rounded-full object-cover shadow-[0_0_0_2px_#fff,_0_4px_12px_rgba(160,60,100,0.15)]" />
          </div>
        </header>

        {/* Dynamic App Body */}
        <main className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar z-10 w-full h-full bg-transparent">
          {currentTab === 'voice' && (
            <VoiceTab 
              onAskQuestion={sendMessage} 
              isGenerating={isGenerating} 
              lang={lang} 
              setLang={setLang}
              onStartListening={startListening}
              isListening={isListening}
              isSpeaking={isSpeaking}
            />
          )}
          
          {currentTab === 'chat' && (
            <ChatTab 
              messages={messages} 
              sendMessage={sendMessage} 
              isGenerating={isGenerating} 
              onClear={() => setMessages([])} 
              lang={lang}
              onStartListening={startListening}
              isListening={isListening}
              onSpeak={(text) => speakText(text, lang)}
              isSpeaking={isSpeaking}
            />
          )}

          {currentTab === 'history' && (
             <HistoryTab messages={messages} lang={lang} />
          )}

          {currentTab === 'settings' && (
             <SettingsTab 
                lang={lang} 
                setLang={setLang} 
                onClear={() => setMessages([])} 
             />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="flex-none grid grid-cols-4 px-2 pt-3 pb-safe bg-[#fdf6f3]/95 border-t border-[#785a64]/10 backdrop-blur-xl z-20 pb-[max(env(safe-area-inset-bottom),14px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isOn = currentTab === item.id;
            const label = lang === 'en' ? item.label_en : item.label_fr;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id as TabState)}
                className={`flex flex-col items-center gap-1.5 py-2 transition-colors ${isOn ? 'text-[#c01a62]' : 'text-[#a4969a]'}`}
              >
                <Icon size={24} strokeWidth={isOn ? 2.5 : 2} className={isOn ? 'drop-shadow-sm scale-110 transition-transform' : 'transition-transform'} />
                <span className={`text-[12px] tracking-tight ${isOn ? 'font-bold' : 'font-semibold'}`}>{label}</span>
              </button>
            )
          })}
        </nav>

      </div>
    </div>
  );
}
