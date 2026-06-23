export function normalizeCharacterPayload(data: any) {
  return {
    ...data,
    skills: data.skills ?? [],
    savingThrows: data.savingThrows ?? [],
    proficiencies: data.proficiencies ?? [],
    equipment: data.equipment ?? [],
    spells: data.spells ?? [],
    features: data.features ?? [],
    inventory: data.inventory ?? [],
    languages: data.languages ?? [],
    tools: data.tools ?? [],
    vehicles: data.vehicles ?? [],
    background_feature: data.background_feature ?? { name: "", desc: "" },
    lore: data.lore ?? "",
    subclass: data.subclass ?? "",
    max_hp: data.max_hp ?? 10,
    current_hp: data.current_hp ?? 10,
    armor_class: data.armor_class ?? 10,
    proficiency_bonus: data.proficiency_bonus ?? 2
  };
}

export function generateRandomCharacterPayload(userId: string) {
  const races = ["Humano", "Elfo", "Anão", "Halfling", "Draconato", "Tiefling", "Meio-Orc", "Golias", "Tabaxi"];
  const classes = ["Guerreiro", "Mago", "Ladino", "Clérigo", "Bárbaro", "Bardo", "Paladino", "Patrulheiro"];
  const names = ["Theren", "Kael", "Lyra", "Grim", "Sariel", "Rurik", "Ignis", "Thokk", "Aria", "Brog"];
  
  const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  
  const selectedRace = randomItem(races);
  const selectedClass = randomItem(classes);
  const selectedName = randomItem(names) + " (Aleatório)";

  // Basic robust payload matching the database schema and frontend expectations
  const basePayload = {
    user_id: userId,
    name: selectedName,
    race: selectedRace,
    char_class: selectedClass,
    level: 1,
    stats: { 
      FOR: Math.floor(Math.random() * 6) + 10, // 10-15
      DES: Math.floor(Math.random() * 6) + 10, 
      CON: Math.floor(Math.random() * 6) + 10, 
      INT: Math.floor(Math.random() * 6) + 10, 
      SAB: Math.floor(Math.random() * 6) + 10, 
      CAR: Math.floor(Math.random() * 6) + 10,
      subclass: "",
      background_feature: { name: "Herói Inesperado", desc: "Sorte ou destino o colocaram neste caminho." },
      languages: ["Comum", "Élfico"],
      tools: [],
      vehicles: [],
      proficiencies: ["Atletismo", "Percepção"]
    },
    inventory: [
      { name: "Armadura de Couro", type: "Armadura", bonus: 11 },
      { name: "Espada Longa", type: "Arma" },
      { name: "Mochila de Aventureiro", type: "Equipamento" },
      { name: "Poção de Cura", type: "Consumível" }
    ],
    spells: selectedClass === "Mago" || selectedClass === "Clérigo" ? ["Luz", "Mísseis Mágicos"] : [],
    image_url: "",
    lore: `Um ${selectedRace} ${selectedClass} gerado pelas correntes do destino.`,
  };

  return normalizeCharacterPayload(basePayload);
}
