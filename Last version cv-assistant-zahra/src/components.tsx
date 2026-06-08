import { Message, Language } from './types';
import { Send, Mic, Volume2, Plus, RotateCcw, ArrowRight } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';

const AVATAR_URL = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250&h=250';

export function VoiceTab({ 
  onAskQuestion,
  isGenerating,
  lang,
  setLang,
  onStartListening,
  isListening,
  isSpeaking
}: { 
  onAskQuestion: (q: string) => void,
  isGenerating: boolean,
  lang: Language,
  setLang: (l: Language) => void,
  onStartListening: () => void,
  isListening: boolean,
  isSpeaking: boolean
}) {
  const suggestions = lang === 'en' 
    ? ["What is Fany's current role?", "What are her key skills?"]
    : ["Quel est le poste actuel de Fany ?", "Quelles sont ses compétences ?"];

  return (
    <div className="flex flex-col flex-1 items-center px-4 pt-10 pb-4 w-full h-full max-w-md mx-auto">
      <div className="inline-flex items-center gap-2 bg-[#fbe2ec] text-[#b33166] px-4 py-1.5 rounded-full font-semibold text-[13.5px] mb-8 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-[#c01a62] animate-dotpulse shadow-sm"></div>
        {lang === 'en' ? 'Active Listening' : 'Écoute active'}
      </div>

      <h1 className="text-center font-bold text-[34px] leading-[1.05] text-[#5b5052] mb-5 tracking-tight px-2">
        {lang === 'en' ? (
          <>I am Zahra, Fany's assistant, <br/><span className="text-[#c01a62]">how can I help you?</span></>
        ) : (
          <>Je suis Zahra, l'assistante de Fany, <br/><span className="text-[#c01a62]">comment vous aider ?</span></>
        )}
      </h1>
      
      <p className="text-center font-medium text-[15.5px] leading-[1.4] text-[#8e8286] mb-8 px-6">
        {lang === 'en' 
          ? "Ask me anything about Fany's career, skills or experience."
          : "Demandez-moi n'importe quoi sur le parcours, les compétences ou l'expérience de Fany."}
      </p>

      <div className="w-full bg-white/90 backdrop-blur-sm rounded-[32px] p-6 pb-4 flex flex-col items-center mt-2 shadow-[0_12px_44px_rgba(150,70,100,0.06)] border border-[#785a64]/5">
        
        <div className="relative w-28 h-28 flex items-center justify-center my-2">
          {(!isGenerating) && (
            <>
              <div className="absolute inset-0 rounded-full animate-ripple border-[1.5px] border-[#c01a62]/20 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full animate-ripple-delay-1 border-[1.5px] border-[#c01a62]/20 pointer-events-none"></div>
            </>
          )}

          <button 
            onClick={onStartListening}
            className={`relative z-10 w-[84px] h-[84px] rounded-full text-white shadow-[0_12px_28px_rgba(192,26,98,0.35)] flex items-center justify-center transition-transform active:scale-95 ${(isGenerating || isListening || isSpeaking) ? 'animate-orbpulse' : ''}`}
            style={{
              background: isSpeaking 
                ? 'radial-gradient(circle at 35% 30%, #fbb9d2, #c01a62 70%, #9c1551)' 
                : 'radial-gradient(circle at 35% 30%, #f6a7c6, #d23f80 65%, #c01a62)'
            }}
          >
            {isGenerating ? (
              <div className="flex gap-1.5 h-full items-center">
                <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.18s' }}></span>
                <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.36s' }}></span>
              </div>
            ) : isListening ? (
              <Mic size={30} strokeWidth={2.2} className="text-white animate-pulse drop-shadow-sm" />
            ) : isSpeaking ? (
              <Volume2 size={30} strokeWidth={2.5} className="text-white drop-shadow-sm" />
            ) : (
              <Mic className="text-white fill-white/10" strokeWidth={2.2} size={30} />
            )}
          </button>
        </div>

        <div className="text-[14px] text-[#a09497] font-semibold mt-4 mb-4 text-center">
          {isGenerating ? (lang === 'en' ? 'Thinking...' : 'Réflexion...') 
            : isListening ? (lang === 'en' ? 'Listening... Tap to stop' : 'Écoute en cours... Toucher pour arrêter')
            : isSpeaking ? (lang === 'en' ? 'Speaking... Tap to interrupt' : 'Je parle... Toucher pour interrompre')
            : (lang === 'en' ? 'Tap to start conversation' : 'Démarrer la conversation')}
        </div>

        {/* Custom Toggle inside card */}
        <div className="flex bg-[#f2e8ec] rounded-[24px] p-1.5 w-full mt-2">
          <button 
            onClick={() => setLang('en')}
            className={`flex-1 py-3 rounded-[20px] text-[15px] font-bold transition-all duration-300 ${lang === 'en' ? 'bg-white text-[#4f494b] shadow-sm' : 'text-[#8e8286] hover:text-[#4f494b]'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('fr')}
            className={`flex-1 py-3 rounded-[20px] text-[15px] font-bold transition-all duration-300 ${lang === 'fr' ? 'bg-white text-[#4f494b] shadow-sm' : 'text-[#8e8286] hover:text-[#4f494b]'}`}
          >
            Français
          </button>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col justify-end mt-4 gap-3.5 px-1 pb-4">
        {suggestions.map((s, i) => (
          <button 
            key={i}
            onClick={() => onAskQuestion(s)}
            className="w-full text-left bg-white/80 backdrop-blur-md px-6 py-[18px] rounded-[20px] text-[15.5px] font-semibold text-[#5c5052] shadow-[0_8px_20px_rgba(150,80,110,0.04)] border border-[#785a64]/5 transition-transform active:scale-[0.98]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ChatTab({
  messages,
  sendMessage,
  isGenerating,
  onClear,
  lang,
  onStartListening,
  isListening,
  onSpeak,
  isSpeaking
}: {
  messages: Message[],
  sendMessage: (text: string) => void,
  isGenerating: boolean,
  onClear: () => void,
  lang: Language,
  onStartListening: () => void,
  isListening: boolean,
  onSpeak: (text: string) => void,
  isSpeaking: boolean
}) {
  const [inputVal, setInputVal] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isGenerating) {
      sendMessage(inputVal.trim());
      setInputVal('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent w-full max-w-md mx-auto relative pt-4 pb-0">
      
      {messages.length > 0 && (
        <div className="flex justify-center mb-6 mt-2 relative z-10">
          <button 
            onClick={onClear}
            className="inline-flex items-center gap-2 bg-[#fbe2ec] text-[#b33166] font-bold text-[13.5px] px-5 py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5}/>
            {lang === 'en' ? 'New question' : 'Nouvelle question'}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full px-5 flex flex-col gap-5 pb-[120px] no-scrollbar">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-3 max-w-[95%] ${isUser ? 'self-end justify-end' : 'self-start justify-start'}`}>
              {!isUser && (
                <div className="flex-none flex flex-col justify-end pb-1">
                  <img 
                    src={AVATAR_URL} 
                    alt="Zahra" 
                    className="w-8 h-8 rounded-full object-cover shadow-sm" 
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className={`px-5 py-4 text-[15.5px] leading-[1.45] font-medium tracking-[-0.01em] ${
                  isUser 
                    ? 'bg-[#c01a62] text-white rounded-[24px] rounded-br-[8px] shadow-sm max-w-full inline-block text-left' 
                    : 'bg-white text-[#4f494b] rounded-[24px] rounded-bl-[8px] shadow-[0_8px_20px_rgba(150,80,110,0.06)] border border-[#785a64]/5 max-w-full inline-block text-left'
                }`}>
                  {msg.text}
                </div>
                {!isUser && (
                  <button 
                    onClick={() => onSpeak(msg.text)}
                    className="self-start ml-2 w-[28px] h-[28px] flex-none bg-[#fbe2ec] rounded-full flex items-center justify-center text-[#c01a62] hover:opacity-80 active:scale-90 transition-transform"
                    title={lang === 'en' ? "Read aloud" : "Lire à voix haute"}
                  >
                    <Volume2 size={13} strokeWidth={2.5}/>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3 max-w-[85%] self-start justify-start">
             <div className="flex-none flex flex-col justify-end pb-1">
                <img 
                  src={AVATAR_URL} 
                  alt="Zahra" 
                  className="w-8 h-8 rounded-full object-cover shadow-sm" 
                />
              </div>
            <div className="px-5 py-5 rounded-[24px] rounded-bl-[8px] bg-white shadow-[0_8px_20px_rgba(150,80,110,0.06)] border border-[#785a64]/5 flex gap-1.5 items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8a3c0] animate-bounce"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8a3c0] animate-bounce" style={{ animationDelay: '0.18s' }}></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8a3c0] animate-bounce" style={{ animationDelay: '0.36s' }}></span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Bar overlay */}
      <div className="absolute bottom-2 left-0 w-full px-4 pt-10 bg-gradient-to-t from-[#fdf5f2] via-[#fdf5f2]/90 to-transparent flex items-center gap-3">
        {/* Floating Mic Button */}
        <button 
          type="button"
          onClick={onStartListening}
          className={`flex-none w-[52px] h-[52px] rounded-full text-white flex items-center justify-center shadow-[0_8px_20px_rgba(192,26,98,0.25)] transition-transform active:scale-95 ${isListening ? 'animate-orbpulse' : ''}`}
          title={isListening ? (lang === 'en' ? 'Tap to stop' : 'Cliquer pour arrêter') : ''}
          style={{
            background: isSpeaking ? 'radial-gradient(circle at 35% 30%, #fbb9d2, #c01a62 70%, #9c1551)' : 'radial-gradient(circle at 35% 30%, #ec8cb2, #d23f80 65%, #c01a62)'
          }}
        >
          {isListening ? (
             <div className="flex items-center justify-center w-full h-full relative" title={lang === 'en' ? 'Tap to stop & send' : 'Toucher pour arrêter et envoyer'}>
               <Mic size={22} strokeWidth={2.5} className="text-white animate-pulse" />
               <div className="absolute w-[18px] h-[18px] rounded-[4px] border-2 border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-50"></div>
             </div>
          ) : isSpeaking ? (
             <Volume2 size={22} strokeWidth={2.5} className="text-white" />
          ) : (
             <Mic size={22} strokeWidth={2.5} className="fill-white/20"/>
          )}
        </button>

        {/* Pill Input */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center bg-white rounded-full p-1.5 shadow-[0_8px_24px_rgba(150,80,110,0.08)] border border-[#785a64]/5 h-[52px]">
          <input 
            type="text" 
            placeholder={lang === 'en' ? "Ask something about Fany..." : "Une question sur le CV de Fany..."}
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isGenerating}
            className="flex-1 border-none outline-none bg-transparent font-sans text-[15px] font-medium text-[#4f494b] placeholder-[#b7a9ad] min-w-0 px-4"
          />
          <button 
            type="submit" 
            disabled={isGenerating || !inputVal.trim()}
            className="flex-none w-10 h-10 rounded-full bg-[#fbe2ec] text-[#c01a62] flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
          >
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

export function HistoryTab({ messages, lang }: { messages: Message[], lang: Language }) {
  const customHistory = messages.filter(m => m.role === 'user');
  
  return (
    <div className="p-6 pt-8 max-w-md w-full mx-auto">
      <h2 className="text-[26px] font-bold text-[#4f494b] mb-6 tracking-tight">
        {lang === 'en' ? 'Your questions' : 'Vos questions'}
      </h2>
      
      {customHistory.length === 0 ? (
        <div className="text-[15px] leading-[1.5] text-[#9a8d91] p-5 rounded-[18px] text-center">
          {lang === 'en' ? 'No history yet.' : 'Aucun historique enregistré pour le moment.'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {customHistory.map((m, i) => (
             <div key={i} className="flex items-center gap-4 bg-white rounded-[20px] px-5 py-4 shadow-[0_6px_16px_rgba(150,80,110,0.04)] border border-[#785a64]/5">
               <RotateCcw size={18} strokeWidth={2.5} className="text-[#c01a62] flex-none" />
               <span className="font-semibold text-[15.5px] text-[#5b5052] truncate">
                 {m.text}
               </span>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsTab({ 
  lang, 
  setLang, 
  onClear 
}: { 
  lang: Language, 
  setLang: (l: Language) => void,
  onClear: () => void 
}) {
  return (
    <div className="p-6 pt-8 max-w-md w-full mx-auto flex flex-col h-full">
      <h2 className="text-[26px] font-bold text-[#4f494b] mb-6 tracking-tight">
        {lang === 'en' ? 'Settings' : 'Réglages'}
      </h2>
      
      <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_20px_rgba(150,80,110,0.04)] border border-[#785a64]/5 mb-4">
         <div className="text-[12.5px] font-bold text-[#a4969a] uppercase tracking-widest mb-4">
           {lang === 'en' ? 'Response Language' : 'Langue des réponses'}
         </div>
         
         {/* Toggle inside settings */}
         <div className="flex bg-[#f2e8ec] rounded-[24px] p-1.5 w-full">
          <button 
            onClick={() => setLang('en')}
            className={`flex-1 py-3 rounded-[20px] text-[15px] font-bold transition-all duration-300 ${lang === 'en' ? 'bg-white text-[#4f494b] shadow-sm' : 'text-[#8e8286] hover:text-[#4f494b]'}`}
          >
            English
          </button>
          <button 
            onClick={() => setLang('fr')}
            className={`flex-1 py-3 rounded-[20px] text-[15px] font-bold transition-all duration-300 ${lang === 'fr' ? 'bg-white text-[#4f494b] shadow-sm' : 'text-[#8e8286] hover:text-[#4f494b]'}`}
          >
            Français
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_20px_rgba(150,80,110,0.04)] border border-[#785a64]/5 mb-6">
         <div className="text-[12.5px] font-bold text-[#a4969a] uppercase tracking-widest mb-4">
           {lang === 'en' ? 'About Zahra' : 'À propos de Zahra'}
         </div>
         <p className="text-[15.5px] leading-[1.55] font-medium text-[#6c6164]">
           {lang === 'en' 
             ? "Zahra answers questions about Fany Louis-Mondésir's CV and career path."
             : "Zahra répond aux questions sur le CV et le parcours de Fany Louis-Mondésir."}
         </p>
      </div>

      <button 
        onClick={onClear}
        className="w-full bg-[#fbe2ec] text-[#c01a62] font-bold text-[16px] py-[18px] rounded-[22px] shadow-sm active:scale-[0.98] transition-transform mt-auto mb-4"
      >
        {lang === 'en' ? 'Clear conversation' : 'Effacer la conversation'}
      </button>
    </div>
  );
}
