/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAbilityModifier } from "./abilityScores";
import { getProficiencyBonus } from "./proficiency";

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

export interface SkillBonusResult {
  total: number;
  baseMod: number;
  isProficient: boolean;
  hasExpertise: boolean;
  profBonus: number;
  extraBonus: number;
}

export function calculateSkillBonus(character: any, skillKey: string, extraBonus = 0): SkillBonusResult {
  const attrKey = SKILL_ATTRIBUTE_MAP[skillKey] || "FOR";
  const stats = character?.stats || {};
  
  const score = stats[attrKey] !== undefined 
    ? stats[attrKey] 
    : (stats[attrKey.toLowerCase()] !== undefined ? stats[attrKey.toLowerCase()] : 10);
    
  const baseMod = getAbilityModifier(score);
  
  const charSkills: string[] = character?.stats?.proficiencies || character?.skills || character?.proficient_skills || [];
  const expertiseSkills: string[] = character?.stats?.expertise || character?.stats?.expertises || character?.expertise || character?.expertises || [];
  
  const isProficient = charSkills.some(s => s.toLowerCase() === skillKey.toLowerCase());
  const hasExpertise = expertiseSkills.some(s => s.toLowerCase() === skillKey.toLowerCase());
  const profBonus = getProficiencyBonus(character?.level || 1);
  
  let mod = baseMod + extraBonus;
  if (hasExpertise) {
    mod += profBonus * 2;
  } else if (isProficient) {
    mod += profBonus;
  }
  
  return {
    total: mod,
    baseMod,
    isProficient,
    hasExpertise,
    profBonus,
    extraBonus
  };
}
