/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAbilityModifier } from "./abilityScores";
import { getProficiencyBonus } from "./proficiency";

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

export interface SavingThrowBonusResult {
  total: number;
  baseMod: number;
  isProficient: boolean;
  profBonus: number;
  extraBonus: number;
}

export function calculateSavingThrowBonus(character: any, abilityKey: string, extraBonus = 0): SavingThrowBonusResult {
  const stats = character?.stats || {};
  const score = stats[abilityKey] !== undefined 
    ? stats[abilityKey] 
    : (stats[abilityKey.toLowerCase()] !== undefined ? stats[abilityKey.toLowerCase()] : 10);
    
  const baseMod = getAbilityModifier(score);
  
  const charClass = character?.char_class || character?.class_name || "Guerreiro";
  const classSaves = CLASS_SAVING_THROWS[charClass] || [];
  const charSaves = character?.stats?.saving_throws || character?.saving_throws || classSaves;
  
  const isProficient = charSaves.some((s: string) => s.toLowerCase() === abilityKey.toLowerCase());
  const profBonus = getProficiencyBonus(character?.level || 1);
  
  return {
    total: baseMod + (isProficient ? profBonus : 0) + extraBonus,
    baseMod,
    isProficient,
    profBonus,
    extraBonus
  };
}
