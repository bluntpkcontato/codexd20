export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export const SKILL_ATTRIBUTE_MAP: Record<string, string> = {
  "Acrobacia":        "DES",
  "Arcanismo":        "INT",
  "Atletismo":        "FOR",
  "Atuação":          "CAR",
  "Enganação":        "CAR",
  "Furtividade":      "DES",
  "História":         "INT",
  "Intimidação":      "CAR",
  "Intuição":         "SAB",
  "Investigação":     "INT",
  "Lidar com Animais":"SAB",
  "Medicina":         "SAB",
  "Natureza":         "INT",
  "Percepção":        "SAB",
  "Persuasão":        "CAR",
  "Prestidigitação":  "DES",
  "Religião":         "INT",
  "Sobrevivência":    "SAB",
};

// D&D 5e: each class has 2 saving throw proficiencies
export const CLASS_SAVING_THROWS: Record<string, string[]> = {
  "Bárbaro":    ["FOR", "CON"],
  "Bardo":      ["DES", "CAR"],
  "Clérigo":    ["SAB", "CAR"],
  "Druida":     ["INT", "SAB"],
  "Guerreiro":  ["FOR", "CON"],
  "Ladino":     ["DES", "INT"],
  "Mago":       ["INT", "SAB"],
  "Feiticeiro": ["CON", "CAR"],
  "Bruxo":      ["SAB", "CAR"],
  "Monge":      ["FOR", "DES"],
  "Paladino":   ["SAB", "CAR"],
  "Patrulheiro":["FOR", "DES"],
  "Artífice":   ["CON", "INT"],
};

// Unarmed damage die by class/level (D&D 5e Monk Martial Arts)
export function getUnarmedDamageDie(charClass: string, level: number): number {
  const normClass = (charClass || "").trim().toLowerCase();
  if (normClass === "monge" || normClass === "monk") {
    if (level >= 17) return 10;
    if (level >= 11) return 8;
    if (level >= 5)  return 6;
    return 4;
  }
  return 4;
}

export interface UnarmedDamageResult {
  dice: string;
  fixed: number;
  display: string;
  isMonk: boolean;
}

export function calculateUnarmedDamage(
  charClass: string,
  level: number,
  stats: { FOR?: number; DES?: number }
): UnarmedDamageResult {
  const normClass = (charClass || "").trim().toLowerCase();
  const isMonk = normClass === "monge" || normClass === "monk";
  const strScore = stats.FOR || 10;
  const strMod = Math.floor((strScore - 10) / 2);

  if (!isMonk) {
    const totalFixed = 1 + strMod;
    return {
      dice: "",
      fixed: totalFixed,
      display: `${totalFixed}`,
      isMonk: false,
    };
  }

  // Monk Martial Arts
  const dexScore = stats.DES || 10;
  const dexMod = Math.floor((dexScore - 10) / 2);
  const modifier = Math.max(strMod, dexMod);
  const die = getUnarmedDamageDie(charClass, level);

  return {
    dice: `1d${die}`,
    fixed: modifier,
    display: `1d${die}${modifier >= 0 ? `+${modifier}` : modifier}`,
    isMonk: true,
  };
}

export function hasSpellbook(charClass: string, subclass?: string, level: number = 1): boolean {
  const normClass = (charClass || "").trim().toLowerCase();
  const normSubclass = (subclass || "").trim().toLowerCase();

  if (normClass === "guerreiro" || normClass === "fighter") {
    const isEldritchKnight =
      normSubclass === "eldritch knight" || normSubclass === "cavaleiro arcano";
    return isEldritchKnight && level >= 3;
  }

  // Other spellcasters
  const spellcasters = [
    "mago",
    "wizard",
    "feiticeiro",
    "sorcerer",
    "clérigo",
    "cleri",
    "cleric",
    "druida",
    "druid",
    "bardo",
    "bard",
    "bruxo",
    "warlock",
    "paladino",
    "paladin",
    "patrulheiro",
    "ranger",
    "artífice",
    "artificer",
  ];

  return spellcasters.some((sc) => normClass.includes(sc));
}

export function validatePointBuy(stats: Record<string, number>): boolean {
  for (const key in stats) {
    const val = stats[key];
    if (val < 8 || val > 15) {
      return false;
    }
  }
  return true;
}

// D&D 5e Equipment catalog
export const DND_EQUIPMENT_CATALOG = {
  weapons_simple_melee: [
    { name: "Clava",           type: "Arma", bonus: 4,  weight: 2,  desc: "1d4 contundente" },
    { name: "Adaga",           type: "Arma", bonus: 4,  weight: 1,  desc: "1d4 perfurante, Finesse, Arremessável" },
    { name: "Bordão",          type: "Arma", bonus: 6,  weight: 4,  desc: "1d6 contundente, Versátil (1d8)" },
    { name: "Foice de mão",    type: "Arma", bonus: 4,  weight: 2,  desc: "1d4 cortante, Leve" },
    { name: "Lança",           type: "Arma", bonus: 6,  weight: 3,  desc: "1d6 perfurante, Arremessável, Versátil" },
    { name: "Machado de mão",  type: "Arma", bonus: 6,  weight: 2,  desc: "1d6 cortante, Leve, Arremessável" },
    { name: "Maca",            type: "Arma", bonus: 6,  weight: 4,  desc: "1d6 contundente" },
    { name: "Martelo leve",    type: "Arma", bonus: 4,  weight: 2,  desc: "1d4 contundente, Leve, Arremessável" },
    { name: "Porrete",         type: "Arma", bonus: 6,  weight: 3,  desc: "1d6 contundente" },
  ],
  weapons_simple_ranged: [
    { name: "Arco curto",      type: "Arma", bonus: 6,  weight: 2,  desc: "1d6 perfurante, Munição, À distância (24/96)" },
    { name: "Besta de mão",    type: "Arma", bonus: 6,  weight: 3,  desc: "1d6 perfurante, Munição, À distância (9/36), Recarga" },
    { name: "Dardo",           type: "Arma", bonus: 4,  weight: 0,  desc: "1d4 perfurante, Finesse, Arremessável" },
    { name: "Funda",           type: "Arma", bonus: 4,  weight: 0,  desc: "1d4 contundente, Munição, À distância (9/36)" },
  ],
  weapons_martial_melee: [
    { name: "Espada longa",    type: "Arma", bonus: 8,  weight: 3,  desc: "1d8 cortante, Versátil (1d10)" },
    { name: "Espada curta",    type: "Arma", bonus: 6,  weight: 2,  desc: "1d6 perfurante, Finesse, Leve" },
    { name: "Espada grande",   type: "Arma", bonus: 12, weight: 6,  desc: "2d6 cortante, Pesada, Duas mãos" },
    { name: "Rapieira",        type: "Arma", bonus: 8,  weight: 2,  desc: "1d8 perfurante, Finesse" },
    { name: "Machado de batalha",type:"Arma",bonus: 8,  weight: 4,  desc: "1d8 cortante, Versátil (1d10)" },
    { name: "Machado grande",  type: "Arma", bonus: 12, weight: 7,  desc: "1d12 cortante, Pesada, Duas mãos" },
    { name: "Martelo de guerra",type:"Arma", bonus: 8,  weight: 2,  desc: "1d8 contundente, Versátil (1d10)" },
    { name: "Lança de cavalaria",type:"Arma",bonus: 12, weight: 6,  desc: "1d12 perfurante, Alcance, Pesada" },
    { name: "Alabarda",        type: "Arma", bonus: 10, weight: 6,  desc: "1d10 cortante, Pesada, Alcance, Duas mãos" },
    { name: "Mangual",         type: "Arma", bonus: 8,  weight: 2,  desc: "1d8 contundente" },
    { name: "Tridente",        type: "Arma", bonus: 6,  weight: 4,  desc: "1d6 perfurante, Arremessável, Versátil (1d8)" },
  ],
  weapons_martial_ranged: [
    { name: "Arco longo",      type: "Arma", bonus: 8,  weight: 2,  desc: "1d8 perfurante, Munição, À distância (45/180), Pesada, Duas mãos" },
    { name: "Besta leve",      type: "Arma", bonus: 8,  weight: 5,  desc: "1d8 perfurante, Munição, À distância (24/96), Recarga, Duas mãos" },
    { name: "Besta pesada",    type: "Arma", bonus: 10, weight: 18, desc: "1d10 perfurante, Munição, À distância (30/120), Pesada, Recarga, Duas mãos" },
  ],
  armor: [
    { name: "Acolchoado",      type: "Armadura", bonus: 11, weight: 8,  desc: "CA 11 + Des. Leve. Desvantagem em Furtividade." },
    { name: "Couro",           type: "Armadura", bonus: 11, weight: 10, desc: "CA 11 + Des. Leve." },
    { name: "Couro batido",    type: "Armadura", bonus: 13, weight: 13, desc: "CA 13 + Des (máx 2). Média." },
    { name: "Cota de malha",   type: "Armadura", bonus: 14, weight: 20, desc: "CA 14 + Des (máx 2). Média. Des min 12." },
    { name: "Gibão de peles",  type: "Armadura", bonus: 12, weight: 45, desc: "CA 12 + Des (máx 2). Média. Desvantagem Furtividade." },
    { name: "Brunea",          type: "Armadura", bonus: 14, weight: 20, desc: "CA 14 + Des (máx 2). Média. Desvantagem Furtividade." },
    { name: "Meia armadura",   type: "Armadura", bonus: 15, weight: 40, desc: "CA 15 + Des (máx 2). Média. Desvantagem Furtividade." },
    { name: "Anéis",           type: "Armadura", bonus: 14, weight: 40, desc: "CA 14. Pesada. Desvantagem Furtividade. Força 13." },
    { name: "Cota de escamas", type: "Armadura", bonus: 14, weight: 45, desc: "CA 14. Pesada. Desvantagem Furtividade. Força 13." },
    { name: "Armadura em bandas",type:"Armadura",bonus: 14, weight: 35, desc: "CA 14. Pesada. Desvantagem Furtividade. Força 13." },
    { name: "Cota de placas",  type: "Armadura", bonus: 16, weight: 65, desc: "CA 16. Pesada. Desvantagem Furtividade. Força 15." },
    { name: "Meia placa",      type: "Armadura", bonus: 17, weight: 40, desc: "CA 17 + Des (máx 2). Pesada. Des min 13." },
    { name: "Armadura de placas",type:"Armadura",bonus: 18, weight: 65, desc: "CA 18. Pesada. Desvantagem Furtividade. Força 15." },
  ],
  shields: [
    { name: "Escudo",          type: "Escudo",   bonus: 2,  weight: 6,  desc: "+2 CA. Requer uma mão livre." },
    { name: "Escudo de torre", type: "Escudo",   bonus: 3,  weight: 45, desc: "+3 CA. Pesado. Desvantagem em Furtividade." },
  ],
  adventuring_gear: [
    { name: "Corda de cânhamo (15m)", type: "Equipamento", bonus: 0, weight: 10, desc: "Resistência de 2 toneladas. Útil para escalada." },
    { name: "Tocha",           type: "Equipamento", bonus: 0, weight: 1,  desc: "Ilumina 6m brilhante + 6m fraco por 1 hora." },
    { name: "Lanterna coberta",type: "Equipamento", bonus: 0, weight: 2,  desc: "Ilumina 9m brilhante por 6 horas (1 caneca de óleo)." },
    { name: "Poção de Cura",   type: "Poção",        bonus: 0, weight: 0.5,desc: "Cura 2d4+2 HP." },
    { name: "Poção de Cura Maior",type:"Poção",      bonus: 0, weight: 0.5,desc: "Cura 4d4+4 HP." },
    { name: "Poção de Antídoto",type:"Poção",        bonus: 0, weight: 0.5,desc: "Cura envenenamento." },
    { name: "Bolsa de aventureiro",type:"Equipamento",bonus:0, weight: 5,  desc: "Kit básico de aventura." },
    { name: "Kit de escalada", type: "Equipamento", bonus: 0, weight: 12, desc: "Ganchos, luvas, botas. +Vantagem em escalada." },
    { name: "Kit de cura",     type: "Equipamento", bonus: 0, weight: 3,  desc: "Permite estabilizar criaturas a 0 HP." },
    { name: "Ferramentas de ladrão",type:"Equipamento",bonus:0,weight: 1, desc: "Para abrir fechaduras e desarmar armadilhas." },
  ],
};

// D&D 5e Feats list (common feats)
export const DND_FEATS = [
  { name: "Alerta", desc: "Bônus de +5 à Iniciativa. Não pode ser surpreendido. Inimigos não têm vantagem em ataques ocultos contra você.", requirement: null },
  { name: "Andarilho", desc: "Aumento de VEL em 3m. +Vantagem em Sobrevivência para rastrear. Pode mover terreno difícil a custo normal em combate.", requirement: null },
  { name: "Atirador", desc: "Ignora cobertura de criaturas não-aliadas. Sem penalidade em alcance longo. +1 em DES (máx 20).", requirement: null },
  { name: "Atacar em Rajada", desc: "Quando atacar com uma arma de uma mão, use ação bônus para atacar com outra arma leve.", requirement: null },
  { name: "Campeão Mágico", desc: "+1 INT, SAB ou CAR (máx 20). Conheça 2 truques extras do Mago, Clérigo ou Druida.", requirement: null },
  { name: "Conjurador de Guerra", desc: "Vantagem em Constituição para manter Concentração. Pode conjurar como Reação. Pode conjurar com as mãos ocupadas.", requirement: "Capacidade de conjurar ao menos um feitiço" },
  { name: "Duelista", desc: "Quando empunhar uma arma de uma mão e a outra estiver vazia, +2 nos danos dessa arma.", requirement: null },
  { name: "Especialização em Arma", desc: "+1 FOR ou DES (máx 20). Escolha um tipo de arma: proficiência e +2 nas jogadas de dano com ela.", requirement: "Proficiência em armas marciais" },
  { name: "Fortuna dos Corajosos", desc: "+1 em FOR (máx 20). Ao cair a 0 HP, role 1d20. Em 20, fica com 1 HP.", requirement: null },
  { name: "Grande Saúde", desc: "+2 HP por nível (retroativo). Aumento de CON em +1 (máx 20).", requirement: null },
  { name: "Guardião Resiliente", desc: "Escolha um atributo — você ganha proficiência naquela salvaguarda.", requirement: null },
  { name: "Iniciativa Aguçada", desc: "Bônus de +5 à Iniciativa. +1 DES (máx 20).", requirement: null },
  { name: "Inspirado", desc: "+1 em um atributo à escolha (máx 20). Adicione um d6 a uma rolagem de perícia, ataque ou TR uma vez por descanso curto.", requirement: null },
  { name: "Lutador", desc: "+2 nos ataques desarmados. Pode usar DES em vez de FOR. Criaturas agarradas por você têm desvantagem contra outros.", requirement: null },
  { name: "Mago de Batalha", desc: "Pode usar foco arcano em vez de componentes. +1 ao AC quando conjurar feitiço. +1 INT (máx 20).", requirement: null },
  { name: "Observador", desc: "+5 em Percepção passiva. +1 INT ou SAB (máx 20). Leitura labial se ver a boca da criatura.", requirement: null },
  { name: "Resistente", desc: "+1 em um atributo à escolha (máx 20). Vantagem nas TR daquele atributo.", requirement: null },
  { name: "Sortudo", desc: "3 pontos de sorte por descanso longo. Gaste 1 para rolar +1d20 em ataque, TR ou teste. Escolha o melhor ou pior resultado de ataques contra você.", requirement: null },
  { name: "Taumaturgo", desc: "Aprenda um truque extra e 2 feitiços de 1º nível (1/descanso longo). +1 em INT, SAB ou CAR (máx 20).", requirement: null },
  { name: "Atirador Habilidoso", desc: "Ignore penalidade de alcance longo. Sem desvantagem se inimigos adjacentes. +10 ao dano se reduzir o ataque em 5.", requirement: null },
];

export function getSpellcastingAbility(className?: string): "INT" | "SAB" | "CAR" | null {
  if (!className) return null;
  const cName = className.trim();
  if (["Mago", "Artífice", "Wizard", "Artificer"].includes(cName)) return "INT";
  if (["Clérigo", "Druida", "Patrulheiro", "Cleric", "Druid", "Ranger"].includes(cName)) return "SAB";
  if (["Bardo", "Feiticeiro", "Bruxo", "Paladino", "Bard", "Sorcerer", "Warlock", "Paladin"].includes(cName)) return "CAR";
  return null;
}
