/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Star, ChevronLeft, Filter, Zap, Globe, Clock, Target, Hourglass, X } from "lucide-react";

import spellsDataEn from "@/data/spells.json";
import spellsDataPt from "@/data/spells_pt.json";

const ptMap = new Map((spellsDataPt as any[]).map(s => [s.id, s]));

// Map spell fields from translated database
const SPELLS = (spellsDataEn as any[]).map((s, idx) => {
  const pt = ptMap.get(s?.id || "");
  const raw = s?.raw_data || {};
  const sName = s?.name_pt || s?.name_en || s?.name || raw.name || "Magia Sem Nome";
  
  return {
    id: idx + 1,
    slug: s?.id || `spell-${idx}`,
    name: pt?.name_pt || sName,
    original: s?.name_en || raw.name || "Unnamed Spell",
    level: pt?.level !== undefined ? pt.level : (raw.level || 0),
    school: pt?.school || raw.school?.name || "Evocação",
    castingTime: pt?.casting_time || raw.casting_time || "1 ação",
    range: pt?.range || raw.range || "9 metros",
    components: pt?.components || (raw.components ? raw.components.join(", ") : "V, S"),
    duration: pt?.duration || raw.duration || "Instantânea",
    concentration: raw.concentration || false,
    ritual: raw.ritual || false,
    classes: pt?.classes || (raw.classes ? raw.classes.map((c:any) => c.name) : []),
    tags: [String(pt?.school || raw.school?.name || "evocação").toLowerCase()],
    description: pt?.description || pt?.description_pt || s?.description_pt || s?.description_en || (raw.desc ? raw.desc.join("\n") : "Sem descrição disponível."),
    hasTranslation: !!(pt || s?.name_pt),
  };
});

const SCHOOLS = ["Todas", "Evocação", "Abjuração", "Encantamento", "Transmutação", "Adivinhação", "Conjuração", "Ilusão", "Necromancia"];
const LEVELS = ["Todos", "Truque", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const CLASSES_FILTER = ["Todas", "Mago", "Clérigo", "Druida", "Bardo", "Feiticeiro", "Bruxo", "Paladino", "Patrulheiro"];

const SCHOOL_COLORS: Record<string, { badge: string; glow: string; accent: string }> = {
  "Evocação":    { badge: "text-orange-400 border-orange-400/40 bg-orange-400/10", glow: "shadow-orange-500/20", accent: "#f97316" },
  "Abjuração":   { badge: "text-blue-400 border-blue-400/40 bg-blue-400/10",       glow: "shadow-blue-500/20",   accent: "#60a5fa" },
  "Encantamento":{ badge: "text-pink-400 border-pink-400/40 bg-pink-400/10",        glow: "shadow-pink-500/20",   accent: "#f472b6" },
  "Transmutação":{ badge: "text-green-400 border-green-400/40 bg-green-400/10",     glow: "shadow-green-500/20",  accent: "#4ade80" },
  "Adivinhação": { badge: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",        glow: "shadow-cyan-500/20",   accent: "#22d3ee" },
  "Conjuração":  { badge: "text-amber-400 border-amber-400/40 bg-amber-400/10",     glow: "shadow-amber-500/20",  accent: "#fbbf24" },
  "Ilusão":      { badge: "text-purple-400 border-purple-400/40 bg-purple-400/10",  glow: "shadow-purple-500/20", accent: "#a78bfa" },
  "Necromancia": { badge: "text-red-400 border-red-400/40 bg-red-400/10",           glow: "shadow-red-500/20",    accent: "#f87171" },
};

const SCHOOL_ICONS: Record<string, string> = {
  "Evocação": "🔥", "Abjuração": "🛡️", "Encantamento": "💫",
  "Transmutação": "⚗️", "Adivinhação": "🔮", "Conjuração": "✨",
  "Ilusão": "🌀", "Necromancia": "💀",
};

function LevelBadge({ level, size = "md" }: { level: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-primary/40 flex items-center justify-center font-heading font-bold text-primary shrink-0 bg-primary/5`}>
      {level === 0 ? <Zap className={size === "lg" ? "w-6 h-6" : "w-4 h-4"} /> : level}
    </div>
  );
}

export default function SpellbookPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("Todas");
  const [levelFilter, setLevelFilter] = useState("Todos");
  const [classFilter, setClassFilter] = useState("Todas");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const searchLower = (search || "").toLowerCase();
    return SPELLS.filter(s => {
      const nameLower = String(s.name || "").toLowerCase();
      const originalLower = String(s.original || "").toLowerCase();
      const descLower = String(s.description || "").toLowerCase();
      
      const matchSearch =
        nameLower.includes(searchLower) ||
        originalLower.includes(searchLower) ||
        descLower.includes(searchLower);
      const matchSchool = school === "Todas" || s.school === school;
      const matchLevel =
        levelFilter === "Todos" ||
        (levelFilter === "Truque" ? s.level === 0 : s.level === parseInt(levelFilter));
      const matchClass = classFilter === "Todas" || (s.classes && s.classes.includes(classFilter));
      return matchSearch && matchSchool && matchLevel && matchClass;
    });
  }, [search, school, levelFilter, classFilter]);

  const toggleFav = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const schoolStyle = selected ? SCHOOL_COLORS[selected.school] : null;

  // Group spells by level for display
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(s => {
      const key = s.level === 0 ? "Truques" : `Nível ${s.level}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return groups;
  }, [filtered]);

  const groupKeys = useMemo(() => {
    const keys = Object.keys(grouped);
    return keys.sort((a, b) => {
      if (a === "Truques") return -1;
      if (b === "Truques") return 1;
      return parseInt(a.split(" ")[1]) - parseInt(b.split(" ")[1]);
    });
  }, [grouped]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239c8033%22 fill-opacity=%221%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}
      />

      {/* Header */}
      <header className="border-b border-primary/20 bg-card/80 backdrop-blur-xl z-40 shrink-0">
        <div className="px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="text-primary hover:bg-primary/10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-heading font-bold text-primary">Grimório de Magias</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{filtered.length} magia{filtered.length !== 1 ? "s" : ""}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/40 text-primary hover:bg-primary/10"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {(school !== "Todas" || levelFilter !== "Todos" || classFilter !== "Todas") && (
                <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block" />
              )}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, escola, descrição..."
              className="pl-9 bg-card/50 border-primary/30 focus:border-primary/60"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-primary/10 pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background/40">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Escola</p>
              <div className="flex flex-wrap gap-1">
                {SCHOOLS.map(s => (
                  <button key={s} onClick={() => setSchool(s)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${school === s ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                    {SCHOOL_ICONS[s] || ""} {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Nível</p>
              <div className="flex flex-wrap gap-1">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevelFilter(l)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${levelFilter === l ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                    {l === "Truque" ? "⚡ Truque" : l}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Classe</p>
              <div className="flex flex-wrap gap-1">
                {CLASSES_FILTER.map(c => (
                  <button key={c} onClick={() => setClassFilter(c)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${classFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-primary/20 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content — split pane */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Spell list — independently scrollable */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40"
          style={{ maxWidth: selected ? "55%" : "100%" }}
        >
          <div className="p-4 space-y-6">
            {groupKeys.length === 0 && (
              <div className="text-center py-24 text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-heading">Nenhuma magia encontrada</p>
                <p className="text-sm mt-2">Tente outros filtros de busca</p>
              </div>
            )}

            {groupKeys.map(groupKey => (
              <div key={groupKey}>
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {groupKey === "Truques" ? (
                      <Zap className="w-4 h-4 text-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center text-primary font-heading font-bold text-xs">
                        {groupKey.split(" ")[1]}
                      </div>
                    )}
                    <span className="text-sm font-heading font-semibold text-primary/80 uppercase tracking-wider">
                      {groupKey}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-primary/15" />
                  <span className="text-xs text-muted-foreground">{grouped[groupKey].length}</span>
                </div>

                {/* Spell cards */}
                <div className="space-y-2">
                  {grouped[groupKey].map(spell => {
                    const isSelected = selected?.id === spell.id;
                    const sColors = SCHOOL_COLORS[spell.school];
                    return (
                      <div
                        key={spell.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelected(isSelected ? null : spell)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(isSelected ? null : spell);
                          }
                        }}
                        className={`w-full text-left rounded-xl border transition-all duration-200 group relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-primary/15 bg-card/30 hover:border-primary/40 hover:bg-card/50"
                        }`}
                      >
                        {/* Active indicator */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-xl" />
                        )}
                        <div className="px-4 py-3 flex items-center gap-3">
                          <LevelBadge level={spell.level} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-heading font-semibold text-sm transition-colors ${isSelected ? "text-primary" : "text-foreground group-hover:text-primary/90"}`}>
                                {spell.name}
                              </span>
                              {spell.ritual && (
                                <span className="text-xs px-1.5 py-0.5 rounded border border-amber-400/30 text-amber-400 bg-amber-400/5">Ritual</span>
                              )}
                              {spell.concentration && (
                                <span className="text-xs px-1.5 py-0.5 rounded border border-cyan-400/30 text-cyan-400 bg-cyan-400/5">Conc.</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${sColors?.badge || "text-muted-foreground"}`}>
                                {SCHOOL_ICONS[spell.school]} {spell.school}
                              </span>
                              <span className="text-xs text-muted-foreground">{spell.castingTime}</span>
                              <span className="text-xs text-muted-foreground hidden sm:inline">• {spell.range}</span>
                            </div>
                          </div>
                          <button
                            onClick={e => toggleFav(spell.id, e)}
                            className={`transition-all shrink-0 p-1 rounded-full ${favorites.includes(spell.id) ? "text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400"}`}
                          >
                            <Star className={`w-4 h-4 ${favorites.includes(spell.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Detail panel — fixed, never scrolls with the list */}
        <div
          className={`transition-all duration-300 overflow-hidden border-l border-primary/20 ${
            selected ? "w-[45%] min-w-[340px]" : "w-0"
          }`}
        >
          {selected && (
            <div className="h-full flex flex-col overflow-hidden bg-card/40 backdrop-blur-md">
              {/* Detail header */}
              <div
                className="px-5 pt-5 pb-4 border-b border-primary/20 shrink-0"
                style={{ background: schoolStyle ? `linear-gradient(135deg, ${schoolStyle.accent}08 0%, transparent 60%)` : undefined }}
              >
                <div className="flex items-start gap-3">
                  <LevelBadge level={selected.level} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-heading font-bold text-primary leading-tight">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5 italic">{selected.original}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selected.school && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${SCHOOL_COLORS[selected.school]?.badge || ""}`}>
                          {SCHOOL_ICONS[selected.school]} {selected.school}
                        </span>
                      )}
                      {selected.ritual && (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-400 bg-amber-400/5">Ritual</span>
                      )}
                      {selected.concentration && (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-cyan-400/30 text-cyan-400 bg-cyan-400/5">Concentração</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-primary/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail body — this part scrolls independently */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40">
                <div className="p-5 space-y-5">
                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Clock className="w-3.5 h-3.5" />, label: "Tempo de Conjuração", value: selected.castingTime },
                      { icon: <Target className="w-3.5 h-3.5" />, label: "Alcance", value: selected.range },
                      { icon: <Hourglass className="w-3.5 h-3.5" />, label: "Duração", value: selected.duration },
                      { icon: <Globe className="w-3.5 h-3.5" />, label: "Componentes", value: selected.components },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-background/40 rounded-lg p-2.5 border border-primary/10">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                          {icon}
                          <span className="text-xs">{label}</span>
                        </div>
                        <p className="text-sm font-medium text-foreground leading-tight">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Classes */}
                  {selected.classes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Classes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.classes.map((c: string) => (
                          <span key={c} className="text-xs px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Descrição</p>
                      {!selected.hasTranslation && (
                        <span className="text-xs text-amber-400/70 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Em inglês
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selected.description.split("\n").map((para: string, i: number) => (
                        <p key={i} className="text-sm text-foreground/85 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Tip box */}
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                    <p className="text-xs text-primary font-bold mb-1.5 flex items-center gap-1.5">
                      <span>✨</span> Dica para Iniciantes
                    </p>
                    <p className="text-sm text-foreground/80">
                      {selected.level === 0
                        ? `${selected.name} é um truque — pode ser lançado à vontade, sem gastar espaço de magia!`
                        : `Magia do círculo ${selected.level} da escola de ${selected.school}. Disponível para: ${selected.classes.join(", ") || "qualquer classe"}.`
                      }
                    </p>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFav(selected.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all font-medium text-sm ${
                      favorites.includes(selected.id)
                        ? "bg-yellow-400/10 border-yellow-400/40 text-yellow-400"
                        : "border-primary/20 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <Star className={`w-4 h-4 ${favorites.includes(selected.id) ? "fill-current" : ""}`} />
                    {favorites.includes(selected.id) ? "Nos Favoritos" : "Adicionar aos Favoritos"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state hint — when no spell selected but panel could be shown */}
        </div>
      </div>

      {/* Mobile: Bottom sheet for selected spell */}
      {selected && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-card/95 backdrop-blur-xl border-t border-primary/30 max-h-[60vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-heading font-bold text-primary">{selected.name}</h2>
                <p className="text-xs text-muted-foreground italic">{selected.original}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Tempo", value: selected.castingTime },
                { label: "Alcance", value: selected.range },
                { label: "Duração", value: selected.duration },
                { label: "Componentes", value: selected.components },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background/50 rounded-lg p-2 border border-primary/10 text-xs">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-foreground font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{selected.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
