"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Dices, Sword, Sparkles, ChevronRight, Star, Scroll } from "lucide-react";
import { supabase } from "@/lib/supabase";

const FLOATING_RUNES = ["✦", "⬡", "◈", "✧", "⋆", "◇", "⬢", "✦"];

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 0);
    supabase.auth.getSession().then((res: any) => {
      if (res?.data?.session) router.push("/dashboard");
    });
    return () => clearTimeout(timeoutId);
  }, [router]);

  const features = [
    { icon: <Sword className="w-6 h-6" />, title: "Ficha Jogável", desc: "Sua ficha vive. Rolle dados, controle HP, magias e inventário com um toque.", color: "#ef4444" },
    { icon: <Sparkles className="w-6 h-6" />, title: "Mestre Assistente IA", desc: "Um Dungeon Master digital que explica regras, cria personagens e gera histórias épicas.", color: "#a855f7" },
    { icon: <BookOpen className="w-6 h-6" />, title: "Grimório de Magias", desc: "Centenas de magias explicadas em português, com exemplos práticos para iniciantes.", color: "#3b82f6" },
    { icon: <Dices className="w-6 h-6" />, title: "Rolador Mágico", desc: "d4, d6, d8, d10, d12, d20 com vantagem, desvantagem e fórmulas personalizadas.", color: "#f59e0b" },
    { icon: <Scroll className="w-6 h-6" />, title: "Criador de Personagem", desc: "Um wizard guiado passo a passo, inspirado em Baldur's Gate 3.", color: "#10b981" },
    { icon: <Star className="w-6 h-6" />, title: "100% em Português", desc: "O primeiro app premium de RPG criado especialmente para jogadores brasileiros.", color: "#c9a84c" },
  ];

  return (
    <div className="min-h-screen bg-arcane-gradient relative overflow-hidden">

      {/* Floating Rune Particles */}
      {mounted && FLOATING_RUNES.map((rune, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none font-heading text-primary animate-float-slow"
          style={{
            left: `${10 + (i * 11)}%`,
            top: `${15 + (i % 3) * 25}%`,
            fontSize: `${1 + (i % 3) * 0.5}rem`,
            opacity: 0.04 + (i % 4) * 0.01,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${5 + i * 0.7}s`,
          }}
        >
          {rune}
        </div>
      ))}

      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)", filter: "blur(40px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.08), transparent 70%)", filter: "blur(50px)", animationDelay: "2s" }} />

      {/* Nav */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--grad-gold)" }}>
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <span className="font-heading font-black text-xl text-shimmer">CODEX D20</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/login")} className="btn-ghost-gold text-sm">
            Entrar
          </button>
          <button onClick={() => router.push("/register")} className="btn-gold text-sm">
            Começar Grátis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest"
              style={{ borderColor: "rgba(201,168,76,0.3)", background: "rgba(201,168,76,0.06)", color: "#c9a84c" }}>
              <Sparkles className="w-3 h-3" /> Seu Companheiro de Aventura em Português
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-none">
              <span className="text-gold-gradient">Abra o</span>
              <br />
              <span className="text-white">Códice.</span>
              <br />
              <span className="text-gold-gradient">Escreva</span>
              <br />
              <span className="text-white">sua Lenda.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              CODEX D20 é o companheiro definitivo para RPG de mesa em português.
              Crie personagens épicos, controle magias, role dados e receba ajuda da IA
              — tudo em uma única plataforma premium.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/register")}
                className="btn-gold text-base flex items-center justify-center gap-2"
              >
                Criar Personagem Grátis
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="btn-ghost-gold text-base flex items-center justify-center gap-2"
              >
                Já tenho conta
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { n: "14+", label: "Classes" },
                { n: "9+",  label: "Raças" },
                { n: "100%", label: "Português" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-heading font-black text-primary">{s.n}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-float-slow hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 0 80px rgba(124,58,237,0.3), 0 40px 80px rgba(0,0,0,0.8)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <img
                src="/codex_hero_banner_1782020844404.png"
                alt="CODEX D20 - Seu companheiro de aventuras"
                className="w-full object-cover"
                style={{ aspectRatio: "16/10" }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,11,0.6) 0%, transparent 60%)" }} />
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-[0_0_20px_rgba(201,168,76,0.15)] animate-float"
              style={{ animationDelay: "0.5s" }}>
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Mestre Assistente</p>
                <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" /> Online</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-3 shadow-[0_0_20px_rgba(201,168,76,0.15)] animate-float"
              style={{ animationDelay: "1s" }}>
              <p className="text-xs text-gray-400">Última rolagem</p>
              <p className="font-heading font-black text-yellow-400 text-lg">🌟 CRÍTICO! 20</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="text-center mb-12 space-y-4">
          <div className="divider-rune">Poderes do Códice</div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-white">
            Tudo o que você precisa para
            <br />
            <span className="text-gold-gradient">uma aventura épica</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="card-codex p-6 space-y-4 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-6 py-16">
        <div className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(201,168,76,0.1))", border: "1px solid rgba(201,168,76,0.2)" }}>
          <div className="absolute inset-0 bg-rune-pattern pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-white">
              Sua aventura começa
              <br />
              <span className="text-gold-gradient">com um único clique</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">
              Junte-se a milhares de aventureiros que já usam o CODEX D20 para viver histórias épicas.
            </p>
            <button onClick={() => router.push("/register")} className="btn-gold text-lg mx-auto flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              Abrir o Códice Agora
            </button>
            <p className="text-xs text-gray-600">Gratuito para sempre • Sem cartão de crédito • Em português</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600 text-xs space-y-2">
          <p className="font-heading text-primary/50">CODEX D20</p>
          <p>Conteúdo baseado no SRD 5.1 (Systems Reference Document). Este não é um produto oficial de Dungeons & Dragons.</p>
        </div>
      </footer>
    </div>
  );
}
