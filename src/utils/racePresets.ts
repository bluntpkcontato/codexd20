export const getRacePresetImage = (raceName: string): string => {
  if (!raceName) return "/portrait-placeholder.png";
  
  const name = raceName.toLowerCase();
  
  // Strict, non-repeating mappings for every single race defined in dnd_expansion.json
  if (name.includes("meio-elfo") || name.includes("meio_elfo")) {
    return "/race_meio_elfo.png";
  }
  if (name.includes("meio-orc") || name.includes("meio_orc")) {
    return "/race_meio_orc.png";
  }
  if (name.includes("humano")) {
    return "/race_humano_1782020866277.png";
  }
  if (name.includes("elfo")) {
    return "/race_elfo_1782020855302.png";
  }
  if (name.includes("anão") || name.includes("anao")) {
    return "/race_anao.png";
  }
  if (name.includes("halfling")) {
    return "/race_halfling.png";
  }
  if (name.includes("tiefling")) {
    return "/race_tiefling_1782020883867.png";
  }
  if (name.includes("draconato")) {
    return "/race_draconato.png";
  }
  if (name.includes("golias") || name.includes("goliath")) {
    return "/race_golias.png";
  }
  if (name.includes("orc")) {
    return "/race_orc.png";
  }
  if (name.includes("warforged")) {
    return "/race_warforged.png";
  }
  if (name.includes("centauro")) {
    return "/race_centauro.png";
  }
  if (name.includes("tabaxi")) {
    return "/race_tabaxi.png";
  }
  if (name.includes("aasimar")) {
    return "/race_aasimar.png";
  }
  if (name.includes("tortle")) {
    return "/race_tortle.png";
  }
  if (name.includes("gnomo")) {
    return "/race_gnomo.png";
  }
  if (name.includes("aarakocra")) {
    return "/race_aarakocra.png";
  }
  if (name.includes("changeling")) {
    return "/race_changeling.png";
  }
  if (name.includes("goblin")) {
    return "/race_goblin.png";
  }
  if (name.includes("kobold")) {
    return "/race_kobold.png";
  }
  if (name.includes("minotauro")) {
    return "/race_minotauro.png";
  }
  if (name.includes("bugbear")) {
    return "/race_bugbear.png";
  }
  if (name.includes("tritão") || name.includes("tritao")) {
    return "/race_tritao.png";
  }
  if (name.includes("leonin")) {
    return "/race_leonin.png";
  }
  if (name.includes("fada")) {
    return "/race_fada.png";
  }
  if (name.includes("kenku")) {
    return "/race_kenku.png";
  }
  if (name.includes("owlin")) {
    return "/race_owlin.png";
  }
  if (name.includes("shifter")) {
    return "/race_shifter.png";
  }
  if (name.includes("kalashtar")) {
    return "/race_kalashtar.png";
  }
  if (name.includes("dhampir")) {
    return "/race_dhampir.png";
  }
  if (name.includes("reborn")) {
    return "/race_reborn.png";
  }
  if (name.includes("githyanki")) {
    return "/race_githyanki.png";
  }
  if (name.includes("githzerai")) {
    return "/race_githzerai.png";
  }
  if (name.includes("plasmoide") || name.includes("plasmoid")) {
    return "/race_plasmoid.png";
  }
  if (name.includes("thri-kreen")) {
    return "/race_thri_kreen.png";
  }
  if (name.includes("genasi")) {
    return "/race_genasi.png";
  }
  if (name.includes("firbolg")) {
    return "/race_firbolg.png";
  }
  if (name.includes("hobgoblin")) {
    return "/race_hobgoblin.png";
  }
  if (name.includes("loxodon")) {
    return "/race_loxodon.png";
  }
  if (name.includes("yuan-ti")) {
    return "/race_yuan_ti.png";
  }
  if (name.includes("harengon")) {
    return "/race_harengon.png";
  }
  if (name.includes("sátiro") || name.includes("satyr")) {
    return "/race_satiro.png";
  }
  
  return "/portrait-placeholder.png";
};

export const PRESET_PORTRAITS = [
  { name: "Humano", url: "/race_humano_1782020866277.png" },
  { name: "Elfo", url: "/race_elfo_1782020855302.png" },
  { name: "Anão", url: "/race_anao.png" },
  { name: "Halfling", url: "/race_halfling.png" },
  { name: "Tiefling", url: "/race_tiefling_1782020883867.png" },
  { name: "Draconato", url: "/race_draconato.png" },
  { name: "Orc", url: "/race_orc.png" },
  { name: "Golias", url: "/race_golias.png" },
  { name: "Warforged", url: "/race_warforged.png" },
  { name: "Centauro", url: "/race_centauro.png" },
  { name: "Tabaxi", url: "/race_tabaxi.png" },
  { name: "Aasimar", url: "/race_aasimar.png" },
  { name: "Gnomo", url: "/race_gnomo.png" },
  { name: "Tortle", url: "/race_tortle.png" },
  { name: "Mago", url: "/class_mago_1782020893172.png" },
];

export const getClassPresetImage = (className: string): string => {
  if (!className) return "/portrait-placeholder.png";
  const name = className.toLowerCase();
  
  // Specific classes to their respective illustrations
  if (name.includes("mago") || name.includes("wizard")) {
    return "/class_mago_1782020893172.png";
  }
  if (name.includes("barbaro") || name.includes("bárbaro") || name.includes("barbarian")) {
    return "/class_barbaro.png";
  }
  if (name.includes("bardo") || name.includes("bard")) {
    return "/class_bardo.png";
  }
  if (name.includes("clerigo") || name.includes("clérigo") || name.includes("cleric")) {
    return "/class_clerigo.png";
  }
  if (name.includes("druida") || name.includes("druid")) {
    return "/class_druida.png";
  }
  if (name.includes("guerreiro") || name.includes("fighter")) {
    return "/class_guerreiro.png";
  }
  if (name.includes("ladino") || name.includes("rogue")) {
    return "/class_ladino.png";
  }
  if (name.includes("monge") || name.includes("monk")) {
    return "/class_monge.png";
  }
  if (name.includes("paladino") || name.includes("paladin")) {
    return "/class_paladino.png";
  }
  if (name.includes("patrulheiro") || name.includes("ranger")) {
    return "/class_patrulheiro.png";
  }
  if (name.includes("feiticeiro") || name.includes("sorcerer")) {
    return "/class_feiticeiro.png";
  }
  if (name.includes("bruxo") || name.includes("warlock")) {
    return "/class_bruxo.png";
  }
  if (name.includes("artifice") || name.includes("artífice") || name.includes("artificer")) {
    return "/class_artifice.png";
  }
  
  return "/portrait-placeholder.png";
};
