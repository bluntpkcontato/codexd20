"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, Heart, Shield, Zap, Sword, BookOpen,
  Dices, Bot, Send, X, Star, Flame, Wind, Mountain,
  Eye, Brain, MessageCircle, Swords, Backpack, Scroll,
  Plus, Trash, Sparkles, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateModifier, calculateProficiencyBonus, formatModifier, CLASS_SAVING_THROWS, getUnarmedDamageDie, DND_EQUIPMENT_CATALOG, DND_FEATS, calculateUnarmedDamage, hasSpellbook, getSpellcastingAbility } from "@/utils/dndMath";
import { getAbilityModifier } from "@/lib/rules/abilityScores";
import { getProficiencyBonus } from "@/lib/rules/proficiency";
import { calculateSkillBonus } from "@/lib/rules/skills";
import { calculateSavingThrowBonus } from "@/lib/rules/savingThrows";
import { buildRollBreakdown } from "@/lib/rules/dice";
import { calculateInitiative, calculateArmorClass, calculateUnarmedStrikeDamage } from "@/lib/rules/combat";
import { supabase } from "@/lib/supabase";
import spellsData from "@/data/spells_pt.json";
import { getRacePresetImage, PRESET_PORTRAITS } from "@/utils/racePresets";
import { DndChatbot } from "@/components/DndChatbot";


// ─── Dados do Sistema ────────────────────────────────────────────────────────
const ATTR_INFO: Record<string, { name: string; icon: any; color: string; description: string; examples: string }> = {
  FOR: { name: "Força",        icon: Mountain, color: "text-red-400",    description: "Poder físico bruto. Carregue cargas pesadas, arrebente portas e acerte inimigos em combate corpo a corpo.", examples: "Atacar com espada, erguer pedra enorme, agarrar inimigo" },
  DES: { name: "Destreza",     icon: Wind,     color: "text-green-400",  description: "Agilidade, reflexos e coordenação. Determina sua iniciativa e defesa quando se esquiva.", examples: "Atirar com arco, se esgueirar, fazer malabarismo" },
  CON: { name: "Constituição", icon: Heart,    color: "text-rose-400",   description: "Resistência e vitalidade. Determina seu HP máximo e resistência a doenças e venenos.", examples: "Resistir veneno, marcha prolongada, prender o fôlego" },
  INT: { name: "Inteligência", icon: Brain,    color: "text-blue-400",   description: "Raciocínio lógico, memória e aprendizado. Magos usam INT para conjurar seus feitiços.", examples: "Lembrar de história, decifrar código, usar magia arcana" },
  SAB: { name: "Sabedoria",    icon: Eye,      color: "text-amber-400",  description: "Percepção, intuição e conexão com o mundo. Clérigos canalizam poder divino via SAB.", examples: "Notar emboscada, curar ferimentos, sentir mentiras" },
  CAR: { name: "Carisma",      icon: Flame,    color: "text-purple-400", description: "Força de personalidade, charme e liderança. Bardos e Bruxos usam CAR para sua magia.", examples: "Convencer guarda, intimidar bandido, negociar preço" },
};

const SKILLS = [
  { name: "Acrobacia",          attr: "DES", icon: "" },
  { name: "Arcanismo",          attr: "INT", icon: "" },
  { name: "Atletismo",          attr: "FOR", icon: "" },
  { name: "Atuação",            attr: "CAR", icon: "" },
  { name: "Enganação",          attr: "CAR", icon: "" },
  { name: "Furtividade",        attr: "DES", icon: "" },
  { name: "História",           attr: "INT", icon: "" },
  { name: "Intimidação",        attr: "CAR", icon: "" },
  { name: "Intuição",           attr: "SAB", icon: "" },
  { name: "Investigação",       attr: "INT", icon: "" },
  { name: "Lidar com Animais",  attr: "SAB", icon: "" },
  { name: "Medicina",           attr: "SAB", icon: "" },
  { name: "Natureza",           attr: "INT", icon: "" },
  { name: "Percepção",          attr: "SAB", icon: "" },
  { name: "Persuasão",          attr: "CAR", icon: "" },
  { name: "Prestidigitação",    attr: "DES", icon: "" },
  { name: "Religião",           attr: "INT", icon: "" },
  { name: "Sobrevivência",      attr: "SAB", icon: "" },
];

const CONDITIONS = [
  { name: "Envenenado",  icon: "", color: "green",  desc: "Desvantagem em ataques e testes de habilidade." },
  { name: "Caído",       icon: "", color: "gray",   desc: "Ataques corpo-a-corpo têm vantagem contra você." },
  { name: "Amedrontado", icon: "", color: "purple", desc: "Não pode avançar em direção à fonte do medo." },
  { name: "Atordoado",   icon: "", color: "yellow", desc: "Incapacitado. TR de CON e DES falham automaticamente." },
  { name: "Enfeitiçado", icon: "", color: "violet", desc: "Não pode atacar o encantador. Ele tem vantagem em CAR." },
  { name: "Invisível",   icon: "", color: "blue",   desc: "Ataques contra você têm desvantagem. Seus ataques têm vantagem." },
];

const CLASS_THEMES: Record<string, { gradient: string; accent: string; symbol: string }> = {
  "Bárbaro":    { gradient: "from-red-950 via-card/95 to-background",   accent: "#ef4444", symbol: "" },
  "Bardo":      { gradient: "from-purple-950 via-card/95 to-background", accent: "#a855f7", symbol: "" },
  "Clérigo":    { gradient: "from-yellow-950 via-card/95 to-background", accent: "#eab308", symbol: "" },
  "Druida":     { gradient: "from-green-950 via-card/95 to-background",  accent: "#22c55e", symbol: "" },
  "Guerreiro":  { gradient: "from-slate-800 via-card/95 to-background",  accent: "#94a3b8", symbol: "" },
  "Ladino":     { gradient: "from-gray-900 via-card/95 to-background",   accent: "#6b7280", symbol: "" },
  "Mago":       { gradient: "from-blue-950 via-card/95 to-background",   accent: "#3b82f6", symbol: "" },
  "Feiticeiro": { gradient: "from-violet-950 via-card/95 to-background", accent: "#8b5cf6", symbol: "" },
  "Bruxo":      { gradient: "from-indigo-950 via-card/95 to-background", accent: "#6366f1", symbol: "" },
  "Monge":      { gradient: "from-amber-950 via-card/95 to-background",  accent: "#f59e0b", symbol: "" },
  "Paladino":   { gradient: "from-yellow-900 via-card/95 to-background", accent: "#fbbf24", symbol: "" },
  "Patrulheiro":{ gradient: "from-emerald-950 via-card/95 to-background",accent: "#10b981", symbol: "" },
};

// ─── Chatbot Flutuante ───────────────────────────────────────────────────────


// ─── Tooltip de Atributo ─────────────────────────────────────────────────────
function AttrTooltip({ attrKey, onRoll }: { attrKey: string; onRoll: () => void }) {
  const info = ATTR_INFO[attrKey];
  const Icon = info.icon;
  const mod = 0; // placeholder, parent passes roll

  return (
    <div className="absolute z-50 bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] pointer-events-none"
      style={{ background: "linear-gradient(135deg, rgba(15,5,35,0.98), rgba(10,5,25,0.98))", border: "1px solid rgba(156,128,51,0.4)" }}>
      <div className="px-4 py-3 border-b border-primary/10" style={{ background: "linear-gradient(90deg, rgba(156,128,51,0.15), transparent)" }}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${info.color}`} />
          <p className="font-heading font-bold text-primary text-sm">{info.name}</p>
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs text-gray-300 leading-relaxed">{info.description}</p>
        <div className="border-t border-primary/10 pt-2">
          <p className="text-xs text-primary/60 font-bold uppercase tracking-wider mb-1">Exemplos de uso</p>
          <p className="text-xs text-gray-400 italic">{info.examples}</p>
        </div>
        <p className="text-xs text-primary/50 text-center">Clique para rolar 🎲</p>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function CharacterSheetPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"codice" | "pericias" | "combate" | "mochila" | "grimorio" | "dados" | "talentos">("codice");
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [rollLog, setRollLog] = useState<{ label: string; result: number; modifier: number; sides: number; total: number; isCrit: boolean; isFail: boolean; breakdown?: any }[]>([]);
  const [activeRoll, setActiveRoll] = useState<any>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [hoveredAttr, setHoveredAttr] = useState<string | null>(null);
  const [customDice, setCustomDice] = useState("");

  // Level Up States
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpHpGained, setLevelUpHpGained] = useState<number | null>(null);
  const [rollingLevelUp, setRollingLevelUp] = useState(false);
  const [levelUpSummary, setLevelUpSummary] = useState<string[]>([]);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [levelUpSummaryObj, setLevelUpSummaryObj] = useState<any | null>(null);

  // Feats
  const [characterFeats, setCharacterFeats] = useState<string[]>([]);
  const [showFeatCatalog, setShowFeatCatalog] = useState(false);

  // Equipment catalog
  const [showEquipmentCatalog, setShowEquipmentCatalog] = useState(false);
  const [equipCatalogSearch, setEquipCatalogSearch] = useState("");
  const [equipCatalogTab, setEquipCatalogTab] = useState<"armas" | "armaduras" | "outros">("armas");

  // Backpack / Inventory
  const [inventory, setInventory] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("Equipamento");
  const [newItemWeight, setNewItemWeight] = useState(0);
  const [newItemAmount, setNewItemAmount] = useState(1);
  const [newItemBonus, setNewItemBonus] = useState(10); // Standard base AC for armor, or damage die for weapon, etc.

  // Combat resources
  const [superiorityDice, setSuperiorityDice] = useState(4);
  const [maxSuperiorityDice, setMaxSuperiorityDice] = useState(4);
  const [rageSlots, setRageSlots] = useState(2);
  const [maxRageSlots, setMaxRageSlots] = useState(2);
  const [isRaging, setIsRaging] = useState(false);
  const [spellSlots, setSpellSlots] = useState<Record<number, { current: number; max: number }>>({
    1: { current: 0, max: 0 },
    2: { current: 0, max: 0 },
    3: { current: 0, max: 0 },
  });

  // Spellbook Filter/Search
  const [searchSpell, setSearchSpell] = useState("");
  const [spellClassFilter, setSpellClassFilter] = useState("Todas");
  const [spellLevelFilter, setSpellLevelFilter] = useState("Todos");
  const [selectedSpell, setSelectedSpell] = useState<any>(null);

  // Portrait customization states
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");

  // AI Image generator states
  const [generatingAiImage, setGeneratingAiImage] = useState(false);
  const [aiHair, setAiHair] = useState("");
  const [aiEyes, setAiEyes] = useState("");
  const [aiSkin, setAiSkin] = useState("");
  const [aiBody, setAiBody] = useState("");
  const [aiScars, setAiScars] = useState("");
  const [aiTattoos, setAiTattoos] = useState("");
  const [aiClothing, setAiClothing] = useState("");
  const [aiColors, setAiColors] = useState("");
  const [aiSymbols, setAiSymbols] = useState("");

  useEffect(() => {
    const fetchCharacter = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) { router.push("/login"); return; }

      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", authData.user.id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setCharacter(data);
      setCharacterFeats(data.feats || []);
      
      const level = data.level || 1;
      const charClass = data.char_class || data.class_name || "Guerreiro";
      const conMod = Math.floor(((data.stats?.CON || 10) - 10) / 2);

      let hitDie = 8;
      if (charClass === "Bárbaro") hitDie = 12;
      else if (["Guerreiro", "Paladino", "Patrulheiro"].includes(charClass)) hitDie = 10;
      else if (["Mago", "Feiticeiro"].includes(charClass)) hitDie = 6;

      const calculatedMaxHp = data.stats?.maxHp || (hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
      const calculatedHp = data.stats?.currentHp !== undefined ? data.stats.currentHp : calculatedMaxHp;

      setHp(calculatedHp);
      setMaxHp(calculatedMaxHp);
      
      const items = data.inventory || data.data?.inventory || [
        { name: "Armadura de Couro", type: "Armadura", bonus: 11, amount: 1, weight: 10, equipped: true },
        { name: "Espada Longa", type: "Arma", bonus: 8, amount: 1, weight: 3, equipped: true },
        { name: "Bolsa de Aventureiro", type: "Equipamento", amount: 1, weight: 5, equipped: false }
      ];
      setInventory(items);

      // Set resources based on class and level
      if (charClass === "Guerreiro") {
        const diceCount = level >= 7 ? 5 : 4;
        setSuperiorityDice(data.stats?.superiorityDice !== undefined ? data.stats.superiorityDice : diceCount);
        setMaxSuperiorityDice(diceCount);
      } else if (charClass === "Bárbaro") {
        const rCount = level >= 6 ? 4 : level >= 3 ? 3 : 2;
        setRageSlots(data.stats?.rageSlots !== undefined ? data.stats.rageSlots : rCount);
        setMaxRageSlots(rCount);
      }

      // Initialize spell slots
      const fullCasterSlots = getSpellSlotsByLevel(level, charClass);
      setSpellSlots({
        1: { current: data.stats?.spellSlots1 !== undefined ? data.stats.spellSlots1 : fullCasterSlots[1], max: fullCasterSlots[1] },
        2: { current: data.stats?.spellSlots2 !== undefined ? data.stats.spellSlots2 : fullCasterSlots[2], max: fullCasterSlots[2] },
        3: { current: data.stats?.spellSlots3 !== undefined ? data.stats.spellSlots3 : fullCasterSlots[3], max: fullCasterSlots[3] },
      });

      setLoading(false);
    };

    fetchCharacter();
  }, [params.id, router]);

  const saveCharacterChanges = async (updatedFields: any) => {
    if (!character) return;
    try {
      const mergedStats = {
        ...(character.stats || {}),
        ...(updatedFields.stats || {})
      };

      const updateData = {
        ...updatedFields,
        stats: mergedStats
      };

      const { error } = await supabase
        .from("characters")
        .update(updateData)
        .eq("id", character.id);

      if (error) throw error;

      setCharacter((prev: any) => ({
        ...prev,
        ...updateData
      }));
    } catch (e) {
      console.error("Erro ao salvar alterações do personagem:", e);
    }
  };

  const generateAiImage = async (isFullBody: boolean) => {
    setGeneratingAiImage(true);
    try {
      const promptParts = [
        `race: ${character?.race || 'Humano'}`,
        `class: ${character?.char_class || character?.class_name || 'Guerreiro'}`
      ];
      if (aiHair) promptParts.push(`hair: ${aiHair}`);
      if (aiEyes) promptParts.push(`eyes: ${aiEyes}`);
      if (aiSkin) promptParts.push(`skin: ${aiSkin}`);
      if (aiBody) promptParts.push(`body type: ${aiBody}`);
      if (aiScars) promptParts.push(`scars: ${aiScars}`);
      if (aiTattoos) promptParts.push(`tattoos: ${aiTattoos}`);
      if (aiClothing) promptParts.push(`clothing: ${aiClothing}`);
      if (aiColors) promptParts.push(`main colors: ${aiColors}`);
      if (aiSymbols) promptParts.push(`symbols: ${aiSymbols}`);

      const desc = promptParts.join(", ");
      const view = isFullBody ? "full body shot" : "close-up portrait";
      const fullPrompt = `Premium D&D RPG character ${view}, ${desc}, highly detailed digital art, dark fantasy style, highly cinematic, dramatic lighting, game concept art`;

      const seed = Math.floor(Math.random() * 100000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&model=flux&seed=${seed}`;
      
      await saveCharacterChanges({ image_url: url });
      setShowPortraitModal(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao conjurar a imagem.");
    } finally {
      setGeneratingAiImage(false);
    }
  };

  const getSpellSlotsByLevel = (lvl: number, charClass: string) => {
    if (!["Mago", "Feiticeiro", "Clérigo", "Druida", "Bardo", "Bruxo"].includes(charClass)) {
      if (["Paladino", "Patrulheiro"].includes(charClass)) {
        const slots: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
        if (lvl >= 2) slots[1] = 2;
        if (lvl >= 3) slots[1] = 3;
        if (lvl >= 5) { slots[1] = 4; slots[2] = 2; }
        return slots;
      }
      return { 1: 0, 2: 0, 3: 0 };
    }
    const slots: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    if (lvl === 1) { slots[1] = 2; }
    else if (lvl === 2) { slots[1] = 3; }
    else if (lvl >= 3) { slots[1] = 4; slots[2] = 2; }
    if (lvl >= 5) { slots[3] = 2; }
    return slots;
  };

  const getHitDie = () => {
    const cls = character?.char_class || character?.class_name || "Guerreiro";
    if (cls === "Bárbaro") return 12;
    if (["Guerreiro", "Paladino", "Patrulheiro"].includes(cls)) return 10;
    if (["Mago", "Feiticeiro"].includes(cls)) return 6;
    return 8;
  };

  const calcMod = getAbilityModifier;
  const modStr = formatModifier;

  const getArmorClass = () => {
    return calculateArmorClass(character, inventory);
  };

  const handleAdjustHp = (amount: number) => {
    setHp(p => {
      const next = Math.max(0, Math.min(maxHp, p + amount));
      saveCharacterChanges({
        stats: {
          currentHp: next
        }
      });
      return next;
    });
  };

  const roll = (sides: number, modifier: number = 0, label: string = "Rolagem", breakdown?: any) => {
    const result = sides > 0 ? Math.floor(Math.random() * sides) + 1 : 0;
    
    let total = result + modifier;
    let finalBreakdown = breakdown;

    if (sides === 20 && breakdown) {
      const { total: finalTotal, breakdown: builtBreakdown } = buildRollBreakdown({
        d20: result,
        abilityMod: breakdown.attr || 0,
        proficiencyBonus: breakdown.prof || 0,
        expertiseBonus: breakdown.expertise || 0,
        extraBonus: breakdown.extra || 0
      });
      total = finalTotal;
      finalBreakdown = builtBreakdown;
    }

    const isCrit = sides === 20 && result === 20;
    const isFail = sides === 20 && result === 1;
    const newRoll = { label, result, modifier: total - result, sides, total, isCrit, isFail, breakdown: finalBreakdown };
    setRollLog(p => [newRoll, ...p.slice(0, 14)]);
    setActiveRoll(newRoll);
  };

  const rollAdvantage = () => {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    const best = Math.max(r1, r2);
    const newRoll = { label: `Vantagem (${r1} vs ${r2})`, result: best, modifier: 0, sides: 20, total: best, isCrit: best === 20, isFail: false };
    setRollLog(p => [newRoll, ...p.slice(0, 14)]);
    setActiveRoll(newRoll);
  };

  const rollDisadvantage = () => {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    const worst = Math.min(r1, r2);
    const newRoll = { label: `Desvantagem (${r1} vs ${r2})`, result: worst, modifier: 0, sides: 20, total: worst, isCrit: false, isFail: worst === 1 };
    setRollLog(p => [newRoll, ...p.slice(0, 14)]);
    setActiveRoll(newRoll);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6" style={{ background: "radial-gradient(ellipse at center, rgba(60,20,80,0.4) 0%, #050505 70%)" }}>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-4 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🎲</div>
      </div>
      <p className="font-heading text-primary text-xl animate-pulse">Abrindo o Códice...</p>
    </div>
  );
  if (!character) return null;

  const stats = character.stats || { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 };
  const profBonus = calculateProficiencyBonus(character.level || 1);
  const unarmedDmg = calculateUnarmedStrikeDamage(character);
  const theme = CLASS_THEMES[character.char_class || character.class_name] || CLASS_THEMES["Guerreiro"];
  const hpPct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const lastRoll = rollLog[0];

  const tabs = [
    { id: "codice",   label: "Códice",   icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "combate",  label: "Combate",  icon: <Swords className="w-3.5 h-3.5" /> },
    { id: "mochila",  label: "Mochila",  icon: <Backpack className="w-3.5 h-3.5" /> },
    ...(hasSpellbook(character.char_class || character.class_name, character.subclass || character.stats?.subclass, character.level || 1)
      ? [{ id: "grimorio" as const, label: "Grimório", icon: <Scroll className="w-3.5 h-3.5" /> }]
      : []),
    // { id: "dados",    label: "Dados",    icon: <Dices className="w-3.5 h-3.5" /> },
    { id: "talentos", label: "Talentos", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: `radial-gradient(ellipse at 20% 0%, rgba(60,20,80,0.5) 0%, #07070a 50%)` }}>

      {/* Animated background runes */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none select-none overflow-hidden">
        <div className="absolute top-10 left-10 text-8xl text-primary animate-pulse" style={{ animationDuration: "4s" }}>✦</div>
        <div className="absolute top-1/3 right-20 text-6xl text-primary animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }}>⬡</div>
        <div className="absolute bottom-1/3 left-1/4 text-7xl text-primary animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }}>◈</div>
        <div className="absolute bottom-20 right-1/3 text-5xl text-primary animate-pulse" style={{ animationDuration: "7s", animationDelay: "3s" }}>✦</div>
      </div>

      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/5">
        <div style={{ background: "rgba(7,7,10,0.8)" }}>
          <div className="container mx-auto px-4 py-3 flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </button>
            <div className="w-px h-5 bg-white/10" />
            <span className="text-xs text-primary/60 font-heading tracking-widest uppercase">CODEX D20</span>
            <div className="ml-auto flex gap-2">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tab === t.id ? "text-black shadow-[0_0_12px_rgba(156,128,51,0.4)]" : "text-gray-400 hover:text-primary hover:bg-white/5"}`}
                  style={tab === t.id ? { background: `linear-gradient(135deg, #9c8033, #c9a84c)` } : {}}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Identidade do Personagem ── */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">

          {/* Portrait */}
          <div className="relative shrink-0 self-start">
            <div className="relative w-48 h-64 lg:w-56 lg:h-72 mx-auto lg:mx-0">
              {/* Glow ring */}
              <div className="absolute -inset-2 rounded-2xl opacity-40 blur-xl transition-opacity" style={{ background: `radial-gradient(ellipse, ${theme.accent}, transparent 70%)` }} />
              {/* Frame */}
              <div 
                className="relative w-full h-full rounded-full lg:rounded-2xl overflow-hidden border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] group cursor-pointer" 
                style={{ borderColor: `${theme.accent}60` }}
                onClick={() => setShowPortraitModal(true)}
              >
                <img 
                  src={character.image_url || getRacePresetImage(character.race)} 
                  alt="Retrato do personagem" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
                {/* Hover edit overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-[#c9a84c] border border-[#c9a84c]/40 px-3 py-1.5 rounded-full bg-black/40">Alterar Retrato 📷</span>
                </div>
                {/* Overlay com info na base */}
                <div className="absolute bottom-0 left-0 right-0 p-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }}>
                  <p className="text-2xl text-center">{theme.symbol}</p>
                </div>
              </div>
              {/* Botão flutuante dourado permanente para trocar foto (melhor UX celular) */}
              <button 
                onClick={() => setShowPortraitModal(true)}
                className="absolute bottom-2 right-2 z-20 w-9 h-9 rounded-full bg-gradient-to-r from-[#9c8033] to-[#c9a84c] hover:opacity-90 active:scale-95 text-black font-black flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                title="Alterar Retrato"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Level badge */}
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center text-sm font-heading font-black shadow-[0_0_15px_rgba(156,128,51,0.6)] border-2 border-black"
                style={{ background: `linear-gradient(135deg, #9c8033, #c9a84c)`, color: "black" }}>
                {character.level}
              </div>
            </div>
          </div>

          {/* Identidade */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-heading font-black leading-none" style={{ background: `linear-gradient(135deg, #fff, ${theme.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {character.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <p className="text-lg text-gray-400 font-medium">
                  {character.race} • {character.char_class || character.class_name} • Nível {character.level}
                </p>
                <button
                  onClick={() => {
                    setLevelUpHpGained(null);
                    setLevelUpSummary([]);
                    setLevelUpSummaryObj(null);
                    setShowLevelUpModal(true);
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(156,128,51,0.3)] flex items-center gap-1"
                  style={{ background: "linear-gradient(135deg, #9c8033, #c9a84c)" }}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Subir de Nível
                </button>
              </div>
            </div>

            {/* HP + CA + Iniciativa */}
            <div className="flex flex-wrap gap-3">
              {/* HP card */}
              <div className="rounded-2xl p-5 border flex-1 min-w-[260px] relative overflow-hidden group" style={{ background: "rgba(10,10,15,0.6)", borderColor: "rgba(255,255,255,0.08)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)" }}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${hpPct <= 30 ? "text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-rose-400"}`} fill={hpPct <= 30 ? "#ef4444" : "transparent"} />
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-black">Pontos de Vida</span>
                  </div>
                  {hpPct <= 30 && <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 animate-pulse">Crítico</span>}
                </div>
                
                <div className="flex items-center justify-between gap-4 relative z-10 mb-5">
                  <div className="flex gap-1.5">
                    <button onClick={() => handleAdjustHp(-5)} className="w-10 h-10 rounded-xl bg-gradient-to-b from-red-500/10 to-red-900/20 border border-red-500/20 text-red-400 hover:border-red-500/50 hover:bg-red-500/20 transition-all text-xs font-black flex items-center justify-center active:scale-90 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">-5</button>
                    <button onClick={() => handleAdjustHp(-1)} className="w-10 h-10 rounded-xl bg-gradient-to-b from-red-500/10 to-red-900/20 border border-red-500/20 text-red-400 hover:border-red-500/50 hover:bg-red-500/20 transition-all text-sm font-black flex items-center justify-center active:scale-90 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">-1</button>
                  </div>
                  
                  <div className="text-center flex-1 flex flex-col items-center justify-center relative">
                    <div className={`text-5xl md:text-6xl font-heading font-black tracking-tighter ${hpPct <= 30 ? "text-red-400" : hpPct <= 60 ? "text-yellow-400" : "text-emerald-400"}`} style={{ textShadow: "0 8px 30px rgba(0,0,0,0.6)" }}>
                      {hp}
                    </div>
                    <div className="text-[#8a8a93] text-[10px] font-black tracking-widest mt-1 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                      MÁX {maxHp}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button onClick={() => handleAdjustHp(1)} className="w-10 h-10 rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all text-sm font-black flex items-center justify-center active:scale-90 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">+1</button>
                    <button onClick={() => handleAdjustHp(5)} className="w-10 h-10 rounded-xl bg-gradient-to-b from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/20 transition-all text-xs font-black flex items-center justify-center active:scale-90 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">+5</button>
                  </div>
                </div>

                {/* HP bar */}
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/60 border border-white/5 relative z-10">
                  <div className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ 
                      width: `${hpPct}%`, 
                      background: hpPct > 60 ? "linear-gradient(90deg, #059669, #34d399)" : hpPct > 30 ? "linear-gradient(90deg, #ca8a04, #fde047)" : "linear-gradient(90deg, #dc2626, #fca5a5)",
                      boxShadow: hpPct <= 30 ? "0 0 10px #ef4444" : "none"
                    }}>
                    <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 border flex flex-col items-center justify-center min-w-[90px]" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(59,130,246,0.2)" }}>
                <Shield className="w-4 h-4 text-blue-400 mb-1" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">CA</p>
                <p className="text-3xl font-heading font-black text-blue-400">{getArmorClass()}</p>
              </div>

              <button 
                onClick={() => {
                  const initMod = calculateInitiative(character);
                  roll(20, initMod, "Iniciativa", { attr: initMod });
                }}
                className="rounded-2xl p-4 border flex flex-col items-center justify-center min-w-[90px] transition-all hover:scale-105 active:scale-95 cursor-pointer group" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(234,179,8,0.2)" }}>
                <Zap className="w-4 h-4 text-yellow-400 mb-1 group-hover:animate-pulse" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold group-hover:text-yellow-400/70 transition-colors">Iniciativa</p>
                <p className="text-3xl font-heading font-black text-yellow-400">{modStr(calculateInitiative(character))}</p>
              </button>

              <div className="rounded-2xl p-4 border flex flex-col items-center justify-center min-w-[90px]" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(156,128,51,0.2)" }}>
                <Star className="w-4 h-4 text-primary mb-1" />
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Prof.</p>
                <p className="text-3xl font-heading font-black text-primary">+{profBonus}</p>
              </div>
            </div>

            {/* Condições ativas */}
            {conditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {conditions.map(c => {
                  const cond = CONDITIONS.find(x => x.name === c);
                  return (
                    <button key={c} onClick={() => setConditions(p => p.filter(x => x !== c))}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-red-500/40 text-red-300 hover:bg-red-500/20 transition-colors">
                      {cond?.icon} {c} <X className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ ABA: CÓDICE (Atributos + Ações) ═══ */}
        {tab === "codice" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

            {/* Atributos */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-heading font-bold text-primary/80 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                Atributos
                <div className="h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent lg:hidden" />
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map(attr => {
                  const val = stats[attr] || 10;
                  const mod = calcMod(val);
                  const info = ATTR_INFO[attr];
                  const Icon = info?.icon || Star;
                  return (
                    <div key={attr} className="relative"
                      onMouseEnter={() => setHoveredAttr(attr)}
                      onMouseLeave={() => setHoveredAttr(null)}>
                      <button
                        onClick={() => roll(20, mod, `Teste de ${info?.name || attr}`, { attr: mod })}
                        className="w-full rounded-xl p-2 lg:p-3 border text-center group transition-all hover:scale-[1.03] active:scale-100"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderColor: hoveredAttr === attr ? `${theme.accent}60` : "rgba(255,255,255,0.07)",
                          boxShadow: hoveredAttr === attr ? `0 0 20px ${theme.accent}20` : "none"
                        }}>
                        <Icon className={`w-4 h-4 mx-auto mb-1.5 ${info?.color || "text-primary"} opacity-70 group-hover:opacity-100 transition-opacity`} />
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{attr}</p>
                        <p className={`text-2xl font-heading font-black ${info?.color || "text-primary"}`}>{modStr(mod)}</p>
                        <p className="text-[10px] text-gray-600 mt-1 bg-black/30 rounded-full px-2 inline-block">{val}</p>
                      </button>

                      {hoveredAttr === attr && (
                        <div className="absolute z-50 bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] pointer-events-none"
                          style={{ background: "linear-gradient(135deg, rgba(15,5,35,0.98), rgba(10,5,25,0.98))", border: `1px solid ${theme.accent}50` }}>
                          <div className="px-4 py-3 border-b border-white/5" style={{ background: `linear-gradient(90deg, ${theme.accent}20, transparent)` }}>
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${info?.color}`} />
                              <p className="font-heading font-bold text-white text-sm">{info?.name}</p>
                              <span className={`ml-auto text-sm font-heading font-black ${info?.color}`}>{modStr(mod)}</span>
                            </div>
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-xs text-gray-300 leading-relaxed">{info?.description}</p>
                            <div className="border-t border-white/5 pt-2">
                              <p className="text-xs text-primary/50 font-bold uppercase tracking-wider mb-1">Exemplos</p>
                              <p className="text-xs text-gray-500 italic">{info?.examples}</p>
                            </div>
                            <p className="text-xs text-primary/40 text-center pt-1">Clique para rolar d20{modStr(mod)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Perícias */}
            <div className="lg:col-span-4">
              <h2 className="text-xs font-heading font-bold text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                Perícias
                <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
              </h2>
              <div className="space-y-1">
                {SKILLS.map(skill => {
                  const skillDetails = calculateSkillBonus(character, skill.name, 0);
                  const isProf = skillDetails.isProficient;
                  const isExpt = skillDetails.hasExpertise;
                  return (
                    <button key={skill.name} onClick={() => roll(20, skillDetails.total, `${skill.name}${isExpt ? " (Expt.)" : isProf ? " (Prof.)" : ""}`, { attr: skillDetails.baseMod, prof: skillDetails.profBonus, expertise: (isExpt ? skillDetails.profBonus : 0), extra: skillDetails.extraBonus })}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-left transition-all hover:scale-[1.01] active:scale-100 group"
                      style={{ background: isExpt ? "rgba(156,128,51,0.08)" : isProf ? "rgba(156,128,51,0.04)" : "rgba(255,255,255,0.02)", borderColor: isExpt ? "rgba(156,128,51,0.4)" : isProf ? "rgba(156,128,51,0.25)" : "rgba(255,255,255,0.05)" }}>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                        {skill.name} <span className="text-[9px] text-gray-500">({skill.attr})</span>
                      </span>
                      <span className={`font-heading font-bold text-sm text-right shrink-0 ${isExpt ? "text-amber-400" : isProf ? "text-primary" : "text-gray-500"}`}>
                        {modStr(skillDetails.total)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ações */}
            <div className="lg:col-span-6 space-y-6">

              {/* Ataques */}
              <div>
                <h2 className="text-xs font-heading font-bold text-primary/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  Ataques & Combate
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(239,68,68,0.1)", background: "rgba(239,68,68,0.05)" }}>
                      <p className="font-heading font-bold text-red-400 flex items-center gap-2"><Sword className="w-4 h-4" /> Ataque Desarmado</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Corpo a corpo • {unarmedDmg.isMonk ? `${unarmedDmg.dice} + ${unarmedDmg.fixed}` : `Fixo: ${unarmedDmg.display}`}
                      </p>
                    </div>
                    <div className="p-3 flex gap-2">
                      <button onClick={() => {
                        const baseAttackMod = unarmedDmg.isMonk ? Math.max(calcMod(stats.FOR), calcMod(stats.DES)) : calcMod(stats.FOR);
                        roll(20, baseAttackMod + profBonus, "Ataque Desarmado (Acerto)", { attr: baseAttackMod, prof: profBonus });
                      }}
                        className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-100"
                        style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.8), rgba(220,38,38,0.8))" }}>
                        Acerto {modStr((unarmedDmg.isMonk ? Math.max(calcMod(stats.FOR), calcMod(stats.DES)) : calcMod(stats.FOR)) + profBonus)}
                      </button>
                      <button onClick={() => {
                        if (unarmedDmg.isMonk) {
                          const baseAttackMod = Math.max(calcMod(stats.FOR), calcMod(stats.DES));
                          const dieSize = getUnarmedDamageDie(character.char_class || character.class_name, character.level || 1);
                          roll(dieSize, baseAttackMod, "Ataque Desarmado (Dano)", { attr: baseAttackMod });
                        } else {
                          // flat damage 1 + FOR modifier, no dice (roll 0-sided dice)
                          roll(0, unarmedDmg.fixed, "Ataque Desarmado (Dano)", { extra: unarmedDmg.fixed });
                        }
                      }}
                        className="flex-1 py-2 rounded-xl text-sm font-bold text-red-300 border border-red-500/30 transition-all hover:bg-red-500/15 hover:scale-[1.02] active:scale-100">
                        Dano {unarmedDmg.isMonk ? `${unarmedDmg.dice}` : `${unarmedDmg.display}`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salvaguardas */}
              <div>
                <h2 className="text-xs font-heading font-bold text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  Salvaguardas
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                  {Object.entries(stats).filter(([attr]) => ["FOR","DES","CON","INT","SAB","CAR"].includes(attr)).map(([attr, val]: [string, any]) => {
                    const saveDetails = calculateSavingThrowBonus(character, attr, 0);
                    const info = ATTR_INFO[attr];
                    const Icon = info?.icon || Star;
                    return (
                      <button key={attr} onClick={() => roll(20, saveDetails.total, `Salvaguarda de ${info?.name || attr}`, { attr: saveDetails.baseMod, prof: saveDetails.profBonus, extra: saveDetails.extraBonus })}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-100 group"
                        style={{ background: saveDetails.isProficient ? "rgba(156,128,51,0.05)" : "rgba(255,255,255,0.02)", borderColor: saveDetails.isProficient ? "rgba(156,128,51,0.3)" : "rgba(255,255,255,0.07)" }}>
                        <Icon className={`w-4 h-4 ${info?.color} opacity-60 group-hover:opacity-100 transition-opacity shrink-0`} />
                        <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors flex-1 font-medium">
                          {attr} {saveDetails.isProficient && <span className="text-primary text-[9px] ml-1">●</span>}
                        </span>
                        <span className={`font-heading font-bold text-sm ${saveDetails.isProficient ? "text-primary" : info?.color}`}>{modStr(saveDetails.total)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condições */}
              <div>
                <h2 className="text-xs font-heading font-bold text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  Condições
                  <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {CONDITIONS.map(c => {
                    const active = conditions.includes(c.name);
                    return (
                      <button key={c.name} onClick={() => setConditions(p => active ? p.filter(x => x !== c.name) : [...p, c.name])}
                        title={c.desc}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all hover:scale-[1.02] active:scale-100 ${active ? "border-red-500/50" : "border-white/5 hover:border-white/15"}`}
                        style={{ background: active ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.02)" }}>
                        <span className="text-lg leading-none">{c.icon}</span>
                        <span className={`text-xs font-medium ${active ? "text-red-300" : "text-gray-400"}`}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Roll log */}
              {rollLog.length > 0 && (
                <div>
                  <h2 className="text-xs font-heading font-bold text-primary/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                    Últimas Rolagens
                    <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                  </h2>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {rollLog.map((r, i) => (
                      <div key={i} className={`flex flex-col px-4 py-2 rounded-xl border text-sm transition-all ${
                        i === 0 ? "border-primary/30" : "border-white/5"
                      } ${r.isCrit ? "border-yellow-500/50" : r.isFail ? "border-red-500/30" : ""}`}
                        style={{ background: i === 0 ? "rgba(156,128,51,0.1)" : "rgba(255,255,255,0.02)" }}>
                        <div className="flex justify-between w-full items-center">
                          <span className={`text-xs ${i === 0 ? "text-gray-200" : "text-gray-500"} font-bold`}>{r.label}</span>
                          <span className={`text-lg font-black ${r.isCrit ? "text-yellow-400" : r.isFail ? "text-red-400" : (i === 0 ? "text-white" : "text-gray-400")}`}>{r.total}</span>
                        </div>
                        {r.breakdown ? (
                          <div className="flex justify-between w-full mt-1 text-[10px] text-gray-500 border-t border-white/5 pt-1 uppercase font-bold tracking-widest">
                            <span>d{r.sides}: {r.result}</span>
                            {r.breakdown.attr !== undefined && <span>Mod: {modStr(r.breakdown.attr)}</span>}
                            {r.breakdown.prof !== undefined && <span>Prof: {modStr(r.breakdown.prof)}</span>}
                            {r.breakdown.extra !== undefined && <span>Extra: {modStr(r.breakdown.extra)}</span>}
                          </div>
                        ) : (r.modifier !== 0 && (
                          <div className="flex justify-between w-full mt-1 text-[10px] text-gray-500 border-t border-white/5 pt-1 uppercase font-bold tracking-widest">
                            <span>d{r.sides}: {r.result}</span>
                            <span>Mod: {modStr(r.modifier)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* ═══ ABA: COMBATE ═══ */}
        {tab === "combate" && (
          <div className="max-w-2xl space-y-6">
            {/* Stats rápidos */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Vida", value: `${hp}/${maxHp}`, color: hpPct <= 30 ? "text-red-400" : hpPct <= 60 ? "text-yellow-400" : "text-emerald-400", border: "rgba(255,255,255,0.07)" },
                { label: "CA", value: `${getArmorClass()}`, color: "text-blue-400", border: "rgba(59,130,246,0.2)" },
                { label: "Iniciativa", value: modStr(calcMod(stats.DES)), color: "text-yellow-400", border: "rgba(234,179,8,0.2)" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border text-center animate-in fade-in" style={{ background: "rgba(255,255,255,0.03)", borderColor: s.border }}>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className={`text-3xl font-heading font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Armas Equipadas (Ataques Rápidos) */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Ataques Disponíveis</p>
              {inventory.filter(i => i.type === "Arma" && i.equipped).length === 0 ? (
                <div className="rounded-2xl p-4 border border-white/5 text-center text-xs text-gray-500 bg-white/5">
                  Nenhuma arma equipada na mochila. Acesse a Mochila para equipar uma.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventory.filter(i => i.type === "Arma" && i.equipped).map((weapon, idx) => {
                    const isFinesse = weapon.name.toLowerCase().includes("adaga") || weapon.name.toLowerCase().includes("arco") || weapon.name.toLowerCase().includes("rapiara") || weapon.name.toLowerCase().includes("finesse");
                    const modifier = isFinesse ? Math.max(calcMod(stats.DES), calcMod(stats.FOR)) : calcMod(stats.FOR);
                    const bonusDamage = isRaging ? modifier + 2 : modifier;
                    const hitBonus = modifier + profBonus;
                    const dmgDie = weapon.bonus || 8; // Custom damage die size e.g. d6, d8, d10
                    return (
                      <div key={idx} className="rounded-2xl p-3 border border-red-500/25 bg-red-500/5 flex justify-between items-center gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-red-300 truncate">{weapon.name}</p>
                          <p className="text-[10px] text-gray-500">Mod: {modStr(modifier)} • Acerto: {modStr(hitBonus)} • Dano: 1d{dmgDie}{modStr(bonusDamage)}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => roll(20, hitBonus, `Acerto (${weapon.name})`, { attr: modifier, prof: profBonus })} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-100">Acerto</button>
                          <button onClick={() => roll(Number(dmgDie), bonusDamage, `Dano (${weapon.name})`, { attr: modifier, extra: isRaging ? 2 : 0 })} className="px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-bold text-red-300 hover:bg-red-500/10 transition-colors">Dano</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Guerreiro Superiority Dice & Maneuvers */}
            {(character.char_class === "Guerreiro" || character.class_name === "Guerreiro") && (
              <div className="rounded-2xl p-4 border border-[#9c8033]/30 bg-black/40 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-primary">Dados de Superioridade</p>
                    <p className="text-[10px] text-gray-500">Mestre de Batalha • Restantes: {superiorityDice} / {maxSuperiorityDice}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(maxSuperiorityDice)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newDiceVal = i < superiorityDice ? i : i + 1;
                          setSuperiorityDice(newDiceVal);
                          saveCharacterChanges({ stats: { superiorityDice: newDiceVal } });
                        }}
                        className={`w-6 h-6 rounded border text-[10px] font-bold flex items-center justify-center transition-colors ${
                          i < superiorityDice ? "bg-primary text-black border-primary" : "bg-transparent text-gray-500 border-gray-600"
                        }`}
                      >
                        d8
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="text-xs text-gray-400 font-bold">Manobras de Combate Disponíveis</p>
                  {[
                    { name: "Ataque de Precisão", desc: "Adiciona o Dado de Superioridade ao teste de acerto." },
                    { name: "Aparar (Parry)", desc: "Use reação para reduzir o dano de um ataque sofrido em 1d8 + modificador de Destreza." },
                    { name: "Derrubar (Trip Attack)", desc: "Adiciona 1d8 ao dano da arma. O inimigo faz TR FOR (CD 13) ou cai caído." },
                    { name: "Desarmar (Disarm)", desc: "Adiciona 1d8 ao dano. O inimigo faz TR FOR ou derruba o item que estiver segurando." }
                  ].map((man, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="text-xs">
                        <p className="font-bold text-white">{man.name}</p>
                        <p className="text-gray-500 text-[10px] leading-snug">{man.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (superiorityDice <= 0) {
                            alert("Sem dados de superioridade disponíveis! Faça um descanso curto.");
                            return;
                          }
                          const newDiceVal = superiorityDice - 1;
                          setSuperiorityDice(newDiceVal);
                          saveCharacterChanges({ stats: { superiorityDice: newDiceVal } });
                          const res = Math.floor(Math.random() * 8) + 1;
                          setRollLog(p => [{ label: `Manobra: ${man.name} (Dado Superioridade)`, result: res, modifier: 0, sides: 8, total: res, isCrit: false, isFail: false }, ...p]);
                        }}
                        className="self-start sm:self-auto px-3 py-1.5 bg-[#9c8033]/20 border border-[#9c8033]/40 text-[#9c8033] hover:bg-[#9c8033]/30 rounded-lg text-xs font-bold transition-all"
                      >
                        Usar d8
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bárbaro Rage */}
            {(character.char_class === "Bárbaro" || character.class_name === "Bárbaro") && (
              <div className="rounded-2xl p-4 border border-red-500/20 bg-red-950/10 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-red-400">Fúria Sombria</p>
                    <p className="text-[10px] text-gray-500">Dano Extra Fúria: +2 • Restantes: {rageSlots} / {maxRageSlots}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isRaging && rageSlots <= 0) {
                        alert("Sem usos de fúria restantes!");
                        return;
                      }
                      if (!isRaging) {
                        const newR = rageSlots - 1;
                        setRageSlots(newR);
                        setIsRaging(true);
                        saveCharacterChanges({ stats: { rageSlots: newR } });
                        setRollLog(p => [{ label: "Entrou em Fúria!", result: 0, modifier: 0, sides: 0, total: 0, isCrit: false, isFail: false }, ...p]);
                      } else {
                        setIsRaging(false);
                        setRollLog(p => [{ label: "Saiu da fúria.", result: 0, modifier: 0, sides: 0, total: 0, isCrit: false, isFail: false }, ...p]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isRaging ? "bg-red-600 text-white animate-pulse" : "bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-500/10"
                    }`}
                  >
                    {isRaging ? "Em Fúria" : "Entrar em Fúria"}
                  </button>
                </div>
              </div>
            )}

            {/* Ações de combate */}
            {(() => {
              const charClass = character.char_class || character.class_name || "Guerreiro";
              const knownSpells = character.spells || [];
              const hasCureWounds = knownSpells.some((s: string) => s.toLowerCase().includes("curar ferimentos") || s.toLowerCase().includes("cure wounds"));
              const spellClassAbility = getSpellcastingAbility(charClass);
              const spellcastingAbilityMod = spellClassAbility ? calcMod(stats[spellClassAbility] || 10) : 0;
              const hasSpellSlots1 = spellSlots[1] && spellSlots[1].current > 0;

              // Find healing potion in inventory
              const potionItem = inventory.find(i => {
                const n = (i.name || "").toLowerCase();
                return n.includes("poção de cura") || n.includes("potion of healing") || n.includes("poção de cura maior");
              });

              const isFighter = charClass === "Guerreiro";

              const healingActions: { label: string; onClick: () => void }[] = [];

              if (potionItem) {
                healingActions.push({
                  label: `Usar ${potionItem.name}`,
                  onClick: () => {
                    const isGreater = potionItem.name.toLowerCase().includes("maior") || potionItem.name.toLowerCase().includes("greater");
                    const r1 = Math.floor(Math.random() * 4) + 1;
                    const r2 = Math.floor(Math.random() * 4) + 1;
                    let healVal = r1 + r2 + 2;
                    let label = "Poção de Cura";
                    
                    if (isGreater) {
                      const r3 = Math.floor(Math.random() * 4) + 1;
                      const r4 = Math.floor(Math.random() * 4) + 1;
                      healVal = r1 + r2 + r3 + r4 + 4;
                      label = "Poção de Cura Maior";
                    }

                    const nextHp = Math.min(maxHp, hp + healVal);
                    setHp(nextHp);

                    // Remove or decrement potion in inventory
                    const updatedInventory = [...inventory];
                    const idx = updatedInventory.findIndex(i => i.name === potionItem.name);
                    if (idx !== -1) {
                      if (updatedInventory[idx].amount > 1) {
                        updatedInventory[idx] = { ...updatedInventory[idx], amount: updatedInventory[idx].amount - 1 };
                      } else {
                        updatedInventory.splice(idx, 1);
                      }
                    }
                    setInventory(updatedInventory);
                    saveCharacterChanges({ inventory: updatedInventory, stats: { currentHp: nextHp } });
                    
                    setRollLog(p => [{ label: `Usou ${label}`, result: healVal, modifier: 0, sides: 4, total: healVal, isCrit: false, isFail: false, breakdown: { extra: healVal } }, ...p]);
                  }
                });
              }

              if (isFighter) {
                healingActions.push({
                  label: `Retomar Fôlego (1d10+${character.level || 1})`,
                  onClick: () => {
                    const rollVal = Math.floor(Math.random() * 10) + 1;
                    const lvl = character.level || 1;
                    const healVal = rollVal + lvl;
                    const nextHp = Math.min(maxHp, hp + healVal);
                    setHp(nextHp);
                    saveCharacterChanges({ stats: { currentHp: nextHp } });
                    setRollLog(p => [{ label: "Usou Retomar o Fôlego", result: rollVal, modifier: lvl, sides: 10, total: healVal, isCrit: false, isFail: false, breakdown: { attr: lvl } }, ...p]);
                  }
                });
              }

              if (hasCureWounds && hasSpellSlots1) {
                healingActions.push({
                  label: `Curar Ferimentos (1d8+${spellcastingAbilityMod})`,
                  onClick: () => {
                    const rollVal = Math.floor(Math.random() * 8) + 1;
                    const healVal = rollVal + spellcastingAbilityMod;
                    const nextHp = Math.min(maxHp, hp + healVal);
                    
                    // Spend 1st-level spell slot
                    const updated = { ...spellSlots, 1: { ...spellSlots[1], current: spellSlots[1].current - 1 } };
                    setSpellSlots(updated);
                    setHp(nextHp);
                    saveCharacterChanges({ stats: { currentHp: nextHp, spellSlots1: updated[1].current } });
                    
                    setRollLog(p => [{ label: "Conjurou Curar Ferimentos", result: rollVal, modifier: spellcastingAbilityMod, sides: 8, total: healVal, isCrit: false, isFail: false, breakdown: { attr: spellcastingAbilityMod } }, ...p]);
                  }
                });
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="flex flex-col gap-2">
                    {healingActions.length > 0 ? (
                      healingActions.map((act, i) => (
                        <button key={i} onClick={act.onClick}
                          className="h-14 w-full rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-emerald-300 transition-all hover:scale-[1.02] active:scale-100 px-3 animate-in fade-in"
                          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                          <Heart className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span className="truncate">{act.label}</span>
                        </button>
                      ))
                    ) : (
                      <div className="h-14 w-full rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-gray-500 bg-white/5 border border-white/5 cursor-not-allowed">
                        Sem recursos de cura
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => {
                    const conProf = CLASS_SAVING_THROWS[character.char_class || character.class_name]?.includes("CON") ? profBonus : 0;
                    roll(20, calcMod(stats.CON) + conProf, "Salvaguarda CON", { attr: calcMod(stats.CON), prof: conProf });
                  }}
                    className="h-14 w-full rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-rose-300 transition-all hover:scale-[1.02] active:scale-100"
                    style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)" }}>
                    <Shield className="w-4 h-4" /> Salv. CON
                  </button>
                </div>
              );
            })()}

            {/* Rest buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setHp(maxHp);
                  if (character.char_class === "Guerreiro") {
                    setSuperiorityDice(maxSuperiorityDice);
                    saveCharacterChanges({ stats: { currentHp: maxHp, superiorityDice: maxSuperiorityDice } });
                  } else if (character.char_class === "Bárbaro") {
                    setRageSlots(maxRageSlots);
                    saveCharacterChanges({ stats: { currentHp: maxHp, rageSlots: maxRageSlots } });
                  } else {
                    saveCharacterChanges({ stats: { currentHp: maxHp } });
                  }
                  // Reset spell slots
                  const fullSlots = getSpellSlotsByLevel(character.level || 1, character.char_class || character.class_name);
                  const updatedSlots = {
                    1: { current: fullSlots[1], max: fullSlots[1] },
                    2: { current: fullSlots[2], max: fullSlots[2] },
                    3: { current: fullSlots[3], max: fullSlots[3] },
                  };
                  setSpellSlots(updatedSlots);
                  saveCharacterChanges({ stats: { currentHp: maxHp, spellSlots1: fullSlots[1], spellSlots2: fullSlots[2], spellSlots3: fullSlots[3] } });
                  setRollLog(p => [{ label: "Descanso Longo Concluído", result: 0, modifier: 0, sides: 0, total: 0, isCrit: false, isFail: false }, ...p]);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-white/5 hover:bg-white/5 transition-colors text-gray-300"
              >
                Descanso Longo (Resetar Tudo)
              </button>
            </div>

            {/* Roll log compacto */}
            {rollLog.length > 0 && (
              <div className="rounded-2xl p-4 border animate-in slide-in-from-bottom-2 duration-300" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-3">Log de Combate</p>
                <div className="space-y-1.5">
                  {rollLog.slice(0, 6).map((r, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-1">
                      <span className={i === 0 ? "text-gray-200" : "text-gray-500"}>{r.label}</span>
                      <div className="text-right">
                        {r.sides > 0 && (
                          <span className="text-[10px] text-gray-500 block">
                            d{r.sides}: {r.result}{r.modifier !== 0 ? ` ${r.modifier >= 0 ? "+" : ""}${r.modifier}` : ""}
                          </span>
                        )}
                        <span className={`font-heading font-bold ${r.isCrit ? "text-yellow-400" : r.isFail ? "text-red-400" : i === 0 ? "text-primary" : "text-gray-600"}`}>
                          {r.isCrit ? "🌟 CRÍTICO! " : r.isFail ? "💀 FALHA! " : ""}{r.sides > 0 ? r.total : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ABA: MOCHILA (Inventory) ═══ */}
        {tab === "mochila" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl p-4 border border-white/5 text-left" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Carga da Mochila</span>
                <span className="text-xs text-primary font-bold">
                  {inventory.reduce((acc, item) => acc + (Number(item.weight) || 0) * (Number(item.amount) || 1), 0).toFixed(1)} / {(stats.FOR || 10) * 15} lbs
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-white/5">
                <div className="h-full rounded-full transition-all bg-primary"
                  style={{
                    width: `${Math.min(100, (inventory.reduce((acc, item) => acc + (Number(item.weight) || 0) * (Number(item.amount) || 1), 0) / ((stats.FOR || 10) * 15)) * 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5 leading-normal">Se o peso exceder o limite (FOR * 15 libras), seu personagem fica sobrecarregado.</p>
            </div>

            {/* Add Item form + Catalog */}
            <div className="rounded-2xl p-4 border border-primary/20 bg-card/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Mochila / Adicionar Item</p>
                <button
                  onClick={() => setShowEquipmentCatalog(!showEquipmentCatalog)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#c9a84c]/50 bg-[#1a1a2e] text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(201,168,76,0.15)]"
                >
                  {showEquipmentCatalog ? "✕ Fechar Loja" : "🛒 Loja / Catálogo Geral"}
                </button>
              </div>

              {showEquipmentCatalog && (
                <div className="border border-primary/15 rounded-xl overflow-hidden bg-black/30">
                  <div className="p-3 border-b border-white/5">
                    <Input
                      placeholder="Buscar equipamento..."
                      value={equipCatalogSearch}
                      onChange={e => setEquipCatalogSearch(e.target.value)}
                      className="bg-black/30 border-white/10 text-xs h-8"
                    />
                    <div className="flex gap-1 mt-2">
                      {(["armas", "armaduras", "outros"] as const).map(t => (
                        <button key={t} onClick={() => setEquipCatalogTab(t)}
                          className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase transition-all ${
                            equipCatalogTab === t ? "bg-primary text-black border-primary" : "border-white/10 text-gray-400 hover:border-white/30"
                          }`}>
                          {t === "armas" ? "⚔️ Armas" : t === "armaduras" ? "🛡️ Armaduras" : "🎒 Outros"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {(() => {
                      const allItems = equipCatalogTab === "armas"
                        ? [...DND_EQUIPMENT_CATALOG.weapons_simple_melee, ...DND_EQUIPMENT_CATALOG.weapons_simple_ranged, ...DND_EQUIPMENT_CATALOG.weapons_martial_melee, ...DND_EQUIPMENT_CATALOG.weapons_martial_ranged]
                        : equipCatalogTab === "armaduras"
                        ? [...DND_EQUIPMENT_CATALOG.armor, ...DND_EQUIPMENT_CATALOG.shields]
                        : DND_EQUIPMENT_CATALOG.adventuring_gear;
                        
                      const getEstimatedPrice = (item: any) => {
                        const n = item.name.toLowerCase();
                        if (n.includes("poção")) return "50 PO";
                        if (n.includes("corda")) return "1 PO";
                        if (n.includes("mochila") || n.includes("kit")) return "5 PO";
                        if (item.type === "Arma") return `${item.bonus * 2} PO`;
                        if (item.type === "Armadura") {
                           if (item.bonus >= 18) return "1500 PO";
                           if (item.bonus >= 16) return "200 PO";
                           return `${item.bonus * 4} PO`;
                        }
                        if (item.type === "Escudo") return "10 PO";
                        return "2 PO";
                      };

                      return allItems
                        .filter(item => item.name.toLowerCase().includes(equipCatalogSearch.toLowerCase()) || (item.desc && item.desc.toLowerCase().includes(equipCatalogSearch.toLowerCase())))
                        .map((item, idx) => (
                          <div key={idx} className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#e8dfc0]">{item.name}</p>
                              <p className="text-[10px] text-gray-500 mb-1">{item.desc || "Item de Aventura"}</p>
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-500 text-[10px] font-bold">
                                💰 {getEstimatedPrice(item)}
                              </div>
                            </div>
                            <Button size="sm" onClick={() => {
                              const newItem = { name: item.name, type: item.type || "Equipamento", weight: item.weight || 1, amount: 1, bonus: item.bonus || 0, equipped: false };
                              const updated = [...inventory, newItem];
                              setInventory(updated);
                              saveCharacterChanges({ inventory: updated });
                            }}
                              className="bg-[#1a1a2e] text-[#c9a84c] border border-[#c9a84c]/30 hover:bg-[#c9a84c] hover:text-black shrink-0 h-8 text-xs font-bold transition-all px-3 uppercase">
                              Comprar / Add
                            </Button>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Nome do Item..." value={newItemName} onChange={e => setNewItemName(e.target.value)} className="bg-black/20 border-white/10 text-xs h-9" />
                <select value={newItemType} onChange={e => setNewItemType(e.target.value)} className="bg-black/20 border border-white/10 rounded-lg text-xs h-9 px-2 text-white outline-none focus:border-primary/50">
                  <option value="Equipamento" className="bg-[#0f0f18] text-white">Equipamento</option>
                  <option value="Arma" className="bg-[#0f0f18] text-white">Arma</option>
                  <option value="Armadura" className="bg-[#0f0f18] text-white">Armadura</option>
                  <option value="Escudo" className="bg-[#0f0f18] text-white">Escudo</option>
                  <option value="Poção" className="bg-[#0f0f18] text-white">Poção</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Peso (lbs)</span>
                  <Input type="number" value={newItemWeight} onChange={e => setNewItemWeight(Number(e.target.value))} className="bg-black/20 border-white/10 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Qtd</span>
                  <Input type="number" value={newItemAmount} onChange={e => setNewItemAmount(Number(e.target.value))} className="bg-black/20 border-white/10 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    {newItemType === "Armadura" ? "CA Base" : newItemType === "Escudo" ? "Bônus CA" : newItemType === "Arma" ? "Dado Dano" : "Valor"}
                  </span>
                  <Input type="number" value={newItemBonus} onChange={e => setNewItemBonus(Number(e.target.value))} className="bg-black/20 border-white/10 text-xs h-9" />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!newItemName.trim()) return;
                  const item = { name: newItemName, type: newItemType, weight: newItemWeight, amount: newItemAmount, bonus: newItemBonus, equipped: false };
                  const updated = [...inventory, item];
                  setInventory(updated);
                  saveCharacterChanges({ inventory: updated });
                  setNewItemName(""); setNewItemWeight(0); setNewItemAmount(1);
                  setNewItemBonus(newItemType === "Armadura" ? 11 : newItemType === "Escudo" ? 2 : 8);
                }}
                className="w-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs font-bold"
              >
                Colocar na Mochila
              </Button>
            </div>

            {/* List items */}
            <div className="space-y-2">
              {inventory.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 transition-all text-left" style={{ background: "rgba(255,255,255,0.015)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">
                      {item.type} • {item.weight} lbs • Qtd: {item.amount}
                      {item.type === "Armadura" && ` • CA Base ${item.bonus}`}
                      {item.type === "Escudo" && ` • Bônus CA +${item.bonus}`}
                      {item.type === "Arma" && ` • Dano 1d${item.bonus}`}
                    </p>
                  </div>
                  {["Arma", "Armadura", "Escudo"].includes(item.type) && (
                    <button
                      onClick={() => {
                        const updated = inventory.map((itm, i) => {
                          if (i === idx) {
                            return { ...itm, equipped: !itm.equipped };
                          }
                          if (item.type === "Armadura" && itm.type === "Armadura" && itm.equipped) {
                            return { ...itm, equipped: false };
                          }
                          return itm;
                        });
                        setInventory(updated);
                        saveCharacterChanges({ inventory: updated });
                      }}
                      className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                        item.equipped ? "bg-emerald-500/25 border border-emerald-500/40 text-emerald-300" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {item.equipped ? "Equipado" : "Equipar"}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const updated = inventory.filter((_, i) => i !== idx);
                      setInventory(updated);
                      saveCharacterChanges({ inventory: updated });
                    }}
                    className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ABA: GRIMÓRIO (Spells Browser) ═══ */}
        {tab === "grimorio" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar magia no Grimório..."
                  value={searchSpell}
                  onChange={e => setSearchSpell(e.target.value)}
                  className="bg-card/40 border-primary/20 text-xs flex-1"
                />
                <select value={spellLevelFilter} onChange={e => setSpellLevelFilter(e.target.value)} className="bg-[#0f0f18] border border-white/10 rounded-lg text-xs px-2 text-white outline-none">
                  <option value="Todos">Todos Círculos</option>
                  <option value="0">Truque</option>
                  <option value="1">1º Círculo</option>
                  <option value="2">2º Círculo</option>
                  <option value="3">3º Círculo</option>
                </select>
              </div>

              {/* Spell Slots tracker for spellcasters */}
              {["Mago", "Feiticeiro", "Clérigo", "Druida", "Bardo", "Bruxo", "Paladino", "Patrulheiro"].includes(character.char_class || character.class_name) && (
                <div className="rounded-2xl p-4 border border-white/5 bg-white/5 space-y-3">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Espaços de Magia</p>
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3].map(lvl => {
                      const slots = spellSlots[lvl];
                      if (!slots || slots.max === 0) return null;
                      return (
                        <div key={lvl} className="flex-1 min-w-[100px] text-center bg-black/25 p-2 rounded-xl border border-white/5">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{lvl}º Círculo</p>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <button onClick={() => {
                              const updated = { ...spellSlots, [lvl]: { ...slots, current: Math.max(0, slots.current - 1) } };
                              setSpellSlots(updated);
                              saveCharacterChanges({ stats: { [`spellSlots${lvl}`]: updated[lvl].current } });
                            }} className="w-5 h-5 rounded-full border border-white/15 text-xs text-gray-400 hover:text-white flex items-center justify-center">-</button>
                            <span className="text-sm font-bold text-white">{slots.current} / {slots.max}</span>
                            <button onClick={() => {
                              const updated = { ...spellSlots, [lvl]: { ...slots, current: Math.min(slots.max, slots.current + 1) } };
                              setSpellSlots(updated);
                              saveCharacterChanges({ stats: { [`spellSlots${lvl}`]: updated[lvl].current } });
                            }} className="w-5 h-5 rounded-full border border-white/15 text-xs text-gray-400 hover:text-white flex items-center justify-center">+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spells List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {spellsData
                  .filter(s => {
                    const matchSearch = s.name_pt.toLowerCase().includes(searchSpell.toLowerCase()) || s.name_en.toLowerCase().includes(searchSpell.toLowerCase());
                    const matchLevel = spellLevelFilter === "Todos" || String(s.level) === spellLevelFilter;
                    return matchSearch && matchLevel;
                  })
                  .slice(0, 50)
                  .map((spell, idx) => {
                    const knownSpells = character.spells || [];
                    const isKnown = knownSpells.includes(spell.name_pt || spell.name_en);
                    return (
                      <div key={idx} onClick={() => setSelectedSpell(spell)} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center font-bold text-xs text-primary bg-primary/5 shrink-0">
                          {spell.level === 0 ? "T" : spell.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-200 truncate">{spell.name_pt}</p>
                          <p className="text-[10px] text-gray-500 font-bold truncate">{spell.school} • {spell.range}</p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            const knownSpells = character.spells || [];
                            const name = spell.name_pt || spell.name_en;
                            const updated = isKnown ? knownSpells.filter((n: string) => n !== name) : [...knownSpells, name];
                            saveCharacterChanges({ spells: updated });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isKnown ? "bg-primary/20 border border-primary/30 text-primary" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          {isKnown ? "Conhecida" : "Aprender"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Spell details side-view */}
            <div className="rounded-2xl border border-primary/20 bg-card/30 p-4 space-y-4 self-start sticky top-24">
              {selectedSpell ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-heading text-lg font-bold text-primary">{selectedSpell.name_pt}</h4>
                    <p className="text-xs text-gray-500 italic">{selectedSpell.name_en} • Círculo {selectedSpell.level === 0 ? "Truque" : selectedSpell.level}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <p><strong>Tempo:</strong> {selectedSpell.casting_time}</p>
                    <p><strong>Alcance:</strong> {selectedSpell.range}</p>
                    <p><strong>Duração:</strong> {selectedSpell.duration}</p>
                    <p><strong>Escola:</strong> {selectedSpell.school}</p>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex-1 flex flex-col">
                    <p className="text-xs text-gray-300 leading-relaxed overflow-y-auto whitespace-pre-line flex-1 mb-3">{selectedSpell.description}</p>
                    
                    {/* Dice Parser Buttons */}
                    {(() => {
                      const diceMatches = Array.from(new Set(selectedSpell.description.match(/\b(\d+d\d+)\b/gi) || []));
                      if (diceMatches.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-2 mb-3 bg-red-950/20 p-2 rounded-xl border border-red-500/20">
                            {diceMatches.map((dice: any, i: number) => (
                              <button
                                key={i}
                                onClick={() => rollDamage(dice, selectedSpell.name_pt || "Magia")}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 font-bold text-xs rounded-lg border border-red-500/30 hover:bg-red-500/40 hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.1)] active:scale-95"
                              >
                                🎲 Rolar {dice}
                              </button>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Spell Actions */}
                    <div className="mt-auto flex flex-col gap-2">
                      {selectedSpell.level > 0 ? (
                        <button
                          onClick={() => {
                            const lvl = selectedSpell.level;
                            const slots = spellSlots[lvl];
                            if (slots && slots.current > 0) {
                              const updated = { ...spellSlots, [lvl]: { ...slots, current: slots.current - 1 } };
                              setSpellSlots(updated);
                              saveCharacterChanges({ stats: { [`spellSlots${lvl}`]: updated[lvl].current } });
                              setRollLog(p => [{ label: `Conjurou: ${selectedSpell.name_pt}`, result: 1, modifier: 0, sides: 0, total: 1, isCrit: false, isFail: false }, ...p]);
                            } else {
                              alert("Sem espaços de magia de nível " + lvl + " disponíveis!");
                            }
                          }}
                          className={`w-full py-2.5 font-black text-xs rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all active:scale-95 ${
                            spellSlots[selectedSpell.level] && spellSlots[selectedSpell.level].current > 0
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                          }`}
                        >
                          {spellSlots[selectedSpell.level] && spellSlots[selectedSpell.level].current > 0 
                            ? `⚡ Conjurar (Gasta Slot ${selectedSpell.level})` 
                            : `❌ Sem Slots de Nível ${selectedSpell.level}`}
                        </button>
                      ) : (
                         <button
                          onClick={() => {
                            setRollLog(p => [{ label: `Conjurou Truque: ${selectedSpell.name_pt}`, result: 1, modifier: 0, sides: 0, total: 1, isCrit: false, isFail: false }, ...p]);
                          }}
                          className="w-full py-2.5 font-black text-xs rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white hover:from-purple-500 hover:to-fuchsia-500 transition-all border border-purple-400/30 shadow-[0_4px_10px_rgba(0,0,0,0.3)] active:scale-95"
                        >
                          ✨ Conjurar Truque (Livre)
                        </button>
                      )}
                    </div>
                  </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-xs">
                  <Scroll className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Selecione uma magia para ver os detalhes arcanos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ABA: DADOS ═══ */}
        {tab === "dados" && (
          <div className="max-w-xl space-y-6">
            {/* Resultado destaque */}
            {lastRoll && (
              <div className="rounded-3xl p-8 text-center border" style={{ background: "rgba(255,255,255,0.02)", borderColor: `${theme.accent}40`, boxShadow: `0 0 40px ${theme.accent}10` }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{lastRoll.label}</p>
                <p className={`text-7xl font-heading font-black ${lastRoll.isCrit ? "text-yellow-400" : lastRoll.isFail ? "text-red-400" : "text-primary"}`}>
                  {lastRoll.total}
                </p>
                {lastRoll.isCrit && <p className="text-yellow-400 font-bold mt-2 text-lg">🌟 CRÍTICO!</p>}
                {lastRoll.isFail && <p className="text-red-400 font-bold mt-2 text-lg">💀 FALHA CRÍTICA!</p>}
                {lastRoll.modifier !== 0 && <p className="text-gray-500 text-sm mt-1">d{lastRoll.sides}: {lastRoll.result} {lastRoll.modifier >= 0 ? "+" : ""}{lastRoll.modifier} = {lastRoll.total}</p>}
              </div>
            )}

            {/* Dados */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Escolha o Dado</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[4, 6, 8, 10, 12, 20, 100].map(d => (
                  <button key={d} onClick={() => roll(d, 0, `d${d}`)}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 border"
                    style={{
                      background: `linear-gradient(135deg, rgba(60,20,80,0.6), rgba(15,5,35,0.8))`,
                      borderColor: `${theme.accent}40`,
                    }}>
                    <span className="text-primary/60 text-base">⬡</span>
                    <span className="text-xs font-heading font-bold text-primary">d{d}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vantagem / Desvantagem */}
            <div className="grid grid-cols-2 gap-3">
            <button onClick={rollAdvantage}
                className="h-14 rounded-2xl text-sm font-bold text-emerald-300 border border-emerald-500/30 transition-all hover:bg-emerald-500/10 hover:scale-[1.02]">
                Vantagem
              </button>
              <button onClick={rollDisadvantage}
                className="h-14 rounded-2xl text-sm font-bold text-red-300 border border-red-500/30 transition-all hover:bg-red-500/10 hover:scale-[1.02]">
                Desvantagem
              </button>
            </div>

            {/* Histórico */}
            {rollLog.length > 1 && (
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {rollLog.slice(1).map((r, i) => (
                  <div key={i} className="flex justify-between text-sm px-3 py-2 rounded-xl border border-white/5 text-left" style={{ background: "rgba(255,255,255,0.015)" }}>
                    <span className="text-gray-500">{r.label}</span>
                    <span className={`font-heading font-bold ${r.isCrit ? "text-yellow-400" : r.isFail ? "text-red-400" : "text-gray-400"}`}>{r.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ABA: TALENTOS ═══ */}
        {tab === "talentos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left items-start">
            
            {/* Lista de Talentos Ativos */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-primary uppercase tracking-widest text-xs flex items-center gap-2">
                <div className="h-px w-8 bg-primary/40" /> Seus Talentos
              </h3>
              
              {!character.feats || character.feats.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs border border-white/5 rounded-2xl bg-white/5">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Nenhum talento adquirido ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {character.feats.map((f: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl border border-primary/20 bg-card/30 relative group">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-primary">{f.name}</h4>
                        <button onClick={() => {
                          const updated = character.feats.filter((_:any, idx:number) => idx !== i);
                          saveCharacterChanges({ feats: updated });
                        }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                      {f.requirement && <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Pré-req: {f.requirement}</p>}
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adicionar Novo Talento */}
            <div className="rounded-2xl border border-primary/20 bg-card/30 p-5 space-y-5 sticky top-24">
              <h3 className="font-heading font-bold text-white uppercase tracking-widest text-xs">Adicionar Talento</h3>
              
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Escolha um talento comum da lista SRD:</p>
                <select 
                  className="w-full bg-[#0f0f18] border border-white/10 rounded-lg text-sm p-2.5 text-white outline-none focus:border-primary/50"
                  onChange={(e) => {
                    const feat = DND_FEATS.find(f => f.name === e.target.value);
                    if (feat) {
                      const currentFeats = character.feats || [];
                      if (!currentFeats.some((f:any) => f.name === feat.name)) {
                        saveCharacterChanges({ feats: [...currentFeats, feat] });
                      }
                      e.target.value = ""; // reset
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Selecionar Talento SRD --</option>
                  {DND_FEATS.map(f => (
                    <option key={f.name} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] text-gray-500 font-bold uppercase">Ou crie o seu</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <form className="space-y-3" onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('featName') as HTMLInputElement).value;
                const req = (form.elements.namedItem('featReq') as HTMLInputElement).value;
                const desc = (form.elements.namedItem('featDesc') as HTMLTextAreaElement).value;
                
                if (name && desc) {
                  const currentFeats = character.feats || [];
                  saveCharacterChanges({ feats: [...currentFeats, { name, requirement: req, desc }] });
                  form.reset();
                }
              }}>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Nome do Talento</label>
                  <input name="featName" placeholder="Ex: Atirador de Elite" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm mt-1 outline-none focus:border-primary/50 text-white" required />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Pré-requisito (Opcional)</label>
                  <input name="featReq" placeholder="Ex: Destreza 13 ou superior" className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm mt-1 outline-none focus:border-primary/50 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Descrição / Bônus</label>
                  <textarea name="featDesc" placeholder="Descreva os efeitos passivos e ativos..." className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm mt-1 outline-none focus:border-primary/50 text-white resize-none" required />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95" style={{ background: "linear-gradient(135deg, #9c8033, #c9a84c)" }}>
                  <Sparkles className="w-4 h-4" /> Adicionar Talento Personalizado
                </button>
              </form>

            </div>
          </div>
        )}

      </div>

      {/* Level Up Modal */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-primary/30 p-6 shadow-[0_0_50px_rgba(156,128,51,0.25)] overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "linear-gradient(135deg, rgba(20,10,35,0.98), rgba(10,5,20,0.98))" }}>
            <button onClick={() => { setShowLevelUpModal(false); setLevelUpHpGained(null); setLevelUpSummary([]); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-4">
              <Sparkles className="w-10 h-10 text-primary mx-auto animate-pulse" />
              <h3 className="font-heading text-2xl font-bold text-primary">Subir de Nível</h3>
              <p className="text-sm text-gray-300">
                Nível <span className="text-primary font-bold">{character.level || 1}</span> → <span className="text-emerald-400 font-black text-lg">{(character.level || 1) + 1}</span>
              </p>

              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 space-y-3 text-left">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Dado de Vida da Classe</span>
                  <span className="font-bold text-primary">d{getHitDie()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Bônus de Constituição</span>
                  <span className="font-bold text-rose-400">{modStr(Math.floor(((stats.CON || 10) - 10) / 2))}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Bônus de Proficiência atual</span>
                  <span className="font-bold text-primary">+{profBonus} → +{calculateProficiencyBonus((character.level || 1) + 1)}</span>
                </div>
                
                {levelUpHpGained === null ? (
                  <button
                    onClick={() => {
                      setRollingLevelUp(true);
                      setTimeout(() => {
                        const rollVal = Math.floor(Math.random() * getHitDie()) + 1;
                        const conMod = Math.floor(((stats.CON || 10) - 10) / 2);
                        const gained = Math.max(1, rollVal + conMod);
                        setLevelUpHpGained(gained);
                        setRollingLevelUp(false);
                        setRollLog(p => [{ label: `Dado de Vida (Nível Up)`, result: rollVal, modifier: conMod, sides: getHitDie(), total: gained, isCrit: false, isFail: false }, ...p]);
                      }, 800);
                    }}
                    disabled={rollingLevelUp}
                    className="w-full py-2.5 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #9c8033, #c9a84c)" }}
                  >
                    🎲 {rollingLevelUp ? "Rolando..." : "Rolar Dado de Vida"}
                  </button>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">HP Adicionado</p>
                    <p className="text-4xl font-heading font-black text-emerald-400">+{levelUpHpGained}</p>
                    <p className="text-xs text-gray-400">Novo HP Máximo: <span className="text-white font-bold">{maxHp + levelUpHpGained}</span></p>
                  </div>
                )}
              </div>

              {/* Summary of what changes */}
              {levelUpSummaryObj && (
                <div className="border border-emerald-500/20 rounded-2xl p-4 bg-emerald-950/10 text-left space-y-3">
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Nível {levelUpSummaryObj.novoNivel} Alcançado!
                  </p>
                  
                  <div className="space-y-2 text-xs text-gray-300">
                    <p>• <strong>Pontos de Vida:</strong> <span className="text-emerald-400 font-bold">+{levelUpSummaryObj.vidaAdicionada} HP</span> (Novo HP Máx: {maxHp})</p>
                    
                    {levelUpSummaryObj.proficienciaMudou && (
                      <p>• <strong>Bônus de Proficiência:</strong> aumentou para <span className="text-emerald-400">+{levelUpSummaryObj.novaProficiencia}</span></p>
                    )}
                    
                    {levelUpSummaryObj.habilidadesClasse.length > 0 && (
                      <div>
                        <p className="font-semibold text-zinc-400">Habilidades de Classe:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-gray-400">
                          {levelUpSummaryObj.habilidadesClasse.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {levelUpSummaryObj.habilidadesSubclasse.length > 0 && (
                      <div>
                        <p className="font-semibold text-zinc-400">Habilidades de Subclasse:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-gray-400">
                          {levelUpSummaryObj.habilidadesSubclasse.map((h: string, i: number) => <li key={i}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {levelUpSummaryObj.novosEspacosMagia.length > 0 && (
                      <div>
                        <p className="font-semibold text-zinc-400">Novos Espaços de Magia:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-gray-400">
                          {levelUpSummaryObj.novosEspacosMagia.map((s: any, i: number) => (
                            <li key={i}>{s.circulo}º Círculo: {s.anterior} → {s.novo} slots</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {levelUpSummaryObj.escolhasPendentes.length > 0 && (
                      <div className="border-t border-yellow-500/10 pt-1.5 mt-1.5">
                        <p className="font-semibold text-yellow-400">⚠️ Escolhas Pendentes:</p>
                        <ul className="list-disc pl-4 space-y-0.5 text-yellow-300/80">
                          {levelUpSummaryObj.escolhasPendentes.map((e: string, i: number) => <li key={i}>{e}</li>)}
                        </ul>
                      </div>
                    )}
                    
                    {levelUpSummaryObj.observacoes.length > 0 && (
                      <div className="border-t border-white/5 pt-1.5 mt-1.5 text-[10px] text-gray-500 italic">
                        {levelUpSummaryObj.observacoes.map((o: string, i: number) => <p key={i}>{o}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => { setShowLevelUpModal(false); setLevelUpHpGained(null); setLevelUpSummary([]); setLevelUpSummaryObj(null); }} className="flex-1 hover:bg-white/5 border border-white/5 text-gray-400">
                  Cancelar
                </Button>
                <button
                  disabled={levelUpHpGained === null || isLevelingUp}
                  onClick={async () => {
                    if (levelUpSummaryObj) {
                      setShowLevelUpModal(false);
                      setLevelUpHpGained(null);
                      setLevelUpSummaryObj(null);
                      return;
                    }
                    if (isLevelingUp) return;
                    setIsLevelingUp(true);

                    try {
                      const charClass = character.char_class || character.class_name || "Guerreiro";
                      const nextLevel = (character.level || 1) + 1;
                      const addedHp = levelUpHpGained || 6;
                      const newMaxHp = maxHp + addedHp;
                      const newHp = Math.min(hp + addedHp, newMaxHp);
                      const newProfBonus = calculateProficiencyBonus(nextLevel);
                      const oldProfBonus = calculateProficiencyBonus(character.level || 1);

                      // Build LevelUpSummary object
                      const summaryObj = {
                        nivelAnterior: character.level || 1,
                        novoNivel: nextLevel,
                        vidaAdicionada: addedHp,
                        proficienciaMudou: newProfBonus > oldProfBonus,
                        novaProficiencia: newProfBonus,
                        habilidadesClasse: [] as string[],
                        habilidadesSubclasse: [] as string[],
                        novosEspacosMagia: [] as { circulo: number; anterior: number; novo: number }[],
                        observacoes: [] as string[],
                        escolhasPendentes: [] as string[]
                      };

                      // Class Features Map
                      const CLASS_FEATURES_BY_LEVEL: Record<string, Record<number, string[]>> = {
                        "Guerreiro": {
                          2: ["Surto de Ação (1/descanso)"],
                          3: ["Arquétipo Marcial (Subclasse)"],
                          4: ["Melhoria de Atributo (ASI) / Talento"],
                          5: ["Ataque Extra"],
                          6: ["Melhoria de Atributo (ASI) / Talento"],
                          7: ["Habilidade de Subclasse"],
                          8: ["Melhoria de Atributo (ASI) / Talento"],
                          9: ["Indomável (1/descanso)"],
                          10: ["Habilidade de Subclasse"],
                          11: ["Ataque Extra (2)"],
                          12: ["Melhoria de Atributo (ASI) / Talento"],
                          13: ["Indomável (2/descanso)"],
                          14: ["Melhoria de Atributo (ASI) / Talento"],
                          15: ["Habilidade de Subclasse"],
                          16: ["Melhoria de Atributo (ASI) / Talento"],
                          17: ["Surto de Ação (2/descanso)", "Indomável (3/descanso)"],
                          18: ["Habilidade de Subclasse"],
                          19: ["Melhoria de Atributo (ASI) / Talento"],
                          20: ["Ataque Extra (3)"]
                        },
                        "Mago": {
                          2: ["Tradição Arcana (Subclasse)"],
                          3: ["Magias de 2º Círculo"],
                          4: ["Melhoria de Atributo (ASI) / Talento"],
                          5: ["Magias de 3º Círculo"],
                          6: ["Habilidade de Subclasse"],
                          8: ["Melhoria de Atributo (ASI) / Talento"],
                          10: ["Habilidade de Subclasse"],
                          12: ["Melhoria de Atributo (ASI) / Talento"],
                          14: ["Habilidade de Subclasse"],
                          16: ["Melhoria de Atributo (ASI) / Talento"],
                          18: ["Domínio de Magia"],
                          19: ["Melhoria de Atributo (ASI) / Talento"],
                          20: ["Assinatura Arcana"]
                        },
                        "Bárbaro": {
                          2: ["Ataque Temerário", "Sentido de Perigo"],
                          3: ["Caminho Primordial (Subclasse)"],
                          4: ["Melhoria de Atributo (ASI) / Talento"],
                          5: ["Ataque Extra", "Movimento Rápido (+3m)"],
                          6: ["Habilidade de Subclasse"],
                          7: ["Instinto Selvagem"],
                          8: ["Melhoria de Atributo (ASI) / Talento"],
                          9: ["Crítico Brutal (1 dado)"],
                          10: ["Habilidade de Subclasse"],
                          11: ["Fúria Inabalável"],
                          12: ["Melhoria de Atributo (ASI) / Talento"],
                          13: ["Crítico Brutal (2 dados)"],
                          14: ["Habilidade de Subclasse"],
                          15: ["Fúria Persistente"],
                          16: ["Melhoria de Atributo (ASI) / Talento"],
                          17: ["Crítico Brutal (3 dados)"],
                          18: ["Força Indomável"],
                          19: ["Melhoria de Atributo (ASI) / Talento"],
                          20: ["Campeão Primevo (+4 FOR e CON)"]
                        },
                        "Ladino": {
                          2: ["Ação Ardilosa"],
                          3: ["Arquétipo de Ladino (Subclasse)"],
                          4: ["Melhoria de Atributo (ASI) / Talento"],
                          5: ["Esquiva Sobrenatural"],
                          6: ["Expertise Adicional"],
                          7: ["Evasão"],
                          8: ["Melhoria de Atributo (ASI) / Talento"],
                          9: ["Habilidade de Subclasse"],
                          10: ["Melhoria de Atributo (ASI) / Talento"],
                          11: ["Talento Confiável"],
                          12: ["Melhoria de Atributo (ASI) / Talento"],
                          13: ["Habilidade de Subclasse"],
                          14: ["Sentido Cego"],
                          15: ["Mente Escorregadia"],
                          16: ["Melhoria de Atributo (ASI) / Talento"],
                          17: ["Habilidade de Subclasse"],
                          18: ["Elusivo"],
                          19: ["Melhoria de Atributo (ASI) / Talento"],
                          20: ["Golpe de Sorte"]
                        }
                      };

                      const classFeatures = CLASS_FEATURES_BY_LEVEL[charClass]?.[nextLevel] || [];
                      if (classFeatures.length > 0) {
                        summaryObj.habilidadesClasse.push(...classFeatures);
                      } else {
                        summaryObj.habilidadesClasse.push("Pendente de cadastro");
                      }

                      // Subclass Features
                      const subclassFeatureLevels: Record<string, number[]> = {
                        "Guerreiro": [3, 7, 10, 15, 18],
                        "Mago": [2, 6, 10, 14],
                        "Bárbaro": [3, 6, 10, 14],
                        "Ladino": [3, 9, 13, 17]
                      };
                      if (subclassFeatureLevels[charClass]?.includes(nextLevel)) {
                        const subName = character.subclass || character.stats?.subclass;
                        if (subName) {
                          summaryObj.habilidadesSubclasse.push(`Recurso da Subclasse ${subName} (Pendente de cadastro)`);
                        } else {
                          summaryObj.habilidadesSubclasse.push("Habilidade de Subclasse (Pendente de seleção)");
                        }
                      }

                      // Spell Slots
                      const newSlots = getSpellSlotsByLevel(nextLevel, charClass);
                      const oldSlots = getSpellSlotsByLevel(character.level || 1, charClass);
                      [1, 2, 3].forEach(lvl => {
                        if (newSlots[lvl] > (oldSlots[lvl] || 0)) {
                          summaryObj.novosEspacosMagia.push({
                            circulo: lvl,
                            anterior: oldSlots[lvl] || 0,
                            novo: newSlots[lvl]
                          });
                        }
                      });

                      // Choices Pendentes
                      const isAsiLevel = [4, 8, 12, 16, 19].includes(nextLevel) || 
                                         (charClass === "Guerreiro" && [6, 14].includes(nextLevel)) || 
                                         (charClass === "Ladino" && nextLevel === 10);
                      if (isAsiLevel) {
                        summaryObj.escolhasPendentes.push("Melhoria de Atributo ou Escolha de Talento na aba 'Talentos'");
                      }
                      if (nextLevel === 3 && ["Guerreiro", "Bárbaro", "Ladino", "Bardo", "Clérigo", "Paladino", "Patrulheiro"].includes(charClass)) {
                        summaryObj.escolhasPendentes.push("Escolher um Arquétipo / Subclasse");
                      } else if (nextLevel === 2 && charClass === "Mago") {
                        summaryObj.escolhasPendentes.push("Escolher uma Escola / Tradição Arcana");
                      }

                      // Observações
                      if (charClass === "Mago") {
                        summaryObj.observacoes.push(`Adicione +${nextLevel >= 9 ? 2 : 1} novas magias ao Grimório.`);
                      }
                      summaryObj.observacoes.push("Lembre-se de descansar para recuperar seus recursos!");

                      // Stats to save
                      const bonusStats: any = { maxHp: newMaxHp, currentHp: newHp };
                      if (charClass === "Guerreiro" && nextLevel >= 7) {
                        bonusStats.superiorityDice = Math.min(maxSuperiorityDice + 1, 6);
                        setSuperiorityDice(prev => Math.min(prev + 1, 6));
                        setMaxSuperiorityDice(prev => Math.min(prev + 1, 6));
                      }

                      // Update spell slots
                      const updatedSlotState = {
                        1: { current: newSlots[1], max: newSlots[1] },
                        2: { current: newSlots[2], max: newSlots[2] },
                        3: { current: newSlots[3], max: newSlots[3] },
                      };
                      setSpellSlots(updatedSlotState);
                      bonusStats.spellSlots1 = newSlots[1];
                      bonusStats.spellSlots2 = newSlots[2];
                      bonusStats.spellSlots3 = newSlots[3];

                      await saveCharacterChanges({ level: nextLevel, stats: bonusStats });
                      setHp(newHp);
                      setMaxHp(newMaxHp);
                      setLevelUpSummaryObj(summaryObj);
                    } catch (err) {
                      console.error("Erro no processo de Level Up:", err);
                    } finally {
                      setIsLevelingUp(false);
                    }
                  }}
                  className="flex-1 py-2 rounded-xl font-bold text-black text-sm disabled:opacity-40 transition-opacity"
                  style={{ background: levelUpSummaryObj ? "linear-gradient(135deg, #6b7280, #4b5563)" : "linear-gradient(135deg, #10b981, #059669)" }}
                >
                  {levelUpSummaryObj ? "Fechar" : isLevelingUp ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portrait Customization Modal */}
      {showPortraitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-primary/30 p-6 shadow-[0_0_50px_rgba(156,128,51,0.25)] overflow-hidden text-left"
            style={{ background: "linear-gradient(135deg, rgba(20,10,35,0.98), rgba(10,5,20,0.98))" }}>
            <button onClick={() => { setShowPortraitModal(false); setCustomImageUrl(""); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              <h3 className="font-heading text-xl font-bold text-primary">Personalizar Retrato</h3>
              <p className="text-xs text-gray-400">Escolha os detalhes visuais do seu herói para gerar sua arte por IA, faça o upload de uma foto ou insira um link direto.</p>

              {/* Opção Nova: GERAR IMAGEM POR IA */}
              <div className="space-y-3 border-t border-white/5 pt-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold text-[#c9a84c]">Descreva o Visual para Gerar por IA</span>
                <div className="bg-black/20 rounded-2xl p-3 border border-primary/20 space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateAiImage(false)}
                      disabled={generatingAiImage}
                      className="flex-1 h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-100 flex items-center justify-center gap-1"
                    >
                      📷 {generatingAiImage ? "Conjurando..." : "Gerar Retrato"}
                    </button>
                    <button
                      onClick={() => generateAiImage(true)}
                      disabled={generatingAiImage}
                      className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-100 flex items-center justify-center gap-1"
                    >
                      🖼️ {generatingAiImage ? "Conjurando..." : "Gerar Corpo Inteiro"}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { label: "Cabelo", value: aiHair, setter: setAiHair, placeholder: "Ex: Longo, negro e ondulado" },
                      { label: "Olhos", value: aiEyes, setter: setAiEyes, placeholder: "Ex: Verdes brilhantes, amendoados" },
                      { label: "Pele", value: aiSkin, setter: setAiSkin, placeholder: "Ex: Pálida com sardas" },
                      { label: "Corpo", value: aiBody, setter: setAiBody, placeholder: "Ex: Atlético, 1.80m" },
                      { label: "Cicatrizes", value: aiScars, setter: setAiScars, placeholder: "Ex: Cicatriz no olho esquerdo" },
                      { label: "Tatuagens", value: aiTattoos, setter: setAiTattoos, placeholder: "Ex: Runas élficas no braço direito" },
                      { label: "Roupa", value: aiClothing, setter: setAiClothing, placeholder: "Ex: Manto negro com capuz" },
                      { label: "Cores Principais", value: aiColors, setter: setAiColors, placeholder: "Ex: Preto, dourado e carmesim" },
                      { label: "Símbolos", value: aiSymbols, setter: setAiSymbols, placeholder: "Ex: Uma lua crescente prateada" },
                    ].map((field, index) => (
                      <div key={index} className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">{field.label}</span>
                        <Input
                          placeholder={field.placeholder}
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          className="bg-black/40 border-white/5 text-xs h-8 text-white focus:border-primary/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opção 1: Upload de Arquivo */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold text-[#c9a84c]">Enviar foto do computador ou celular</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                        const { data: auth } = await supabase.auth.getUser();
                        const filePath = `${auth?.user?.id || 'guest'}/${fileName}`;
                        
                        const { error: uploadError } = await supabase.storage
                          .from('character-images')
                          .upload(filePath, file);

                        if (uploadError) throw uploadError;

                        const { data } = supabase.storage
                          .from('character-images')
                          .getPublicUrl(filePath);

                        await saveCharacterChanges({ image_url: data.publicUrl });
                        setShowPortraitModal(false);
                      } catch (err: any) {
                        alert("Erro ao enviar imagem: " + err.message);
                      }
                    }
                  }}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>

              {/* Opção 2: URL Direta */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold text-[#c9a84c]">Ou insira uma URL de imagem</span>
                <div className="flex gap-2">
                  <Input 
                    placeholder="https://exemplo.com/foto.jpg" 
                    value={customImageUrl} 
                    onChange={e => setCustomImageUrl(e.target.value)} 
                    className="bg-black/20 border-white/10 text-xs h-9 text-white placeholder-gray-600 focus:border-primary/50" 
                  />
                  <Button
                    onClick={() => {
                      if (customImageUrl.trim()) {
                        saveCharacterChanges({ image_url: customImageUrl.trim() });
                        setCustomImageUrl("");
                        setShowPortraitModal(false);
                      }
                    }}
                    className="text-black text-xs font-bold px-3 h-9 shrink-0 rounded-lg hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #9c8033, #c9a84c)" }}
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              {/* Opção 3: Sugestões Premium CODEX */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold text-[#c9a84c]">Modelos do Códice D20</span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_PORTRAITS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        saveCharacterChanges({ image_url: preset.url });
                        setShowPortraitModal(false);
                      }}
                      className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all relative group"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-bold text-white text-center px-1">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>


              <div className="flex gap-2 border-t border-white/5 pt-3">
                <Button 
                  onClick={() => {
                    saveCharacterChanges({ image_url: null });
                    setShowPortraitModal(false);
                  }}
                  variant="ghost" 
                  className="w-full hover:bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold"
                >
                  Remover Foto (Voltar Padrão)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Barra inferior de dados ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t border-white/5 px-4 py-2"
        style={{ background: "rgba(7,7,10,0.9)" }}>
        <div className="container mx-auto flex items-center gap-3 overflow-x-auto">
          <span className="text-xs text-gray-600 shrink-0 font-heading">Rolar:</span>
          {[4, 6, 8, 10, 12, 20].map(d => (
            <button key={d} onClick={() => roll(d, 0, `d${d}`)}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-bold font-heading transition-all hover:scale-110 active:scale-95 border"
              style={{ borderColor: `${theme.accent}50`, color: theme.accent, background: `${theme.accent}10` }}>
              d{d}
            </button>
          ))}
          {lastRoll && (
            <div className="ml-auto text-right shrink-0">
              <span className={`font-heading font-black text-sm ${lastRoll.isCrit ? "text-yellow-400" : lastRoll.isFail ? "text-red-400" : "text-primary"}`}>
                {lastRoll.isCrit ? "CRÍTICO! " : lastRoll.isFail ? "FALHA CRÍTICA! " : ""}{lastRoll.label}: {lastRoll.total}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── CENTRAL PREMIUM DICE ROLL OVERLAY ── */}
      {activeRoll && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="relative bg-gradient-to-br from-[#120720] to-[#080310] border-2 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-[0_0_50px_rgba(156,128,51,0.25)] animate-in scale-in duration-300"
            style={{ borderColor: activeRoll.isCrit ? "#eab308" : activeRoll.isFail ? "#ef4444" : "#9c8033" }}>
            
            <button onClick={() => setActiveRoll(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1">
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase tracking-widest text-[#8a8a93] font-heading font-black block mb-1">
              {activeRoll.label}
            </span>

            {/* Glowing Die Container */}
            <div className="relative w-28 h-28 mx-auto my-4 flex items-center justify-center">
              {/* Spinning/pulsing aura */}
              <div className={`absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse ${
                activeRoll.isCrit ? "bg-yellow-500" : activeRoll.isFail ? "bg-red-500" : "bg-primary"
              }`} />
              
              {/* Die shape */}
              <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center font-heading font-black text-4xl border-2 shadow-2xl ${
                activeRoll.isCrit ? "bg-yellow-950/40 border-yellow-500 text-yellow-400 animate-bounce" :
                activeRoll.isFail ? "bg-red-950/40 border-red-500 text-red-500" :
                "bg-black/60 border-primary/40 text-primary"
              }`}>
                {activeRoll.result}
              </div>
            </div>

            {/* Total score block */}
            <div className="space-y-1">
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Resultado Total</span>
              <h3 className={`text-6xl font-heading font-black tracking-tight ${
                activeRoll.isCrit ? "text-yellow-400" :
                activeRoll.isFail ? "text-red-500" :
                "text-white"
              }`}>
                {activeRoll.total}
              </h3>
            </div>

            {/* Crit/Fail messages */}
            {activeRoll.isCrit && (
              <p className="text-yellow-400 font-bold text-sm tracking-wider uppercase mt-3 animate-pulse">💥 ACERTO CRÍTICO! 💥</p>
            )}
            {activeRoll.isFail && (
              <p className="text-red-500 font-bold text-sm tracking-wider uppercase mt-3">💀 FALHA CRÍTICA! 💀</p>
            )}

            {/* Sum breakdown formula details */}
            <div className="mt-6 pt-4 border-t border-white/5 space-y-1 text-xs">
              {activeRoll.sides > 0 ? (
                <>
                  <div className="flex justify-between text-zinc-500">
                    <span>Dado (d{activeRoll.sides})</span>
                    <span className="font-mono text-white font-bold">{activeRoll.result}</span>
                  </div>
                  {activeRoll.breakdown ? (
                    <>
                      {activeRoll.breakdown.attr !== undefined && (
                        <div className="flex justify-between text-zinc-500">
                          <span>Modificador de Atributo</span>
                          <span className="font-mono text-white font-bold">{formatModifier(activeRoll.breakdown.attr)}</span>
                        </div>
                      )}
                      {activeRoll.breakdown.prof !== undefined && activeRoll.breakdown.prof > 0 && (
                        <div className="flex justify-between text-zinc-500">
                          <span>Bônus de Proficiência</span>
                          <span className="font-mono text-white font-bold">+{activeRoll.breakdown.prof}</span>
                        </div>
                      )}
                      {activeRoll.breakdown.expertise !== undefined && activeRoll.breakdown.expertise > 0 && (
                        <div className="flex justify-between text-zinc-500">
                          <span>Expertise (Especialização)</span>
                          <span className="font-mono text-white font-bold">+{activeRoll.breakdown.expertise}</span>
                        </div>
                      )}
                      {activeRoll.breakdown.extra !== undefined && activeRoll.breakdown.extra !== 0 && (
                        <div className="flex justify-between text-zinc-500">
                          <span>Bônus Extra</span>
                          <span className="font-mono text-white font-bold">{formatModifier(activeRoll.breakdown.extra)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    activeRoll.modifier !== 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Ajustes / Modificador</span>
                        <span className="font-mono text-white font-bold">{formatModifier(activeRoll.modifier)}</span>
                      </div>
                    )
                  )}
                  <div className="flex justify-between text-[#c9a84c] border-t border-white/5 pt-2 font-bold uppercase tracking-wider">
                    <span>Soma das Regras</span>
                    <span>{activeRoll.total}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-1.5 bg-black/30 border border-white/5 rounded-xl text-[11px] text-gray-300 font-medium">
                  ⚔️ Dano fixo D&D 5e: <strong className="text-primary">{activeRoll.total}</strong>
                </div>
              )}
            </div>

            <Button onClick={() => setActiveRoll(null)}
              className="w-full mt-6 bg-[#9c8033]/20 border border-[#9c8033]/40 text-[#c9a84c] hover:bg-[#9c8033]/30 font-bold text-xs rounded-2xl py-5">
              Continuar Jornada
            </Button>
          </div>
        </div>
      )}

      {/* Chatbot LLM */}
      {character && (
        <DndChatbot characterContext={
          `Nome: ${character.name}\nRaça: ${character.race}\nClasse: ${character.char_class || character.class_name}\nNível: ${character.level}\n` +
          `Força: ${character.stats?.for || 10}, Destreza: ${character.stats?.des || 10}, Constituição: ${character.stats?.con || 10}, ` +
          `Inteligência: ${character.stats?.int || 10}, Sabedoria: ${character.stats?.sab || 10}, Carisma: ${character.stats?.car || 10}\n` +
          `O chatbot deve responder de forma sucinta e usando essa ficha como contexto se o jogador perguntar algo sobre si mesmo.`
        } />
      )}
    </div>
  );
}
