"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { 
  Sword, BookOpen, Dices, Star, ScrollText, 
  Plus, LogOut, Search, ChevronRight, Sparkles, X, Send, Bot, Trash2, Users 
} from "lucide-react";
import { generateRandomCharacterPayload } from "@/lib/rules/characterBuilder";
import { getRacePresetImage } from "@/utils/racePresets";
import { DndChatbot } from "@/components/DndChatbot";

// Class details for visual themes
const CLASS_THEMES: Record<string, { gradient: string; accent: string; image?: string; quote: string }> = {
  "Guerreiro": { gradient: "from-slate-800 to-zinc-900", accent: "#94a3b8", quote: "Aço frio e determinação pura silenciam qualquer feitiço." },
  "Mago": { gradient: "from-blue-950 to-purple-950", accent: "#3b82f6", image: "/class_mago_1782020893172.png", quote: "O universo não passa de uma equação mágica aguardando solução." },
  "Clérigo": { gradient: "from-yellow-950 to-stone-900", accent: "#eab308", quote: "Pela fé sou o escudo divino que ergue os justos e bane o mal." },
  "Bárbaro": { gradient: "from-red-950 to-rose-950", accent: "#ef4444", quote: "Na fúria encontro a clareza. Na batalha, a libertação." },
  "Bardo": { gradient: "from-purple-950 to-fuchsia-950", accent: "#a855f7", quote: "As palavras moldam o destino; minhas canções moldam a realidade." },
  "Paladino": { gradient: "from-amber-950 to-stone-950", accent: "#fbbf24", quote: "Meu juramento é minha armadura, e minha lâmina é a justiça divina." },
  "Ladino": { gradient: "from-neutral-900 to-stone-950", accent: "#6b7280", quote: "As sombras me protegem, o silêncio me guia, a precisão decide." },
  "Druida": { gradient: "from-emerald-950 to-stone-900", accent: "#22c55e", quote: "O sussurro da floresta responde ao meu chamado; a natureza é minha força." },
  "Feiticeiro": { gradient: "from-violet-950 to-slate-900", accent: "#8b5cf6", quote: "A magia não é um estudo. É o fogo que queima em minhas veias." },
  "Bruxo": { gradient: "from-indigo-950 to-zinc-950", accent: "#6366f1", quote: "Pactos selados no escuro trazem poderes inacreditáveis... por um preço." },
  "Monge": { gradient: "from-amber-900 to-zinc-900", accent: "#f59e0b", quote: "A mente quieta canaliza o Ki; o punho firme quebra a montanha." },
  "Patrulheiro": { gradient: "from-green-950 to-zinc-900", accent: "#10b981", quote: "Nenhuma trilha é desconhecida, nenhuma presa escapa do meu arco." }
};

function CharacterList({ router, search }: { router: any; search: string }) {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCharacters(data || []);
    } catch (e) {
      console.error("Erro ao buscar heróis:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja apagar este herói para sempre do Códice?")) return;

    try {
      const { error } = await supabase
        .from("characters")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setCharacters(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Falha ao banir herói do tomo.");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="h-44 skeleton border border-primary/20 rounded-xl" />
        ))}
      </div>
    );
  }

  const filtered = characters.filter(c => {
    const nameStr = c.name?.toLowerCase() || "";
    const raceStr = c.race?.toLowerCase() || "";
    const classStr = (c.char_class || c.class_name || "").toLowerCase();
    const q = search.toLowerCase();
    return nameStr.includes(q) || raceStr.includes(q) || classStr.includes(q);
  });

  if (characters.length === 0) {
    return (
      <div 
        onClick={() => router.push("/characters/new")}
        className="border border-dashed border-[#c9a84c]/20 bg-[#0f0f18]/40 hover:bg-[#c9a84c]/5 hover:border-[#c9a84c]/60 transition-all cursor-pointer flex flex-col items-center justify-center p-12 rounded-2xl group text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] border border-[#c9a84c]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(201,168,76,0.05)]">
          <ScrollText className="w-8 h-8 text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors" />
        </div>
        <p className="text-xl font-heading font-bold text-[#e8dfc0] group-hover:text-[#c9a84c] transition-colors">O Tomo de Heróis está Vazio</p>
        <p className="text-[#8a8a93] text-sm mt-2 max-w-sm">Nenhuma lenda foi inscrita neste códice ainda. Dê vida ao seu primeiro herói e comece a jornada.</p>
        <Button className="btn-gold mt-6 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Criar Protagonista
        </Button>
      </div>
    );
  }

  // Stats calculations
  const totalLendas = characters.length;
  const nivelMedio = totalLendas > 0 
    ? Math.round(characters.reduce((acc, char) => acc + (char.level || 1), 0) / totalLendas)
    : 0;
  
  // Favorite class calculation
  const classCounts: Record<string, number> = {};
  characters.forEach(char => {
    const cls = char.char_class || char.class_name || "Guerreiro";
    classCounts[cls] = (classCounts[cls] || 0) + 1;
  });
  let favoriteClass = "Nenhuma";
  let maxCount = 0;
  Object.entries(classCounts).forEach(([cls, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteClass = cls;
    }
  });

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas das Lendas */}
      {totalLendas > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#0f0f18]/60 border border-primary/20 rounded-xl p-3.5 flex flex-col justify-center text-left shadow-lg backdrop-blur-md">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Lendas Inscritas</span>
            <span className="text-xl md:text-2xl font-heading font-black text-white">{totalLendas}</span>
          </div>
          <div className="bg-[#0f0f18]/60 border border-primary/20 rounded-xl p-3.5 flex flex-col justify-center text-left shadow-lg backdrop-blur-md">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Nível Médio</span>
            <span className="text-xl md:text-2xl font-heading font-black text-white">{nivelMedio}</span>
          </div>
          <div className="bg-[#0f0f18]/60 border border-primary/20 rounded-xl p-3.5 flex flex-col justify-center text-left shadow-lg backdrop-blur-md">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest block">Classe Favorita</span>
            <span className="text-xs md:text-sm font-heading font-black text-[#c9a84c] truncate uppercase mt-0.5">⚔️ {favoriteClass}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(char => {
          const charClass = char.char_class || char.class_name || "Guerreiro";
          const theme = CLASS_THEMES[charClass] || CLASS_THEMES["Guerreiro"];
          
          return (
            <div
              key={char.id}
              onClick={() => router.push(`/characters/${char.id}`)}
              className={`group relative rounded-xl border border-primary/20 bg-gradient-to-br ${theme.gradient} to-[#07070b]/90 hover:border-primary hover:shadow-[0_0_25px_rgba(201,168,76,0.15)] transition-all duration-300 cursor-pointer overflow-hidden p-5 flex flex-col justify-between h-48`}
            >
              {/* Background art if available */}
              {theme.image && (
                <div 
                  className="absolute inset-0 bg-cover bg-right-top opacity-[0.04] mix-blend-luminosity group-hover:opacity-10 transition-opacity pointer-events-none"
                  style={{ backgroundImage: `url(${theme.image})` }}
                />
              )}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-transparent" />

              <div className="relative z-10 flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] text-primary/60 uppercase tracking-widest font-bold font-heading">{char.race}</p>
                  <h4 className="text-xl md:text-2xl font-serif text-[#e8dfc0] group-hover:text-primary transition-colors font-black leading-tight uppercase mt-0.5 truncate">{char.name}</h4>
                  <p className="text-xs text-[#8a8a93] mt-1.5 italic line-clamp-2 pr-2 leading-relaxed">
                    "{theme.quote}"
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="w-14 h-18 rounded-lg overflow-hidden border border-primary/30 shadow-[0_4px_15px_rgba(0,0,0,0.5)] group-hover:border-primary transition-colors bg-[#07070b]">
                    <img src={char.image_url || getRacePresetImage(char.race)} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="bg-primary/10 border border-primary/30 rounded-md px-1.5 py-0.5 text-primary font-heading font-black text-[8px] uppercase tracking-wide">
                    Nível {char.level || 1}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
                <span className="text-[10px] text-primary/80 font-heading tracking-wider uppercase font-bold">
                  🛡️ {charClass}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleDelete(char.id, e)}
                    className="p-2 text-[#8a8a93] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Banir lenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Button variant="ghost" size="sm" className="text-primary/70 group-hover:text-primary gap-1 p-0 px-2 h-7 text-[10px] uppercase font-bold font-heading">
                    Abrir Tomo <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Create New Hero Quick Card */}
        <div
          onClick={() => router.push("/characters/new")}
          className="border-2 border-dashed border-[#c9a84c]/20 bg-[#0f0f18]/20 hover:bg-[#c9a84c]/5 hover:border-[#c9a84c]/50 transition-all cursor-pointer flex flex-col items-center justify-center p-6 h-48 rounded-xl group"
        >
          <Plus className="w-8 h-8 text-[#c9a84c]/30 group-hover:text-primary transition-all group-hover:scale-110 mb-2" />
          <span className="font-heading text-xs text-[#c9a84c]/60 group-hover:text-primary uppercase tracking-widest font-bold">Inscrever Nova Lenda</span>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("Aventureiro");
  const [search, setSearch] = useState("");

  // Dice Roller States
  const [diceRollLog, setDiceRollLog] = useState<{ die: string; result: number; critType: 'normal' | 'crit' | 'fail' }[]>([]);
  const [activeDie, setActiveDie] = useState<string | null>(null);
  const [rollingDieResult, setRollingDieResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollQuickDie = (sides: number) => {
    setIsRolling(true);
    setActiveDie(`d${sides}`);
    setRollingDieResult(null);
    
    // Simulate dice animation duration
    setTimeout(() => {
      const result = Math.floor(Math.random() * sides) + 1;
      let critType: 'normal' | 'crit' | 'fail' = 'normal';
      if (sides === 20) {
        if (result === 20) critType = 'crit';
        else if (result === 1) critType = 'fail';
      }
      setRollingDieResult(result);
      setIsRolling(false);
      setDiceRollLog(prev => [{ die: `d${sides}`, result, critType }, ...prev.slice(0, 4)]);
    }, 600);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/login");
        return;
      }
      
      const metaUsername = user.user_metadata?.username;
      const emailPrefix = user.email ? user.email.split("@")[0] : "Aventureiro";
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

      setUsername(profile?.username || metaUsername || emailPrefix);
    };

    checkAuth();
  }, [router]);

  const generateRandomCharacter = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      
      const newChar = generateRandomCharacterPayload(authData.user.id);
      
      const { data, error } = await supabase.from("characters").insert([newChar]).select();
      if (error) throw error;
      
      if (data && data[0]) {
        router.push(`/characters/${data[0].id}`);
      }
    } catch (e: any) {
      alert("Falha ao gerar herói: " + e.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const quickActions = [
    { icon: <Plus className="w-5 h-5" />, label: "Novo Herói", color: "from-purple-950 to-[#4a1d8a]/40 border-purple-500/20", action: () => router.push("/characters/new") },
    { icon: <BookOpen className="w-5 h-5" />, label: "Grimório", color: "from-blue-950 to-blue-900/40 border-blue-500/20", action: () => router.push("/spellbook") },
    { icon: <Sparkles className="w-5 h-5" />, label: "Herói Aleatório", color: "from-fuchsia-950 to-fuchsia-900/40 border-fuchsia-500/20", action: generateRandomCharacter }
  ];

  return (
    <div className="min-h-screen bg-[#07070b] relative overflow-hidden flex flex-col font-sans text-left">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-rune-pattern" />

      {/* Glow backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full animate-pulse-glow pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.04), transparent 70%)", filter: "blur(60px)", animationDelay: "2s" }} />

      {/* Header */}
      <header className="border-b border-[#c9a84c]/20 bg-[#0f0f18]/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#9c8033] to-[#c9a84c]">
              <Sword className="w-4 h-4 text-black font-bold" />
            </div>
            <h1 className="text-xl font-heading font-black tracking-widest text-[#c9a84c] text-shimmer">CODEX D20</h1>
          </div>

          <div className="flex-1 max-w-md hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a93]" />
            <Input
              placeholder="Buscar herói no Códice..."
              className="pl-9 bg-[#07070b]/60 border-[#c9a84c]/20 text-xs text-[#e8dfc0] placeholder-[#8a8a93] focus:border-[#c9a84c]/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#e8dfc0] font-heading font-bold text-xs tracking-wider border border-[#c9a84c]/20 rounded-full px-3 py-1 bg-[#1a1a2e]/40">
              ⚔️ {username}
            </span>

            <button 
              onClick={handleLogout} 
              className="p-2 text-[#8a8a93] hover:text-[#c9a84c] rounded-lg transition-colors border border-transparent hover:border-[#c9a84c]/20 hover:bg-[#1a1a2e]/30"
              title="Sair do Códice"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 relative z-10 flex-1 space-y-8 max-w-6xl animate-slide-up">

        {/* Banner Heroico Showcase */}
        <section className="relative rounded-3xl overflow-hidden border border-[#c9a84c]/20 shadow-[0_10px_40px_rgba(0,0,0,0.6)] group">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-40 group-hover:scale-102 transition-transform duration-700 pointer-events-none" 
            style={{ backgroundImage: "url('/codex_hero_banner_1782020844404.png')" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07070b] via-[#07070b]/95 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 space-y-4 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#c9a84c]/30 bg-black/40 text-[9px] text-[#c9a84c] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Companheiro de Campanha RPG
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-black text-white leading-none">
              SAUDAÇÕES, <span className="text-gold-gradient uppercase">{username}</span>
            </h2>
            <p className="text-[#8a8a93] text-sm md:text-base font-serif italic leading-relaxed">
              "O destino convoca heróis, as cinzas moldam reinos. Os dados estão prontos, e o Códice aguarda suas próximas lendas."
            </p>
          </div>
        </section>

        {/* Quick Menu Actions */}
        <section className="space-y-3">
          <h3 className="text-xs font-heading font-bold text-primary/70 uppercase tracking-widest text-left">Painel Arcane</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className={`bg-gradient-to-br ${action.color} border rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-[#e8dfc0] font-heading font-bold text-xs tracking-wider hover:scale-103 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)] hover:border-primary/50 transition-all text-center uppercase cursor-pointer h-20`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#c9a84c]/10 pb-2">
            <h3 className="text-xl font-heading font-bold text-primary flex items-center gap-2 uppercase tracking-wide">
              <Sword className="w-5 h-5" /> Protagonistas
            </h3>
            <Button size="sm" className="btn-ghost-gold h-8 text-[10px] font-bold px-3 uppercase" onClick={() => router.push("/characters/new")}>
              + Invocação
            </Button>
          </div>
          <CharacterList router={router} search={search} />
        </section>
      </main>

      <DndChatbot />
    </div>
  );
}
