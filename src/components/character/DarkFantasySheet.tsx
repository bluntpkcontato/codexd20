import React from 'react';
import { Shield, Heart, Zap, Sword, Crosshair, Brain, Eye, MessageCircle, Star } from 'lucide-react';

const STATS = [
  { label: 'Força', value: 16, mod: '+3', icon: Sword },
  { label: 'Destreza', value: 14, mod: '+2', icon: Crosshair },
  { label: 'Constituição', value: 15, mod: '+2', icon: Heart },
  { label: 'Inteligência', value: 10, mod: '+0', icon: Brain },
  { label: 'Sabedoria', value: 12, mod: '+1', icon: Eye },
  { label: 'Carisma', value: 8, mod: '-1', icon: MessageCircle },
];

const SKILLS = [
  { name: 'Atletismo', attr: 'FOR', mod: '+5', prof: true },
  { name: 'Acrobacia', attr: 'DES', mod: '+2', prof: false },
  { name: 'Furtividade', attr: 'DES', mod: '+4', prof: true },
  { name: 'Percepção', attr: 'SAB', mod: '+3', prof: true },
  { name: 'Sobrevivência', attr: 'SAB', mod: '+3', prof: true },
  { name: 'Intimidação', attr: 'CAR', mod: '+1', prof: true },
];

export default function DarkFantasySheet() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 md:p-8 font-sans selection:bg-zinc-800">
      
      {/* ─── GRID PRINCIPAL ─── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* ─── HEADER (Topo / Span 12) ─── */}
        <header className="md:col-span-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
          {/* Subtle noise/texture overlay could go here */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-serif text-zinc-100 tracking-tight uppercase mb-2">Gharok, o Implacável</h1>
            <div className="flex gap-4 text-sm font-medium tracking-widest text-zinc-500 uppercase">
              <span>Meio-Orc</span>
              <span>•</span>
              <span>Bárbaro (Berserker)</span>
              <span>•</span>
              <span className="text-zinc-300">Nível 5</span>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-bold tracking-widest text-zinc-500 uppercase">
              <span>Experiência</span>
              <span>6500 / 14000</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div className="h-full bg-zinc-500 rounded-full" style={{ width: '46%' }} />
            </div>
          </div>
        </header>

        {/* ─── SIDEBAR ESQUERDA (Atributos / Span 4) ─── */}
        <aside className="md:col-span-4 flex flex-col gap-6">
          
          {/* Proficiência */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center shadow-inner">
              <Star className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-zinc-500">Bônus de</p>
              <p className="text-xl font-serif text-zinc-200">Proficiência <span className="text-zinc-400 ml-2">+3</span></p>
            </div>
          </div>

          {/* Atributos Principais */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl flex-1">
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-6 border-b border-zinc-800 pb-2">Atributos</h2>
            
            <div className="flex flex-col gap-5">
              {STATS.map((stat) => (
                <div key={stat.label} className="relative flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase">{stat.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 font-mono">{stat.value}</span>
                    <div className="w-12 py-1 text-center bg-zinc-950 border border-zinc-800 rounded text-lg font-serif text-zinc-200 shadow-inner group-hover:border-zinc-600 transition-colors">
                      {stat.mod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

        {/* ─── PAINEL CENTRAL (Combate & Perícias / Span 8) ─── */}
        <main className="md:col-span-8 flex flex-col gap-6">
          
          {/* Bloco Superior (HP, CA, Iniciativa) */}
          <div className="grid grid-cols-3 gap-4">
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-800/30 rotate-12" />
              <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1 z-10">Armadura</p>
              <p className="text-4xl font-serif text-zinc-200 z-10">16</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <Heart className="absolute -bottom-4 -left-4 w-24 h-24 text-zinc-800/30 -rotate-12" />
              <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1 z-10">Vida Atual</p>
              <div className="flex items-baseline gap-1 z-10">
                <p className="text-4xl font-serif text-zinc-200">52</p>
                <span className="text-zinc-600 text-sm">/52</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <Zap className="absolute -top-4 -right-4 w-24 h-24 text-zinc-800/30 rotate-45" />
              <p className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-1 z-10">Iniciativa</p>
              <p className="text-4xl font-serif text-zinc-200 z-10">+2</p>
            </div>

          </div>

          {/* Lista de Perícias */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl flex-1">
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mb-6 border-b border-zinc-800 pb-2">Perícias Destacadas</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {SKILLS.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between p-2 hover:bg-zinc-950/50 rounded transition-colors border border-transparent hover:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    {/* Indicador de Proficiência */}
                    <div className={`w-2 h-2 rounded-full ${skill.prof ? 'bg-zinc-400' : 'bg-zinc-800 border border-zinc-700'}`} />
                    <span className="text-sm font-medium text-zinc-300">{skill.name}</span>
                    <span className="text-[10px] text-zinc-600 font-bold tracking-wider">({skill.attr})</span>
                  </div>
                  <span className={`font-mono text-sm ${skill.mod.includes('+') ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {skill.mod}
                  </span>
                </div>
              ))}
            </div>

            {/* Ações / Armas Placeholder */}
            <h2 className="text-xs uppercase tracking-widest font-bold text-zinc-500 mt-8 mb-4 border-b border-zinc-800 pb-2">Ataques Principais</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-md">
                <div>
                  <p className="text-sm font-bold text-zinc-200">Machado Grande</p>
                  <p className="text-xs text-zinc-500">Corpo a Corpo • Pesada</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-zinc-400">+6 <span className="text-xs font-normal text-zinc-600 ml-1">Acerto</span></p>
                  <p className="text-sm font-serif text-zinc-300">1d12 + 3 <span className="text-xs font-sans text-zinc-600">Cortante</span></p>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
