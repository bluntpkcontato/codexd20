"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Bot, X, Send, Sparkles, MessageCircle } from "lucide-react";

export function DndChatbot({ characterContext }: { characterContext?: string }) {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: '/api/chat',
    body: {
      characterContext
    }
  });

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, error]);

  const suggestions = [
    "O que meu personagem pode fazer?",
    "Explique vantagem e desvantagem",
    "Como funciona descanso curto?",
    "Dicas de combate pro meu nível",
  ];

  return (
    <>
      {/* Botão Flutuante */}
      <button 
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_25px_rgba(201,168,76,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        style={{ background: "linear-gradient(135deg, #7c3aed, #c9a84c)" }}
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Janela do Chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] max-h-[75vh] flex flex-col bg-[#0a0a14]/98 backdrop-blur-xl border border-[#c9a84c]/25 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] overflow-hidden"
          style={{ animation: "slideUp 0.2s ease-out" }}>
          
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c9a84c]/15" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(201,168,76,0.1))" }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-[#c9a84c] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-white text-sm">Sábio Códice</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">IA • D&D 5e • Gemini</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && !error && (
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-[#c9a84c]/20 border border-purple-500/20 flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                  <p className="text-sm text-gray-400">Saudações, aventureiro!</p>
                  <p className="text-[11px] text-gray-600">Pergunte sobre regras, magias, combate ou seu personagem.</p>
                </div>
                {/* Sugestões rápidas */}
                <div className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        const fakeEvent = { target: { value: s } } as React.ChangeEvent<HTMLInputElement>;
                        handleInputChange(fakeEvent);
                        setTimeout(() => {
                          const form = document.getElementById('chatbot-form') as HTMLFormElement;
                          form?.requestSubmit();
                        }, 50);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-xs text-gray-400 hover:text-white hover:bg-white/5 hover:border-[#c9a84c]/30 transition-all"
                    >
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-[#c9a84c] to-[#9c8033] text-black rounded-br-sm font-medium shadow-md' 
                    : 'bg-white/[0.06] text-gray-200 rounded-bl-sm border border-white/5'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-white/[0.06] text-gray-400 rounded-bl-sm border border-white/5 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl px-4 py-3 text-xs bg-red-950/40 text-red-400 rounded-bl-sm border border-red-500/30 space-y-1">
                  <p className="font-bold">⚠️ Erro de Conexão</p>
                  <p>{error.message || "Não foi possível contactar o Sábio Códice."}</p>
                  <button onClick={() => reload()} className="text-[10px] text-red-300 underline hover:text-red-200">Tentar novamente</button>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form id="chatbot-form" onSubmit={handleSubmit} className="px-3 py-2.5 border-t border-[#c9a84c]/15 flex gap-2" style={{ background: "rgba(0,0,0,0.4)" }}>
            <input 
              value={input}
              onChange={handleInputChange}
              placeholder="Pergunte ao Sábio..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9a84c]/50 transition-colors placeholder:text-gray-600"
            />
            <button type="submit" disabled={!(input || "").trim() || isLoading} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #9c8033, #c9a84c)" }}>
              <Send className="w-4 h-4 text-black ml-0.5" />
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
