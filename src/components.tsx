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
