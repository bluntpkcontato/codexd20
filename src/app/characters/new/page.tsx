"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, ChevronLeft, Check, BookOpen, Star, Sword, Scroll, Shield, Wand2, User, Camera, X, Quote, Wrench, Globe, Backpack, Ship, Swords } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { getRacePresetImage, PRESET_PORTRAITS, getClassPresetImage } from "@/utils/racePresets";
import { validatePointBuy, hasSpellbook } from "@/utils/dndMath";
import { normalizeCharacterPayload } from "@/lib/rules/characterBuilder";

// Import processed D&D datasets
import classesData from "@/data/classes_pt.json";
import spellsData from "@/data/spells_pt.json";
import dndExpansion from "@/data/dnd_expansion.json";
import { BACKGROUNDS, Background } from "@/data/backgrounds";
import { DND_EQUIPMENT_CATALOG, CATEGORY_META, EquipmentCard, groupByCategory, getBackgroundEquipIcon } from "@/components/EquipmentIcons";
import NextImage from "next/image";

const getRaceClassImage = (raceName: string, className?: string): string => {
  // Future-ready combination system
  // If we ever generate race+class specific art, e.g. /race_class_elfo_mago.png, it can be mapped here.
  return getRacePresetImage(raceName);
};

const RACE_DETAILS_ENRICHMENT: Record<string, { quote: string; lore: string; traits: { name: string; desc: string }[] }> = {
  "Humano": {
    quote: "“A ambição dos mortais é a força que molda os reinos, ergue impérios e desafia os próprios deuses.”",
    lore: "Humanos são a mais jovem das raças clássicas, famosos por sua determinação implacável, adaptabilidade e ambição sem limites. Eles não vivem tanto quanto os elfos ou anões, o que os impulsiona a alcançar feitos monumentais no curto espaço de tempo que possuem.",
    traits: [
      { name: "Adaptabilidade Primal", desc: "Proficiência em uma perícia à sua escolha e um talento adicional no nível 1." },
      { name: "Ambição Humana", desc: "Aptidão inata para aprender novos idiomas e se aclimatar a qualquer cultura." }
    ]
  },
  "Elfo": {
    quote: "“O vento canta entre as folhas, e nós somos a harmonia que mantém o equilíbrio do mundo feérico.”",
    lore: "Criaturas mágicas de graça sobrenatural, os Elfos vivem no mundo mas não pertencem inteiramente a ele. Originários do plano feérico (Feywild), possuem uma conexão ancestral com a magia, a arte e a natureza selvagem.",
    traits: [
      { name: "Ancestralidade Feérica", desc: "Vantagem em salvaguardas contra ser encantado e imunidade a magia de sono." },
      { name: "Sentidos Aguçados", desc: "Proficiência natural na perícia Percepção." },
      { name: "Transe", desc: "Não dormem. Em vez disso, meditam profundamente por 4 horas para obter o descanso de 8 horas." }
    ]
  },
  "Anão": {
    quote: "“O aço se dobra sob o martelo, mas a honra de um clã permanece inquebrável como as montanhas.”",
    lore: "Robustos e implacáveis, os Anões são famosos por sua maestria na forja, arquitetura subterrânea e um senso rígido de clã e tradição. Um insulto a um anão é um insulto a toda a sua linhagem.",
    traits: [
      { name: "Resiliência Anã", desc: "Vantagem em testes de resistência contra veneno e resistência a dano de veneno." },
      { name: "Treinamento de Combate", desc: "Proficiência com machados de batalha, machadinhas, martelos leves e martelos de guerra." },
      { name: "Visão no Escuro", desc: "Enxerga na penumbra e na escuridão total a até 18 metros." }
    ]
  },
  "Halfling": {
    quote: "“Uma lareira quente, uma boa refeição e um sorriso sincero valem mais do que todas as joias de Faerûn.”",
    lore: "Pequenos no tamanho mas gigantes na coragem, os Halflings são um povo amigável, pacífico e incrivelmente sortudo. Eles preferem a paz dos campos agrícolas à glória da guerra, mas defendem seus amigos ferozmente.",
    traits: [
      { name: "Sorte Inata", desc: "Ao tirar 1 natural em um d20, você pode rolar o dado novamente." },
      { name: "Bravura", desc: "Vantagem em salvaguardas contra ficar amedrontado." },
      { name: "Agilidade Halfling", desc: "Capacidade de se mover pelo espaço de qualquer criatura de tamanho maior." }
    ]
  },
  "Gnomo": {
    quote: "“Toda engrenagem conta uma história. A curiosidade é a faísca que acende a luz do progresso.”",
    lore: "Gnomos vibram com pura energia criativa. Sua curiosidade insaciável e paixão pela engenhosidade e truques arcanos os tornam inventores brilhantes e companheiros excêntricos.",
    traits: [
      { name: "Esperteza Gnomica", desc: "Vantagem em testes de Inteligência, Sabedoria e Carisma contra magia." },
      { name: "Visão no Escuro", desc: "Enxerga na penumbra e na escuridão a até 18 metros." }
    ]
  },
  "Tiefling": {
    quote: "“As chamas do abismo correm em minhas veias, mas é a minha própria vontade que escolhe o meu caminho.”",
    lore: "Marcados por um pacto ancestral que infundiu a essência de Asmodeus em sua linhagem, os Tieflings carregam chifres, caudas e pele de tons exóticos. Frequentemente incompreendidos, são sobreviventes orgulhosos.",
    traits: [
      { name: "Resistência Infernal", desc: "Resistência natural a dano de fogo." },
      { name: "Legado Sombrio", desc: "Conhecimento inato de magias de fogo e truques de ilusão e taumaturgia." }
    ]
  },
  "Draconato": {
    quote: "“Meu sopro carrega a fúria da minha dinastia. Minhas escamas são o meu escudo e o meu orgulho.”",
    lore: "Descendentes diretos dos dragões antigos, os Draconatos valorizam a honra, a autossuficiência e a força de seu clã acima de tudo. Cada draconato possui um elemento de sopro herdado de sua cor de escama.",
    traits: [
      { name: "Sopro Elemental", desc: "Canaliza energia destrutiva (fogo, eletricidade, etc) em uma área cônica ou linha." },
      { name: "Resistência de Dragão", desc: "Resistência a dano do mesmo tipo elemental do seu sopro." }
    ]
  },
  "Aasimar": {
    quote: "“Uma faísca do plano celestial brilha em meu olhar. Que a luz guie meus aliados e queime meus inimigos.”",
    lore: "Aasimar são mortais tocados pela centelha divina do Monte Celestia. Eles possuem um guia espiritual angelical e são destinados a serem campeões da justiça e defensores dos inocentes.",
    traits: [
      { name: "Mãos Curadoras", desc: "Como ação, toque uma criatura para restaurar pontos de vida." },
      { name: "Resistência Celestial", desc: "Resistência a dano necrótico e radiante." }
    ]
  },
  "Meio-Orc": {
    quote: "“A dor é apenas um lembrete de que ainda posso lutar. Minha fúria não tem limites.”",
    lore: "Unindo a paixão e adaptabilidade humana com a força descomunal dos orcs, os Meio-Orcs são guerreiros formidáveis. Eles sentem emoções intensas e possuem uma resiliência física lendária.",
    traits: [
      { name: "Resistência Implacável", desc: "Ao cair para 0 HP, você pode escolher ficar com 1 HP em vez disso (uma vez por descanso longo)." },
      { name: "Ataques Selvagens", desc: "Adiciona um dado de dano extra em acertos críticos com armas corpo a corpo." }
    ]
  },
  "Warforged": {
    quote: "“Eu fui construído para a guerra, mas agora escolho pelo que vale a pena viver.”",
    lore: "Feitos de madeira e aço imbuídos de vida mágica, os Warforged foram criados como soldados artificiais. Livres do conflito, eles agora buscam um propósito próprio no mundo dos mortais.",
    traits: [
      { name: "Proteção Integrada", desc: "+1 de bônus permanente na Classe de Armadura (CA)." },
      { name: "Resiliência do Construto", desc: "Imunidade a doenças, vantagem contra veneno e não precisa dormir, comer ou respirar." }
    ]
  },
  "Golias": {
    quote: "“A montanha não se curva à tempestade, ela a suporta. Assim é o nosso povo.”",
    lore: "Gigantes das montanhas frias, os Golias possuem força brutal e espírito de competição. Suas tribos valorizam a autossuficiência e a resistência física acima de tudo.",
    traits: [
      { name: "Resistência da Pedra", desc: "Use sua reação para reduzir o dano sofrido em 1d12 + modificador de Constituição." },
      { name: "Poderoso", desc: "Conta como uma categoria de tamanho maior para determinar capacidade de carga." }
    ]
  },
  "Orc": {
    quote: "“A força bruta é a única linguagem que todos os reinos entendem perfeitamente.”",
    lore: "Poderosos e orgulhosos guerreiros de força física inabalável, frequentemente temidos mas dotados de profunda honra tribal e coragem.",
    traits: [
      { name: "Investida Agressiva", desc: "Pode se mover até seu deslocamento em direção a um inimigo como uma ação bônus." },
      { name: "Poder Físico", desc: "Proficiência na perícia Intimidação e capacidade de carga ampliada." }
    ]
  },
  "Meio-Elfo": {
    quote: "“Eu ando entre as árvores antigas e as ruas pavimentadas, mas não pertenço totalmente a nenhuma.”",
    lore: "Unindo a longevidade e a graça dos elfos com a versatilidade e a ambição humana, são excelentes em diplomacia e artes arcanas.",
    traits: [
      { name: "Versatilidade", desc: "Proficiência em duas perícias adicionais à sua escolha." },
      { name: "Ancestralidade Feérica", desc: "Vantagem contra ser encantado e imunidade a magia de sono." }
    ]
  },
  "Tabaxi": {
    quote: "“Curiosidade não matou este gato, ela apenas lhe deu asas e histórias para contar.”",
    lore: "Ágeis felinos antropomórficos movidos pela curiosidade inesgotável e velocidade, caçadores de lendas perdidas e relíquias misteriosas.",
    traits: [
      { name: "Agilidade Felina", desc: "Pode dobrar seu deslocamento por um turno (recarrega ao ficar parado)." },
      { name: "Garras", desc: "Seus ataques desarmados causam dano cortante." }
    ]
  },
  "Aarakocra": {
    quote: "“Os céus são o meu reino. A terra é apenas o lugar onde descanso as minhas asas.”",
    lore: "Povo alado dos picos elevados, nativos do Plano Elemental do Ar, são velozes e sentem fobia de lugares apertados ou masmorras profundas.",
    traits: [
      { name: "Voo", desc: "Você possui velocidade de voo de 15 metros, desde que não use armadura média ou pesada." },
      { name: "Garras Afiadas", desc: "Ataques desarmados causam 1d4 de dano cortante." }
    ]
  },
  "Changeling": {
    quote: "“Nenhum rosto é permanente, e cada máscara guarda o seu próprio segredo.”",
    lore: "Mestres do disfarce, os Changeling podem alterar sua forma física à vontade, adotando as vozes e as faces de qualquer pessoa que encontrarem.",
    traits: [
      { name: "Aparência Fluida", desc: "Como ação, você pode mudar sua forma física e tamanho para combinar com outro humanoide." },
      { name: "Instintos de Metamorfo", desc: "Proficiência em Enganação e Intuição." }
    ]
  },
  "Dhampir": {
    quote: "“A maldição corre em meu sangue, mas a escolha do que devorar é inteiramente minha.”",
    lore: "Herdeiros da noite com apetite por sangue ou energia vital, os Dhampir caminham na fina linha entre o mundo dos vivos e a eternidade vampírica.",
    traits: [
      { name: "Andarilho das Trevas", desc: "Deslocamento de 10m e pode escalar paredes como uma aranha (sem usar as mãos)." },
      { name: "Mordida Vampírica", desc: "Ataque corpo-a-corpo que restaura HP equivalente ao dano causado." }
    ]
  },
  "Reborn": {
    quote: "“Eu acordei num túmulo, sem memória, mas com uma certeza: a morte me rejeitou.”",
    lore: "Almas que retornaram do limiar da morte através de magias sombrias ou propósitos inacabados, habitando corpos mortos-vivos costurados.",
    traits: [
      { name: "Natureza Imortal", desc: "Vantagem em testes de morte, e não precisa comer, beber ou respirar." },
      { name: "Conhecimento de Vidas Passadas", desc: "Adiciona 1d6 a testes de perícias baseados em vagas memórias do passado." }
    ]
  }
};

// ── DATA STRUCTURES ─────────────────────────────────────────────────────────

const SUBRACES = dndExpansion.SUBRACES as any;

const SUBCLASSES = dndExpansion.SUBCLASSES as any;

const ALL_SKILLS = [
  { name: "Acrobacia", attr: "DES" },
  { name: "Adestrar Animais", attr: "SAB" },
  { name: "Arcanismo", attr: "INT" },
  { name: "Atletismo", attr: "FOR" },
  { name: "Enganação", attr: "CAR" },
  { name: "Furtividade", attr: "DES" },
  { name: "História", attr: "INT" },
  { name: "Intimidação", attr: "CAR" },
  { name: "Intuição", attr: "SAB" },
  { name: "Investigação", attr: "INT" },
  { name: "Medicina", attr: "SAB" },
  { name: "Natureza", attr: "INT" },
  { name: "Percepção", attr: "SAB" },
  { name: "Persuasão", attr: "CAR" },
  { name: "Prestidigitação", attr: "DES" },
  { name: "Religião", attr: "INT" },
  { name: "Sobrevivência", attr: "SAB" }
];

const RACES = dndExpansion.RACES;

const ALIGNMENTS = [
  "Ordeiro e Bom", "Neutro e Bom", "Caótico e Bom",
  "Ordeiro e Neutro", "Neutro Puro", "Caótico e Neutro",
  "Ordeiro e Mau", "Neutro e Mau", "Caótico e Mau"
];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

const STEPS = [
  { id: "concept", label: "Origem", icon: <Sparkles className="w-4 h-4" /> },
  { id: "race", label: "Raça", icon: <User className="w-4 h-4" /> },
  { id: "class", label: "Classe", icon: <Sword className="w-4 h-4" /> },
  { id: "background", label: "Antecedente", icon: <Scroll className="w-4 h-4" /> },
  { id: "stats", label: "Atributos", icon: <Shield className="w-4 h-4" /> },
  { id: "skills", label: "Perícias", icon: <Star className="w-4 h-4" /> },
  { id: "spells", label: "Magias", icon: <Wand2 className="w-4 h-4" /> },
  { id: "identity", label: "Identidade", icon: <BookOpen className="w-4 h-4" /> },
  { id: "review", label: "Consagração", icon: <Check className="w-4 h-4" /> }
];

export default function CharacterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  
  // Dynamic Data States
  const [classes, setClasses] = useState<any[]>(classesData);
  const [selectedRace, setSelectedRace] = useState<any>(RACES[0]);
  const [selectedSubrace, setSelectedSubrace] = useState<any>(null);
  
  const [selectedClass, setSelectedClass] = useState<any>(classesData[0] || null);
  const [selectedSubclass, setSelectedSubclass] = useState<any>(null);
  const [selectedBackground, setSelectedBackground] = useState<any>(BACKGROUNDS[0]);
  
  // Point Buy stats
  const [baseStats, setBaseStats] = useState<Record<string, number>>({
    FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8
  });
  const [genMethod, setGenMethod] = useState<"point_buy" | "standard_array" | "dice_rolling" | "ai_recommend">("point_buy");
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  
  // Proficiencies
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Spells
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  
  // Identity
  const [name, setName] = useState("");
  const [alignment, setAlignment] = useState(ALIGNMENTS[4]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiLore, setAiLore] = useState("");
  
  // Portrait customizer states
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");
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

  // Scroll reset refs for race and class panels
  const raceDetailsScrollRef = useRef<HTMLDivElement>(null);
  const classDetailsScrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top on selection change
  useEffect(() => {
    if (raceDetailsScrollRef.current) {
      raceDetailsScrollRef.current.scrollTop = 0;
    }
  }, [selectedRace]);

  useEffect(() => {
    if (classDetailsScrollRef.current) {
      classDetailsScrollRef.current.scrollTop = 0;
    }
  }, [selectedClass]);

  // Sync default race portrait
  useEffect(() => {
    setImageUrl(getRacePresetImage(selectedRace?.name));
  }, [selectedRace]);

  const generateAiImage = async (isFullBody: boolean) => {
    setGeneratingAiImage(true);
    try {
      const promptParts = [
        `race: ${selectedRace?.name || 'Humano'}`,
        `class: ${selectedClass?.name || 'Guerreiro'}`
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
      
      setImageUrl(url);
      setShowPortraitModal(false);
    } catch (e) {
      console.error(e);
      alert("Erro ao conjurar a imagem.");
    } finally {
      setGeneratingAiImage(false);
    }
  };

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Subraces effect
  useEffect(() => {
    const subList = SUBRACES[selectedRace.name];
    if (subList && subList.length > 0) {
      setSelectedSubrace(subList[0]);
    } else {
      setSelectedSubrace(null);
    }
  }, [selectedRace]);

  // Subclasses effect
  useEffect(() => {
    if (!selectedClass) return;
    const subList = SUBCLASSES[selectedClass.name];
    if (subList && subList.length > 0) {
      setSelectedSubclass(subList[0]);
    } else {
      setSelectedSubclass(null);
    }
    setSelectedSkills([]);
  }, [selectedClass]);

  // Point Buy calc
  const calculateSpentPoints = () => {
    return Object.values(baseStats).reduce((acc, score) => acc + (POINT_BUY_COSTS[score] || 0), 0);
  };
  const pointsRemaining = 27 - calculateSpentPoints();

  const handleStatChange = (stat: string, val: number) => {
    const currentScore = baseStats[stat];
    const newScore = currentScore + val;
    if (newScore < 8 || newScore > 15) return;
    
    const currentCost = POINT_BUY_COSTS[currentScore] || 0;
    const newCost = POINT_BUY_COSTS[newScore] || 0;
    const costDiff = newCost - currentCost;
    
    if (pointsRemaining - costDiff >= 0) {
      setBaseStats(prev => ({ ...prev, [stat]: newScore }));
    }
  };

  const getFinalStat = (stat: string) => {
    let final = baseStats[stat] || 8;
    if (selectedSubrace && selectedSubrace.bonus[stat]) {
      final += selectedSubrace.bonus[stat];
    }
    return final;
  };

  const getMod = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleMethodChange = (method: typeof genMethod) => {
    setGenMethod(method);
    if (method === "point_buy") {
      setBaseStats({ FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8 });
    } else if (method === "standard_array") {
      setBaseStats({ FOR: 15, DES: 14, CON: 13, INT: 12, SAB: 10, CAR: 8 });
    } else if (method === "dice_rolling") {
      setRolledScores([]);
      setBaseStats({ FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 });
    } else if (method === "ai_recommend") {
      autoAllocateStats();
    }
  };

  const handleStandardArrayChange = (stat: string, val: number) => {
    const prevVal = baseStats[stat];
    const otherStat = Object.keys(baseStats).find(s => s !== stat && baseStats[s] === val);
    setBaseStats(prev => {
      const next = { ...prev, [stat]: val };
      if (otherStat) {
        next[otherStat] = prevVal;
      }
      return next;
    });
  };

  const rollDiceScores = () => {
    const rolls = [];
    for (let i = 0; i < 6; i++) {
      const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      dice.sort((a, b) => b - a);
      const sum = dice[0] + dice[1] + dice[2];
      rolls.push(sum);
    }
    rolls.sort((a, b) => b - a);
    setRolledScores(rolls);
    setBaseStats({
      FOR: rolls[0],
      DES: rolls[1],
      CON: rolls[2],
      INT: rolls[3],
      SAB: rolls[4],
      CAR: rolls[5]
    });
  };

  const handleRolledScoreChange = (stat: string, val: number) => {
    const prevVal = baseStats[stat];
    const otherStat = Object.keys(baseStats).find(s => s !== stat && baseStats[s] === val);
    setBaseStats(prev => {
      const next = { ...prev, [stat]: val };
      if (otherStat) {
        next[otherStat] = prevVal;
      }
      return next;
    });
  };

  const getSpellcastingAbility = (className?: string) => {
    if (!className) return null;
    if (["Mago", "Artífice"].includes(className)) return "INT";
    if (["Clérigo", "Druida", "Patrulheiro"].includes(className)) return "SAB";
    if (["Bardo", "Feiticeiro", "Bruxo", "Paladino"].includes(className)) return "CAR";
    return null;
  };

  // AI generator
  const generateLore = async () => {
    if (!name) {
      setError("Insira o nome do herói.");
      return;
    }
    setAiGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Crie um prelúdio breve e trágico de D&D para o personagem ${name}, um ${selectedRace.name} (${selectedSubrace?.name || "Sem subraça"}) ${selectedClass?.name} (${selectedSubclass?.name || "Sem arquétipo"}), antecedente ${selectedBackground.name} e alinhamento ${alignment}. 1 parágrafo poético e imersivo.`
          }]
        })
      });
      const data = await res.json();
      setAiLore(data.reply || "Os céus choraram no dia do seu nascimento.");
    } catch {
      setAiLore("Os pergaminhos arcanos permanecem em branco.");
    } finally {
      setAiGenerating(false);
    }
  };

  const generateFromConcept = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/assistant?json=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Com base neste conceito de RPG: "${aiPrompt}". Retorne um JSON Puro contendo:
            "race" (Humano, Elfo, Anão, Halfling, Tiefling, Gnomo, Draconato, Meio-Elfo, Meio-Orc),
            "char_class" (nome exato em português de uma das 12 classes clássicas de D&D),
            "name" (um nome de dark fantasy).`
          }]
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.reply);
      
      const matchedRace = RACES.find(r => r.name.toLowerCase() === parsed.race?.toLowerCase()) || RACES[0];
      const matchedClass = classes.find(c => c.name.toLowerCase() === parsed.char_class?.toLowerCase()) || classes[0];
      
      setSelectedRace(matchedRace);
      if (matchedClass) setSelectedClass(matchedClass);
      if (parsed.name) setName(parsed.name);
      
      setStep(1);
    } catch (e) {
      console.error(e);
      setError("A IA falhou em materializar o conceito. Prossiga manualmente.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Diga ao Tomo qual é o seu nome.");
      return;
    }
    if (genMethod === "point_buy" && !validatePointBuy(baseStats)) {
      setError("No modo Compra de Pontos, todos os atributos base devem estar estritamente entre 8 e 15.");
      setStep(4);
      return;
    }
    setSaving(true);
    setError("");

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id || "mock-user-uuid-12345";

      const finalStatsObj = {
        FOR: getFinalStat("FOR"),
        DES: getFinalStat("DES"),
        CON: getFinalStat("CON"),
        INT: getFinalStat("INT"),
        SAB: getFinalStat("SAB"),
        CAR: getFinalStat("CAR")
      };

      const characterData = {
        user_id: userId,
        name: name,
        race: `${selectedRace.name} (${selectedSubrace?.name || "Padrão"})`,
        char_class: selectedClass?.name || "Guerreiro",
        subclass: selectedSubclass?.name || "",
        level: 1,
        stats: {
          ...finalStatsObj,
          subclass: selectedSubclass?.name || "",
          background_feature: { name: selectedBackground.featureName, desc: selectedBackground.featureDesc },
          languages: selectedBackground.languages || [],
          tools: selectedBackground.tools || [],
          vehicles: selectedBackground.vehicles || [],
          proficiencies: [...selectedBackground.skills, ...selectedSkills]
        },
        inventory: [
          ...selectedBackground.equipment.map((item: string) => ({ name: item, type: "Equipamento/Antecedente" })),
          { name: "Armadura de Couro", type: "Armadura", bonus: 11 },
          { name: "Espada (Dano 1d6)", type: "Arma" },
          { name: "Bolsa de Aventureiro", type: "Equipamento" }
        ],
        spells: [...selectedCantrips, ...selectedSpells],
        image_url: imageUrl,
        lore: aiLore || `Um ${selectedRace.name} ${selectedClass?.name} trilhando a sina de ${selectedBackground.name}.`
      };

      const normalizedData = normalizeCharacterPayload(characterData);

      const { error: insertErr } = await supabase
        .from('characters')
        .insert([normalizedData]);

      if (insertErr) throw insertErr;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "A evocação falhou. Os deuses do caos impediram a criação.");
    } finally {
      setSaving(false);
    }
  };

  // Filter spells dynamically
  const isSpellcaster = selectedClass && hasSpellbook(selectedClass.name, selectedSubclass?.name, 1);
  const availableCantrips = isSpellcaster 
    ? spellsData.filter(s => s.level === 0 && s.classes.includes(selectedClass.name))
    : [];
  const availableSpells = isSpellcaster
    ? spellsData.filter(s => s.level === 1 && s.classes.includes(selectedClass.name))
    : [];
  const autoAllocateStats = () => {
    if (!selectedClass) return;
    const name = selectedClass.name;
    let target = { FOR: 8, DES: 8, CON: 8, INT: 8, SAB: 8, CAR: 8 };
    if (name === "Guerreiro" || name === "Paladino" || name === "Bárbaro") {
      target = { FOR: 15, CON: 14, DES: 14, INT: 10, SAB: 10, CAR: 8 };
    } else if (name === "Mago" || name === "Feiticeiro" || name === "Bruxo" || name === "Bardo") {
      const isCharisma = ["Feiticeiro", "Bruxo", "Bardo"].includes(name);
      target = {
        FOR: 8,
        DES: 14,
        CON: 14,
        INT: isCharisma ? 10 : 15,
        SAB: 10,
        CAR: isCharisma ? 15 : 10
      };
    } else if (name === "Clérigo" || name === "Druida" || name === "Patrulheiro") {
      target = { FOR: 10, DES: 14, CON: 14, INT: 10, SAB: 15, CAR: 8 };
    } else if (name === "Ladino" || name === "Monge") {
      target = { FOR: 8, DES: 15, CON: 14, INT: 10, SAB: 14, CAR: 10 };
    } else {
      target = { FOR: 14, DES: 14, CON: 14, INT: 10, SAB: 10, CAR: 8 };
    }
    setBaseStats(target);
  };

  const autoSelectSkills = () => {
    if (!selectedClass) return;
    const pool = selectedClass.skillsPool || [];
    const count = selectedClass.skillsCount || 2;
    const bgSkills = selectedBackground.skills || [];
    const available = pool.filter((s: string) => !bgSkills.includes(s));
    const selected = available.slice(0, count);
    setSelectedSkills(selected);
  };

  const autoSelectSpells = () => {
    if (!isSpellcaster) return;
    const cNames = availableCantrips.slice(0, 2).map(c => c.name_pt);
    const sNames = availableSpells.slice(0, 2).map(s => s.name_pt);
    setSelectedCantrips(cNames);
    setSelectedSpells(sNames);
  };

  const wizardSteps = STEPS.filter(s => s.id !== "spells" || isSpellcaster);
  const getStepIndex = (id: string) => {
    return wizardSteps.findIndex(s => s.id === id);
  };

  const progress = (step / (wizardSteps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-arcane-gradient relative overflow-hidden flex flex-col font-sans">
      <div className="absolute inset-0 bg-rune-pattern opacity-[0.02] pointer-events-none" />

      {/* Glow ambient background */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)", filter: "blur(70px)" }} />
      <div className="absolute bottom-0 right-1/3 w-[450px] h-[450px] rounded-full pointer-events-none animate-pulse-glow"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06), transparent 70%)", filter: "blur(60px)", animationDelay: "2s" }} />

      {/* Header Stepper */}
      <header className="relative z-10 sticky top-0 backdrop-blur-xl border-b border-primary/20 bg-[#07070b]/90">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-xs text-[#8a8a93] hover:text-primary transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retornar ao Tomo
            </button>
            <span className="font-heading font-black text-shimmer text-lg tracking-widest uppercase">CONJURAÇÃO DE HERÓI</span>
            <span className="text-xs text-[#c9a84c] font-heading font-bold">{step + 1} de {wizardSteps.length}</span>
          </div>

          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#9c8033] to-[#c9a84c]"
              style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between mt-3 overflow-x-auto gap-2">
            {wizardSteps.map((s, i) => (
              <button key={s.id} onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-colors ${i <= step ? "text-[#c9a84c] cursor-pointer" : "text-[#8a8a93]/30 cursor-default"}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${i < step ? "bg-primary border-primary text-black" : i === step ? "border-primary text-primary" : "border-zinc-800 text-[#8a8a93]/30"}`}>
                  {i < step ? <Check className="w-3.5 h-3.5 font-black" /> : s.icon}
                </span>
                <span className="hidden lg:block">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Wizard Area */}
      <div className="flex-1 flex flex-col justify-center py-10 relative z-10 px-6 max-w-5xl mx-auto w-full">

        {/* ── STEP 0: ORIGEM/CONCEITO ── */}
        {step === 0 && (
          <div className="space-y-8 animate-scale-in text-center max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl animate-float bg-gradient-to-br from-[#9c8033] to-[#c9a84c] shadow-[0_0_35px_rgba(201,168,76,0.35)]">
                🌌
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight uppercase tracking-wider">
                Invoque seu Protagonista
              </h2>
              <p className="text-[#8a8a93] text-sm leading-relaxed font-serif">
                Utilize o Mestre Assistente para materializar uma lenda com IA instantaneamente, ou molde-o passo a passo através das escrituras ancestrais do D&D.
              </p>
            </div>

            {/* Concept Prompt Generator */}
            <div className="border border-purple-900/30 bg-purple-950/5 p-6 rounded-2xl text-left space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-800 to-purple-900">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-heading text-xs font-bold text-white uppercase tracking-wider">Mestre Conjurador (IA)</p>
                  <p className="text-[10px] text-[#8a8a93]">Descreva a essência do seu herói e eu preencho o básico</p>
                </div>
              </div>
              <Textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ex: Um bruxo misterioso da linhagem de Asmodeus com sede de pactos antigos..."
                className="bg-black/30 border-purple-900/30 text-xs text-white placeholder-zinc-700 h-24 focus:border-purple-400/40"
              />
              <button 
                onClick={generateFromConcept} 
                disabled={!aiPrompt.trim() || aiGenerating}
                className="btn-arcane w-full flex items-center justify-center gap-2 text-xs"
              >
                {aiGenerating ? "Consagrando Conceito..." : "Materializar Herói"}
              </button>
            </div>

            <div className="divider-rune">Ou siga a ordem tradicional</div>

            <button onClick={() => setStep(1)} className="btn-gold w-full text-xs flex items-center justify-center gap-2">
              Escolher Raça & Subraça Manualmente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 1: RACES & SUBRACES ── */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="border-b border-[#c9a84c]/20 pb-3">
              <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Linhagem Ancestral (Raça)</h2>
              <p className="text-[#8a8a93] text-xs mt-1">Seu sangue dita seus atributos físicos primordiais e talentos inatos de subraça.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Main Races List */}
              <div className="md:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
                <p className="text-[10px] font-heading font-bold text-primary/70 uppercase tracking-widest">Raças Clássicas</p>
                {RACES.map(race => (
                  <div
                    key={race.id}
                    onClick={() => setSelectedRace(race)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedRace.id === race.id
                        ? "bg-[#1a1025]/50 border-primary shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                        : "bg-[#0f0f18]/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm text-[#e8dfc0] uppercase tracking-wide">{race.name}</span>
                  </div>
                ))}
              </div>

              {/* Right Selection details & Subraces (Premium BG3/Diablo-like layout) */}
              <div className="md:col-span-2 bg-[#0f0f18]/85 border border-[#c9a84c]/20 rounded-3xl overflow-hidden flex flex-col h-full max-h-[50vh] md:max-h-[75vh] shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
                <div ref={raceDetailsScrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
                  
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Header with Portrait and Title side-by-side */}
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 border-2 border-[#c9a84c]/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                        <img 
                          src={getRaceClassImage(selectedRace.name, selectedClass?.name)} 
                          alt={selectedRace.name} 
                          className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" 
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-heading font-bold">Linhagem Ancestral</span>
                          <h3 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-wider">{selectedRace.name}</h3>
                        </div>

                        {/* Lore description moved up next to the image */}
                        <p className="text-xs text-[#8a8a93] font-serif leading-relaxed">
                          {RACE_DETAILS_ENRICHMENT[selectedRace.name]?.lore || selectedRace.desc}
                        </p>
                      </div>
                    </div>

                    {/* Quote (if any) */}
                    {RACE_DETAILS_ENRICHMENT[selectedRace.name]?.quote && (
                      <div className="pl-4 border-l-2 border-[#c9a84c] py-1 bg-white/[0.01] rounded-r-md mt-4">
                        <p className="text-xs text-[#e8dfc0] italic font-serif leading-relaxed">
                          {RACE_DETAILS_ENRICHMENT[selectedRace.name].quote}
                        </p>
                      </div>
                    )}

                    {/* Racial Traits */}
                    {RACE_DETAILS_ENRICHMENT[selectedRace.name]?.traits && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-heading font-bold text-[#c9a84c] uppercase tracking-widest">Habilidades Raciais Inatas</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {RACE_DETAILS_ENRICHMENT[selectedRace.name].traits.map((trait, idx) => (
                            <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1 hover:border-primary/20 transition-colors">
                              <span className="font-heading font-bold text-xs text-[#e8dfc0] uppercase">{trait.name}</span>
                              <p className="text-[10px] text-[#8a8a93] leading-relaxed">{trait.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subraces options */}
                    {SUBRACES[selectedRace.name] ? (
                      <div className="space-y-4 pt-2">
                        <p className="text-[10px] font-heading font-bold text-[#c9a84c] uppercase tracking-widest">Subraças & Bônus de Atributo</p>
                        <div className="grid grid-cols-1 gap-3">
                          {SUBRACES[selectedRace.name].map((sub: any) => {
                            const isSubSelected = selectedSubrace?.id === sub.id;
                            return (
                              <div
                                key={sub.id}
                                onClick={() => setSelectedSubrace(sub)}
                                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                  isSubSelected
                                    ? "bg-[#1a1025]/50 border-primary shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                                    : "bg-[#07070b]/60 border-zinc-900 hover:border-zinc-800"
                                }`}
                              >
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <span className="font-heading text-xs font-bold text-white uppercase">{sub.name}</span>
                                  <div className="flex gap-1.5 flex-wrap">
                                    {Object.entries(sub.bonus || {}).map(([stat, val]: any) => (
                                      <span key={stat} className="bg-primary/10 border border-primary/20 text-primary font-bold text-[9px] px-1.5 py-0.5 rounded">
                                        {stat} +{val}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[10px] text-[#8a8a93] italic mt-1.5 font-serif leading-relaxed">"{sub.desc}"</p>
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {sub.traits.map((t: any, idx: number) => (
                                    <span key={idx} className="bg-zinc-800/80 text-[#e8dfc0] text-[9px] px-2 py-0.5 rounded border border-white/5 font-medium">
                                      ✦ {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#07070b] p-4 rounded-xl text-center border border-zinc-900">
                        <p className="text-xs text-[#8a8a93] font-serif">Esta linhagem não possui divisões em subraças.</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="p-4 bg-black/60 border-t border-white/5 flex justify-end shrink-0">
                  <Button onClick={() => setStep(2)} className="btn-gold text-xs px-6 py-5 rounded-xl font-bold flex items-center gap-1.5">
                    Prosseguir para Classe <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: CLASSES & SUBCLASSES ── */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="border-b border-[#c9a84c]/20 pb-3">
              <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Caminho do Herói (Classe)</h2>
              <p className="text-[#8a8a93] text-xs mt-1">Sua classe dita seu estilo de combate, magias e a subclasse determina sua especialidade.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classes list */}
              <div className="md:col-span-1 space-y-3 h-96 overflow-y-auto pr-1">
                <p className="text-[10px] font-heading font-bold text-primary/70 uppercase tracking-widest sticky top-0 bg-[#07070b] py-1 z-10">Classes Principais</p>
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedClass?.id === cls.id
                        ? "bg-[#1a1025]/50 border-primary shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                        : "bg-[#0f0f18]/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm text-[#e8dfc0] uppercase tracking-wide">{cls.name}</span>
                  </div>
                ))}
              </div>

              {/* Subclass/Class details (Premium BG3/Diablo-like layout) */}
              <div className="md:col-span-2 bg-[#0f0f18]/85 border border-[#c9a84c]/20 rounded-3xl overflow-hidden flex flex-col h-full max-h-[50vh] md:max-h-[75vh] shadow-[0_15px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200">
                {selectedClass && (
                  <div ref={classDetailsScrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
                    
                    {/* Class Details & Spec block */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 border-2 border-[#c9a84c]/20 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative group">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                          <img 
                            src={getClassPresetImage(selectedClass.name)} 
                            alt={selectedClass.name} 
                            className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 ease-out" 
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-[#c9a84c] font-heading font-bold">Caminho & Vocação</span>
                            <h3 className="text-3xl sm:text-4xl font-heading font-black text-white uppercase tracking-wider">{selectedClass.name}</h3>
                          </div>

                          {/* Class Stats metadata badges */}
                          <div className="flex flex-wrap gap-2">
                            <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg font-bold">
                              Dado de Vida: {selectedClass.hitDie}
                            </span>
                            <span className="text-[9px] bg-[#1a1025] border border-purple-900/30 text-purple-300 px-2.5 py-1 rounded-lg font-bold">
                              Atributo Principal: {selectedClass.primaryStat}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Class Lore */}
                      <div className="pl-4 border-l-2 border-[#c9a84c] py-1 bg-white/[0.01] rounded-r-md mt-4">
                        <p className="text-xs text-[#8a8a93] font-serif leading-relaxed">
                          {selectedClass.desc}
                        </p>
                      </div>

                      {/* Subclasses (archetypes) list */}
                      {SUBCLASSES[selectedClass.name] && (
                        <div className="space-y-4 pt-2">
                          <p className="text-[10px] font-heading font-bold text-[#c9a84c] uppercase tracking-widest">Especializações (Subclasse)</p>
                          <div className="grid grid-cols-1 gap-3">
                            {SUBCLASSES[selectedClass.name].map((sub: any) => {
                              const isSubSelected = selectedSubclass?.name === sub.name;
                              return (
                                <div
                                  key={sub.name}
                                  onClick={() => setSelectedSubclass(sub)}
                                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                                    isSubSelected
                                      ? "bg-[#1a1025]/50 border-primary shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                                      : "bg-[#07070b]/60 border-zinc-900 hover:border-zinc-800"
                                  }`}
                                >
                                  <span className="font-heading text-xs font-bold text-white uppercase">{sub.name}</span>
                                  <p className="text-[10px] text-[#8a8a93] font-serif mt-1.5 leading-relaxed">"{sub.desc}"</p>
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {sub.traits.map((t: any, idx: number) => (
                                      <span key={idx} className="bg-zinc-800/80 text-[#e8dfc0] text-[9px] px-2 py-0.5 rounded border border-white/5 font-medium">
                                        ✦ {t}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sticky Action Footer */}
                <div className="p-4 bg-black/60 border-t border-white/5 flex justify-between items-center shrink-0">
                  <button onClick={() => setStep(1)} className="text-xs text-[#8a8a93] hover:text-white transition-colors">
                    Voltar
                  </button>
                  <Button onClick={() => setStep(3)} className="btn-gold text-xs px-6 py-5 rounded-xl font-bold flex items-center gap-1.5">
                    Escolher Antecedente <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: BACKGROUNDS ── */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div className="border-b border-[#c9a84c]/20 pb-3">
              <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Origem Pessoal (Antecedente)</h2>
              <p className="text-[#8a8a93] text-xs mt-1">Sua história antes de se tornar um aventureiro dita suas perícias fundamentais.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
                {BACKGROUNDS.map(bg => (
                  <div
                    key={bg.id}
                    onClick={() => setSelectedBackground(bg)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      selectedBackground.id === bg.id
                        ? "bg-[#1a1025]/50 border-primary shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                        : "bg-[#0f0f18]/60 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-heading font-bold text-sm text-[#e8dfc0] uppercase tracking-wide">{bg.name}</span>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-2xl font-heading font-black text-white uppercase">{selectedBackground.name}</h3>
                  <div className="flex gap-2 items-start mt-2 border-l-2 border-[#c9a84c] pl-3 py-1 bg-white/[0.02] rounded-r">
                    <Quote className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#c9a84c] italic font-serif leading-relaxed">"{selectedBackground.quote}"</p>
                  </div>
                  <p className="text-xs text-[#8a8a93] mt-4 font-serif leading-relaxed">{selectedBackground.desc}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Skills */}
                  <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <Swords className="w-4 h-4 text-primary" />
                      <p className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest">Perícias</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedBackground.skills.map((skill: string) => (
                        <span key={skill} className="bg-primary/15 border border-primary/30 text-primary font-bold text-[10px] px-2 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  {selectedBackground.languages && (
                    <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <p className="text-[10px] font-heading font-bold text-blue-400/80 uppercase tracking-widest">Idiomas</p>
                      </div>
                      <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
                        {selectedBackground.languages.map((lang: string, i: number) => <li key={i}>{lang}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Tools */}
                  {selectedBackground.tools && (
                    <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-orange-400" />
                        <p className="text-[10px] font-heading font-bold text-orange-400/80 uppercase tracking-widest">Ferramentas</p>
                      </div>
                      <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
                        {selectedBackground.tools.map((tool: string, i: number) => <li key={i}>{tool}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Vehicles */}
                  {selectedBackground.vehicles && (
                    <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <Ship className="w-4 h-4 text-cyan-400" />
                        <p className="text-[10px] font-heading font-bold text-cyan-400/80 uppercase tracking-widest">Veículos</p>
                      </div>
                      <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
                        {selectedBackground.vehicles.map((v: string, i: number) => <li key={i}>{v}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Equipment with Icons */}
                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Backpack className="w-4 h-4 text-green-400" />
                    <p className="text-[10px] font-heading font-bold text-green-400/80 uppercase tracking-widest">Equipamento Inicial</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {selectedBackground.equipment.map((eq: string, i: number) => {
                      const iconPath = getBackgroundEquipIcon(eq);
                      return (
                        <div key={i} className="flex items-center gap-2.5 bg-green-900/10 border border-green-500/20 text-green-300 text-[10px] px-3 py-2 rounded-lg hover:bg-green-900/20 transition-colors">
                          {iconPath ? (
                            <div className="relative w-8 h-10 shrink-0">
                              <NextImage src={iconPath} alt={eq} fill className="object-contain drop-shadow-[0_0_3px_rgba(110,184,103,0.4)]" sizes="32px" />
                            </div>
                          ) : (
                            <Backpack className="w-4 h-4 text-green-500/60 shrink-0" />
                          )}
                          <span className="font-medium leading-tight">{eq}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* D&D Equipment Catalog - Armors, Shields, Weapons */}
                <div className="space-y-3 bg-gradient-to-br from-[#0f0f18] to-black/40 p-4 rounded-xl border border-[#c9a84c]/15">
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-[#c9a84c]" />
                    <p className="text-[10px] font-heading font-bold text-[#c9a84c]/80 uppercase tracking-widest">Catálogo de Equipamentos D&D</p>
                  </div>
                  <p className="text-[9px] text-gray-500 -mt-1">Referência visual de armaduras, escudos e armas disponíveis no jogo.</p>

                  {/* Category tabs */}
                  {(() => {
                    const grouped = groupByCategory(DND_EQUIPMENT_CATALOG);
                    const categoryOrder = ["armadura_leve", "armadura_media", "armadura_pesada", "escudo", "arma_simples_corpo", "arma_simples_distancia", "arma_marcial_corpo", "arma_marcial_distancia", "arma_especial"];
                    return (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                        {categoryOrder.map(cat => {
                          const items = grouped[cat];
                          if (!items || items.length === 0) return null;
                          const meta = CATEGORY_META[cat];
                          return (
                            <div key={cat} className={`space-y-2 ${meta.bgClass} border ${meta.borderClass} rounded-lg p-2.5`}>
                              <p className={`text-[8px] font-heading font-bold ${meta.colorClass} uppercase tracking-widest`}>
                                {meta.label}
                              </p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                                {items.map(item => (
                                  <EquipmentCard key={item.id} item={item} size="sm" />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Feature */}
                <div className="space-y-2 bg-gradient-to-br from-yellow-900/20 to-black/40 p-4 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <p className="text-[10px] font-heading font-bold text-yellow-500/80 uppercase tracking-widest">Habilidade: {selectedBackground.featureName}</p>
                  </div>
                  <p className="text-xs text-gray-300 font-serif leading-relaxed mt-1">{selectedBackground.featureDesc}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <button onClick={() => setStep(2)} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
                  <Button onClick={() => setStep(4)} className="btn-gold text-xs">
                    Ajustar Atributos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: ABILITY SCORES (POINT BUY & ALTERNATIVES) ── */}
        {step === 4 && (() => {
          // Math & Projections variables
          const conScoreVal = getFinalStat("CON");
          const conModVal = Math.floor((conScoreVal - 10) / 2);
          const desScoreVal = getFinalStat("DES");
          const desModVal = Math.floor((desScoreVal - 10) / 2);
          const forScoreVal = getFinalStat("FOR");
          const forModVal = Math.floor((forScoreVal - 10) / 2);
          const intScoreVal = getFinalStat("INT");
          const intModVal = Math.floor((intScoreVal - 10) / 2);
          const sabScoreVal = getFinalStat("SAB");
          const sabModVal = Math.floor((sabScoreVal - 10) / 2);
          const carScoreVal = getFinalStat("CAR");
          const carModVal = Math.floor((carScoreVal - 10) / 2);

          // HP
          const hitDieNumber = selectedClass ? parseInt(selectedClass.hitDie.replace("d", "")) : 8;
          let hpTotal = hitDieNumber + conModVal;
          if (selectedSubrace?.id === "anao_colina") {
            hpTotal += 1;
          }

          // CA (Armor Class)
          let caTotal = 10 + desModVal;
          let caExplanation = "10 + Mod. Destreza";
          if (selectedClass?.name === "Bárbaro") {
            caTotal = 10 + desModVal + conModVal;
            caExplanation = "Defesa Sem Armadura: 10 + DES + CON";
          } else if (selectedClass?.name === "Monge") {
            caTotal = 10 + desModVal + sabModVal;
            caExplanation = "Defesa Sem Armadura: 10 + DES + SAB";
          }
          if (selectedRace?.name === "Tortle") {
            caTotal = 17;
            caExplanation = "Casca Natural Tortle (Fixo 17)";
          }
          if (selectedRace?.name === "Warforged" || selectedSubrace?.id === "warforged_padrao") {
            caTotal += 1;
            caExplanation += " + 1 (Proteção Integrada)";
          }

          // Spellcasting properties
          const spellClassAbility = getSpellcastingAbility(selectedClass?.name);
          let spellcastingMod = 0;
          if (spellClassAbility === "INT") spellcastingMod = intModVal;
          else if (spellClassAbility === "SAB") spellcastingMod = sabModVal;
          else if (spellClassAbility === "CAR") spellcastingMod = carModVal;

          const showSpellcasting = !!spellClassAbility;
          const spellSaveDC = 10 + spellcastingMod;
          const spellAttackBonus = 2 + spellcastingMod;

          // Melee & Ranged Attack
          const meleeAttackBonus = 2 + forModVal;
          const rangedAttackBonus = 2 + desModVal;

          return (
            <div className="space-y-6 animate-slide-up">
              <div className="border-b border-[#c9a84c]/20 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
                <div>
                  <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Atributos e Poder</h2>
                  <p className="text-[#8a8a93] text-xs mt-1">Determine a capacidade bruta física e mental do seu herói.</p>
                </div>
                {genMethod === "point_buy" && (
                  <div className="bg-[#1a1025] border border-primary/30 rounded-xl px-4 py-2 text-right shrink-0">
                    <span className="block text-[9px] text-[#8a8a93] uppercase font-bold tracking-widest">Pontos Restantes</span>
                    <span className="text-2xl font-heading font-black text-primary">{pointsRemaining}</span>
                  </div>
                )}
              </div>

              {/* Method tabs */}
              <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-xl mb-4 overflow-x-auto">
                {[
                  { id: "point_buy", label: "Point Buy" },
                  { id: "standard_array", label: "Standard Array" },
                  { id: "dice_rolling", label: "Rolar Dados" },
                  { id: "ai_recommend", label: "Otimizar Spread" }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMethodChange(m.id as any)}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-[10px] font-bold font-heading uppercase transition-all ${
                      genMethod === m.id 
                        ? "bg-primary text-black shadow-lg shadow-primary/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Method Control Panel */}
                <div className="md:col-span-2 bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 space-y-4">
                  
                  {/* Standard Array Description */}
                  {genMethod === "standard_array" && (
                    <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-[10px] text-[#8a8a93] leading-relaxed">
                      Distribua os valores pré-definidos: <strong className="text-white">15, 14, 13, 12, 10, 8</strong> entre seus atributos. Selecionar um valor que já está em uso irá trocá-los de posição automaticamente.
                    </div>
                  )}

                  {/* Dice Rolling Panel */}
                  {genMethod === "dice_rolling" && (
                    <div className="p-4 bg-[#1a1025]/30 border border-purple-900/30 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-heading text-xs font-bold text-white uppercase">Sorte dos Dados (4d6 drop lowest)</p>
                          <p className="text-[9px] text-[#8a8a93]">Rola 4 dados de 6 faces, descartando o menor e somando os 3 maiores.</p>
                        </div>
                        <Button onClick={rollDiceScores} className="btn-gold text-[10px] h-8 px-4 font-bold shrink-0">
                          Rolar 6 Atributos
                        </Button>
                      </div>
                      {rolledScores.length > 0 && (
                        <div className="flex gap-2 justify-center flex-wrap bg-black/40 p-2.5 rounded-lg border border-white/5">
                          {rolledScores.map((score, i) => (
                            <span key={i} className="text-xs font-heading font-black text-primary px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                              {score}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Recommendation details */}
                  {genMethod === "ai_recommend" && (
                    <div className="p-4 bg-purple-950/10 border border-purple-900/20 rounded-xl space-y-2">
                      <p className="font-heading text-xs font-bold text-[#e8dfc0] uppercase">Recomendação da IA para {selectedClass?.name}</p>
                      <p className="text-[10px] text-[#8a8a93] leading-relaxed">
                        Spread otimizado focado no atributo principal da sua vocação (<strong className="text-white">{selectedClass?.primaryStat}</strong>). O Mestre Conjurador definiu uma distribuição balanceada visando sobrevivência (CON) e o potencial máximo de ataque.
                      </p>
                      <Button onClick={autoAllocateStats} variant="outline" className="h-7 text-[9px] border-primary/20 text-primary">
                        Aplicar Distribuição Otimizada
                      </Button>
                    </div>
                  )}

                  {/* Attributes Grid List */}
                  <div className="space-y-2">
                    {Object.keys(baseStats).map(stat => {
                      const finalScore = getFinalStat(stat);
                      const baseVal = baseStats[stat];
                      const racialBonus = selectedSubrace?.bonus[stat] || 0;
                      
                      return (
                        <div key={stat} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#07070b]/60 gap-3">
                          <div className="w-28 shrink-0">
                            <span className="block text-xs font-bold text-white font-heading uppercase">{stat}</span>
                            <span className="text-[9px] text-[#8a8a93]">Base: {baseVal} {racialBonus > 0 && `(+${racialBonus} Raça)`}</span>
                          </div>

                          {/* Modifier display */}
                          <div className="w-12 text-center bg-[#1a1a2e] border border-primary/10 rounded-lg py-1">
                            <span className="text-xs font-heading font-black text-primary block">{getMod(finalScore)}</span>
                            <span className="text-[7px] text-[#8a8a93] uppercase tracking-widest">Mod</span>
                          </div>

                          {/* Controls based on method */}
                          <div className="flex-1 flex justify-end items-center gap-3">
                            
                            {/* Point Buy Controls */}
                            {genMethod === "point_buy" && (
                              <div className="flex items-center gap-2.5">
                                <span className="text-[9px] text-[#8a8a93] font-mono">Custo: {POINT_BUY_COSTS[baseVal]} pt</span>
                                <button
                                  disabled={baseVal <= 8}
                                  onClick={() => handleStatChange(stat, -1)}
                                  className="w-7 h-7 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center cursor-pointer text-sm"
                                >
                                  -
                                </button>
                                <span className="font-heading font-black text-sm text-white w-5 text-center">{finalScore}</span>
                                <button
                                  disabled={baseVal >= 15 || pointsRemaining === 0}
                                  onClick={() => handleStatChange(stat, 1)}
                                  className="w-7 h-7 rounded-lg bg-zinc-800 text-white font-bold hover:bg-zinc-700 disabled:opacity-30 flex items-center justify-center cursor-pointer text-sm"
                                >
                                  +
                                </button>
                              </div>
                            )}

                            {/* Standard Array Dropdown */}
                            {genMethod === "standard_array" && (
                              <select
                                value={baseVal}
                                onChange={e => handleStandardArrayChange(stat, parseInt(e.target.value))}
                                className="bg-black/50 border border-[#c9a84c]/20 text-white rounded-lg px-2 py-1.5 text-xs font-heading font-bold outline-none"
                              >
                                {[15, 14, 13, 12, 10, 8].map(v => (
                                  <option key={v} value={v}>{v}</option>
                                ))}
                              </select>
                            )}

                            {/* Dice Rolling Dropdown */}
                            {genMethod === "dice_rolling" && (
                              rolledScores.length > 0 ? (
                                <select
                                  value={baseVal}
                                  onChange={e => handleRolledScoreChange(stat, parseInt(e.target.value))}
                                  className="bg-black/50 border border-[#c9a84c]/20 text-white rounded-lg px-2 py-1.5 text-xs font-heading font-bold outline-none"
                                >
                                  {rolledScores.map((v, i) => (
                                    <option key={i} value={v}>{v}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-[10px] text-zinc-600">Aguardando rolagens</span>
                              )
                            )}

                            {/* AI spread display (locked) */}
                            {genMethod === "ai_recommend" && (
                              <span className="font-heading font-black text-sm text-[#c9a84c] bg-[#c9a84c]/5 border border-[#c9a84c]/15 px-3 py-1 rounded-lg">
                                {finalScore}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Combat Projections Panel */}
                <div className="md:col-span-1 space-y-4">
                  <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-5 space-y-4">
                    <p className="text-[10px] font-heading font-bold text-[#c9a84c] uppercase tracking-widest border-b border-white/5 pb-2">Projeções de Combate</p>
                    
                    <div className="space-y-3">
                      {/* HP */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[11px] text-[#8a8a93] block">Vida Máxima (HP)</span>
                          <span className="text-[8px] text-zinc-500 font-serif">Dado {selectedClass?.hitDie} + CON ({conModVal >= 0 ? `+${conModVal}` : conModVal})</span>
                        </div>
                        <span className="font-heading font-black text-base text-emerald-400">{hpTotal}</span>
                      </div>

                      {/* CA */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[11px] text-[#8a8a93] block">Classe de Armadura (CA)</span>
                          <span className="text-[8px] text-zinc-500 font-serif">{caExplanation}</span>
                        </div>
                        <span className="font-heading font-black text-base text-sky-400">{caTotal}</span>
                      </div>

                      {/* Iniciativa */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[11px] text-[#8a8a93] block">Iniciativa</span>
                          <span className="text-[8px] text-zinc-500 font-serif">Bônus de Destreza</span>
                        </div>
                        <span className="font-heading font-black text-base text-yellow-500">
                          {desModVal >= 0 ? `+${desModVal}` : desModVal}
                        </span>
                      </div>

                      {/* Melee & Ranged attack */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[11px] text-[#8a8a93] block">Ataque Corpo a Corpo</span>
                          <span className="text-[8px] text-zinc-500 font-serif">Prof. (+2) + FOR ({forModVal >= 0 ? `+${forModVal}` : forModVal})</span>
                        </div>
                        <span className="font-heading font-black text-sm text-white">
                          +{meleeAttackBonus}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[11px] text-[#8a8a93] block">Ataque à Distância</span>
                          <span className="text-[8px] text-zinc-500 font-serif">Prof. (+2) + DES ({desModVal >= 0 ? `+${desModVal}` : desModVal})</span>
                        </div>
                        <span className="font-heading font-black text-sm text-white">
                          +{rangedAttackBonus}
                        </span>
                      </div>

                      {/* Spellcasting */}
                      {showSpellcasting ? (
                        <>
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div>
                              <span className="text-[11px] text-[#8a8a93] block">CD de Magia</span>
                              <span className="text-[8px] text-zinc-500 font-serif">8 + Prof (+2) + {spellClassAbility} ({spellcastingMod >= 0 ? `+${spellcastingMod}` : spellcastingMod})</span>
                            </div>
                            <span className="font-heading font-black text-base text-purple-400">{spellSaveDC}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div>
                              <span className="text-[11px] text-[#8a8a93] block">Bônus de Ataque Mágico</span>
                              <span className="text-[8px] text-zinc-500 font-serif">Prof. (+2) + {spellClassAbility} ({spellcastingMod >= 0 ? `+${spellcastingMod}` : spellcastingMod})</span>
                            </div>
                            <span className="font-heading font-black text-sm text-purple-400">+{spellAttackBonus}</span>
                          </div>
                        </>
                      ) : (
                        <div className="pt-2 border-t border-white/5 text-center py-2 bg-black/10 rounded">
                          <span className="text-[9px] text-zinc-600 block uppercase font-bold tracking-widest">Sem Conjurador</span>
                          <span className="text-[8px] text-zinc-700">Esta classe não conjura magias no Nv. 1</span>
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setStep(3)} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
                    <Button onClick={() => {
                      if (!validatePointBuy(baseStats)) {
                        setError("Todos os atributos base devem estar estritamente entre 8 e 15 na criação de personagens.");
                        return;
                      }
                      setError("");
                      setStep(5);
                    }} className="btn-gold text-xs px-6 py-4 font-bold rounded-xl flex items-center gap-1.5">
                      Definir Perícias <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ── STEP 5: PERÍCIAS (SKILLS) ── */}
        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <div className="border-b border-[#c9a84c]/20 pb-3 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Perícias e Proficiências</h2>
                <p className="text-[#8a8a93] text-xs mt-1">Sua classe permite que você escolha {selectedClass?.skillsCount || 2} perícias da lista abaixo.</p>
                <Button 
                  onClick={autoSelectSkills} 
                  variant="outline" 
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-950/20 text-[10px] font-bold font-heading flex items-center gap-1.5 h-7 mt-2"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" /> Otimizar com IA
                </Button>
              </div>
              <div className="bg-[#1a1025] border border-primary/30 rounded-xl px-4 py-2">
                <span className="block text-[9px] text-[#8a8a93] uppercase font-bold tracking-widest">Restantes</span>
                <span className="text-lg font-heading font-black text-primary text-center">
                  {selectedClass ? (selectedClass.skillsCount - selectedSkills.length) : 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {selectedClass?.skillsPool.map((skillName: string) => {
                    const isSelected = selectedSkills.includes(skillName);
                    const isFromBg = selectedBackground.skills.includes(skillName);
                    const skillInfo = ALL_SKILLS.find(s => s.name === skillName);
                    
                    return (
                      <div
                        key={skillName}
                        onClick={() => {
                          if (isFromBg) return;
                          if (isSelected) {
                            setSelectedSkills(prev => prev.filter(s => s !== skillName));
                          } else if (selectedSkills.length < selectedClass.skillsCount) {
                            setSelectedSkills(prev => [...prev, skillName]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex justify-between items-center ${
                          isFromBg 
                            ? "bg-zinc-900/40 border-zinc-800 opacity-60 cursor-not-allowed" 
                            : isSelected
                              ? "bg-[#18182b] border-[#c9a84c] cursor-pointer"
                              : "bg-[#07070b] border-zinc-900 hover:border-zinc-800 cursor-pointer"
                        }`}
                      >
                        <div>
                          <span className="block text-xs font-bold text-white uppercase">{skillName}</span>
                          <span className="text-[9px] text-[#8a8a93] uppercase">Mod: {skillInfo?.attr}</span>
                        </div>
                        {isFromBg ? (
                          <span className="text-[9px] bg-primary/20 border border-primary/30 text-primary px-1.5 py-0.5 rounded">Antecedente</span>
                        ) : isSelected ? (
                          <Check className="w-4 h-4 text-primary font-black" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-1 bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest">Grimório de Perícias</p>
                  <div className="flex flex-col gap-2">
                    {selectedBackground.skills.map((s: string) => (
                      <div key={s} className="flex justify-between items-center text-xs p-1">
                        <span className="text-[#8a8a93] font-bold">🛡️ {s}</span>
                        <span className="text-[9px] text-[#8a8a93] uppercase">Antecedente</span>
                      </div>
                    ))}
                    {selectedSkills.map(s => (
                      <div key={s} className="flex justify-between items-center text-xs p-1 border-t border-white/5 pt-2">
                        <span className="text-white font-bold">🗡️ {s}</span>
                        <span className="text-[9px] text-primary uppercase font-bold">Treinado</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <button onClick={() => setStep(getStepIndex("stats"))} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
                  <Button onClick={() => setStep(getStepIndex(isSpellcaster ? "spells" : "identity"))} className="btn-gold text-xs">
                    {isSpellcaster ? "Definir Magias" : "Avançar para Identidade"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 6: SPELLS LIST ── */}
        {step === 6 && (
          <div className="space-y-6 animate-slide-up">
            <div className="border-b border-[#c9a84c]/20 pb-3 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Livro de Feitiços (300+ Magias)</h2>
                <p className="text-[#8a8a93] text-xs mt-1">
                  {isSpellcaster 
                    ? `Filtros automáticos para ${selectedClass.name}. Escolha 2 Truques (Cantrips) e 2 Magias de 1º Círculo.` 
                    : `${selectedClass?.name} não canaliza magias arcanas no nível 1. Prossiga para a identidade.`}
                </p>
              </div>
              {isSpellcaster && (
                <div className="bg-[#1a1025] border border-primary/30 rounded-xl px-4 py-2 flex gap-4 text-xs font-bold font-heading">
                  <div>
                    <span className="block text-[8px] text-[#8a8a93] uppercase">Truques</span>
                    <span className="text-primary">{selectedCantrips.length}/2</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-[#8a8a93] uppercase">Magias Nv 1</span>
                    <span className="text-primary">{selectedSpells.length}/2</span>
                  </div>
                </div>
              )}
            </div>

            {!isSpellcaster ? (
              <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-10 text-center space-y-4">
                <p className="text-sm text-[#8a8a93] font-serif italic">"Sua força reside no aço de sua espada e na tenacidade do seu escudo."</p>
                <div className="flex justify-between items-center max-w-sm mx-auto">
                  <button onClick={() => setStep(5)} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
                  <Button onClick={() => setStep(7)} className="btn-gold text-xs">Avançar para Identidade</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cantrips (0) selector */}
                <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 space-y-3">
                  <p className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest">Truques (Cantrips) Disponíveis ({availableCantrips.length})</p>
                  <div className="space-y-2 h-72 overflow-y-auto pr-1">
                    {availableCantrips.map(c => {
                      const isSelected = selectedCantrips.includes(c.name_pt);
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCantrips(prev => prev.filter(item => item !== c.name_pt));
                            } else if (selectedCantrips.length < 2) {
                              setSelectedCantrips(prev => [...prev, c.name_pt]);
                            }
                          }}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#18182b] border-[#c9a84c]"
                              : "bg-[#07070b] border-zinc-900 hover:border-zinc-800"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-heading text-xs font-bold text-white uppercase">{c.name_pt}</span>
                              <span className="block text-[8px] text-[#8a8a93] uppercase font-bold mt-0.5">{c.school}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <p className="text-[9px] text-[#8a8a93] mt-1 font-serif line-clamp-2">{c.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Level 1 Spells selector */}
                <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest">Magias de 1º Círculo ({availableSpells.length})</p>
                    <div className="space-y-2 h-72 overflow-y-auto pr-1">
                      {availableSpells.map(s => {
                        const isSelected = selectedSpells.includes(s.name_pt);
                        return (
                          <div
                            key={s.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSpells(prev => prev.filter(item => item !== s.name_pt));
                              } else if (selectedSpells.length < 2) {
                                setSelectedSpells(prev => [...prev, s.name_pt]);
                              }
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#18182b] border-[#c9a84c]"
                                : "bg-[#07070b] border-zinc-900 hover:border-zinc-800"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-heading text-xs font-bold text-white uppercase">{s.name_pt}</span>
                                <span className="block text-[8px] text-[#8a8a93] uppercase font-bold mt-0.5">{s.school}</span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            </div>
                            <p className="text-[9px] text-[#8a8a93] mt-1 font-serif line-clamp-2">{s.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <button onClick={() => setStep(5)} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
                    <Button onClick={() => setStep(7)} className="btn-gold text-xs">
                      Batizar Herói
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 7: IDENTITY (NAME & ALIGNMENT) ── */}
        {step === 7 && (
          <div className="space-y-6 animate-slide-up max-w-2xl mx-auto w-full">
            <div className="border-b border-[#c9a84c]/20 pb-3">
              <h2 className="text-3xl font-heading font-black text-[#c9a84c] uppercase tracking-wider">Identidade & Destino</h2>
              <p className="text-[#8a8a93] text-xs mt-1">O nome é a primeira magia que conjuramos. Defina seu alinhamento e gere seu prelúdio.</p>
            </div>

            <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl p-6 gap-6 grid grid-cols-1 md:grid-cols-3 text-left">
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest block">Nome do Protagonista</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Thorgar Barba-de-Ferro..."
                    className="w-full bg-[#07070b]/60 border-b-2 border-transparent border-b-[#c9a84c]/20 px-4 py-3 text-xl text-[#e8dfc0] font-heading uppercase placeholder-zinc-700 outline-none focus:border-b-[#c9a84c] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest block">Alinhamento (Conduta)</label>
                    <select
                      value={alignment}
                      onChange={e => setAlignment(e.target.value)}
                      className="w-full bg-[#07070b] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-[#e8dfc0] outline-none"
                    >
                      {ALIGNMENTS.map(align => (
                        <option key={align} value={align} className="bg-[#07070b] text-[#e8dfc0]">{align}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={generateLore}
                      disabled={!name.trim() || aiGenerating}
                      className="w-full bg-[#1a1025] hover:bg-[#2d1b4e] text-purple-200 border border-purple-500/30 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-10"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {aiGenerating ? "Simulando destino..." : "Escrever Prelúdio (IA)"}
                    </button>
                  </div>
                </div>

                {aiLore && (
                  <div className="rounded-xl p-4 border border-purple-500/20 text-xs text-purple-200 leading-relaxed font-serif italic border-l-2 border-purple-500/50 pl-4 bg-purple-950/5 animate-scale-in">
                    "{aiLore}"
                  </div>
                )}
              </div>

              {/* Coluna do Retrato */}
              <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-6 space-y-4">
                <span className="text-[10px] font-heading font-bold text-primary/80 uppercase tracking-widest block text-center">Retrato da Lenda</span>
                <div className="relative w-40 h-52 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_25px_rgba(0,0,0,0.5)] group cursor-pointer"
                  onClick={() => setShowPortraitModal(true)}>
                  <img src={imageUrl || "/portrait-placeholder.png"} alt="Retrato" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-xs text-[#c9a84c] font-bold">
                    <Camera className="w-5 h-5" />
                    Alterar Retrato
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPortraitModal(true)}
                  variant="ghost" 
                  className="text-xs font-bold text-primary hover:text-white border border-primary/20 hover:bg-primary/10 w-full h-9 rounded-xl flex items-center justify-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Personalizar Retrato
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={() => setStep(getStepIndex(isSpellcaster ? "spells" : "skills"))} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
              <Button onClick={() => setStep(getStepIndex("review"))} disabled={!name.trim()} className="btn-gold text-xs">
                Avançar para Consagração
              </Button>
            </div>
          </div>
        )}


        {/* ── STEP 8: FINAL REVIEW (CONSAGRAÇÃO) ── */}
        {step === 8 && (
          <div className="space-y-6 animate-scale-in max-w-2xl mx-auto w-full">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-heading font-black text-[#c9a84c] uppercase tracking-widest">Consagração da Lenda</h2>
              <p className="text-[#8a8a93] text-xs font-serif italic">"Verifique as escrituras de sua história. Se tudo estiver correto, sele o pacto."</p>
            </div>

            <div className="bg-[#0f0f18]/80 border border-primary/20 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-950/20 to-zinc-950 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 rounded-xl overflow-hidden border border-primary/30 shrink-0 shadow-lg">
                    <img src={imageUrl || "/portrait-placeholder.png"} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] text-primary/70 uppercase tracking-widest font-bold font-heading">
                      {selectedRace.name} ({selectedSubrace?.name || "Padrão"}) • {selectedBackground.name}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-heading font-black text-white uppercase mt-0.5 leading-tight">{name}</h3>
                    {selectedClass && (
                      <span className="inline-block text-[9px] bg-primary/10 border border-primary/30 text-primary font-bold px-2 py-0.5 rounded mt-1.5 uppercase tracking-wide">
                        ⚔️ {selectedClass.name} ({selectedSubclass?.name || "Classe Padrão"})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="block text-[8px] text-[#8a8a93] uppercase font-bold tracking-widest">Alinhamento</span>
                  <span className="text-xs text-[#e8dfc0] font-heading font-bold uppercase">{alignment}</span>
                </div>
              </div>


              <div className="grid grid-cols-6 divide-x divide-white/5 bg-black/40 border-b border-white/5">
                {Object.keys(baseStats).map(stat => (
                  <div key={stat} className="py-4 text-center">
                    <span className="block text-[8px] text-[#8a8a93] uppercase font-bold tracking-wider">{stat}</span>
                    <span className="text-base font-heading font-black text-white">{getFinalStat(stat)}</span>
                    <span className="block text-[9px] text-primary font-bold mt-0.5">{getMod(getFinalStat(stat))}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-b border-white/5 space-y-2">
                <p className="text-[9px] text-[#8a8a93] uppercase font-bold tracking-widest">Perícias Treinadas</p>
                <div className="flex flex-wrap gap-2">
                  {[...selectedBackground.skills, ...selectedSkills].map((s, idx) => (
                    <span key={idx} className="bg-zinc-900 border border-zinc-800 text-[10px] text-white px-2.5 py-1 rounded-lg">
                      🛡️ {s}
                    </span>
                  ))}
                </div>
              </div>

              {(selectedCantrips.length > 0 || selectedSpells.length > 0) && (
                <div className="p-6 border-b border-white/5 space-y-2">
                  <p className="text-[9px] text-[#8a8a93] uppercase font-bold tracking-widest">Truques e Magias de 1º Círculo</p>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedCantrips, ...selectedSpells].map((spell, idx) => (
                      <span key={idx} className="bg-primary/5 border border-primary/20 text-[10px] text-primary px-2.5 py-1 rounded-lg font-bold">
                        🔮 {spell}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 bg-black/10 font-serif italic text-xs text-[#8a8a93] leading-relaxed border-t border-white/5">
                "{aiLore || `Uma nova lenda surge na Costa da Espada. ${name}, o ${selectedRace.name} ${selectedClass?.name || "Guerreiro"}, inicia seu conto sob a vigília das estrelas.`}"
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/20 text-red-400 text-xs text-center font-bold">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={() => setStep(getStepIndex("identity"))} className="text-xs text-[#8a8a93] hover:text-white transition-colors">Voltar</button>
              <Button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-2 text-xs font-black">
                {saving ? "Inscrevendo Lenda..." : "Consagrar Herói"}
              </Button>
            </div>
          </div>
        )}
      </div>

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
                      { label: "Símbolos", value: aiSymbols, setter: setAiSymbols, placeholder: "Ex: Uma lua crescent prateada" },
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        setImageUrl(base64String);
                        setShowPortraitModal(false);
                      };
                      reader.readAsDataURL(file);
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
                        setImageUrl(customImageUrl.trim());
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
                        setImageUrl(preset.url);
                        setShowPortraitModal(false);
                      }}
                      className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-primary transition-all relative group text-left"
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
                    setImageUrl(getRacePresetImage(selectedRace?.name));
                    setShowPortraitModal(false);
                  }}
                  variant="ghost" 
                  className="w-full hover:bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold"
                >
                  Restaurar Padrão da Raça
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

