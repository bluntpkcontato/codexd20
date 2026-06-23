/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAbilityModifier } from "./abilityScores";

export function calculateInitiative(character: any): number {
  const stats = character?.stats || {};
  const score = stats.DES !== undefined 
    ? stats.DES 
    : (stats.des !== undefined ? stats.des : 10);
    
  const desMod = getAbilityModifier(score);
  
  const feats = character?.feats || character?.stats?.feats || [];
  const hasAlert = feats.includes("Alerta") || feats.includes("Alert");
  
  return desMod + (hasAlert ? 5 : 0);
}

export function calculateArmorClass(character: any, inventoryList?: any[]): number {
  if (!character) return 10;
  if (character.race?.includes("Tortle")) return 17;

  const stats = character.stats || {};
  const desScore = stats.DES !== undefined ? stats.DES : (stats.des !== undefined ? stats.des : 10);
  const desMod = getAbilityModifier(desScore);

  const inv = inventoryList || character.inventory || [];
  const equippedArmor = inv.find((item: any) => item.type === "Armadura" && item.equipped);
  const equippedShield = inv.find((item: any) => item.type === "Escudo" && item.equipped);

  let baseAC = 10 + desMod;

  if (equippedArmor) {
    const armorBase = Number(equippedArmor.bonus) || 10;
    const armorName = (equippedArmor.name || "").toLowerCase();
    const isHeavy = armorName.includes("placa") || armorName.includes("anéis") || armorName.includes("pesada") || armorBase >= 16;
    const isMedium = armorName.includes("cota de malha") || armorName.includes("gibão") || armorName.includes("média") || (armorBase >= 13 && armorBase <= 15);

    if (isHeavy) {
      baseAC = armorBase;
    } else if (isMedium) {
      baseAC = armorBase + Math.min(2, desMod);
    } else {
      baseAC = armorBase + desMod;
    }
  } else {
    const charClass = character.char_class || character.class_name || "";
    if (charClass === "Bárbaro") {
      const conScore = stats.CON !== undefined ? stats.CON : (stats.con !== undefined ? stats.con : 10);
      const conMod = getAbilityModifier(conScore);
      baseAC = 10 + desMod + conMod;
    } else if (charClass === "Monge") {
      const sabScore = stats.SAB !== undefined ? stats.SAB : (stats.sab !== undefined ? stats.sab : 10);
      const sabMod = getAbilityModifier(sabScore);
      baseAC = 10 + desMod + sabMod;
    }
  }

  if (equippedShield) {
    baseAC += Number(equippedShield.bonus) || 2;
  }

  return baseAC;
}

export function calculateUnarmedStrikeDamage(character: any): { dice: string; fixed: number; display: string; isMonk: boolean } {
  const stats = character?.stats || {};
  const strScore = stats.FOR !== undefined ? stats.FOR : (stats.for !== undefined ? stats.for : 10);
  const strMod = getAbilityModifier(strScore);
  
  const charClass = (character?.char_class || character?.class_name || "").trim().toLowerCase();
  const isMonk = charClass === "monge" || charClass === "monk";
  const level = character?.level || 1;
  
  if (!isMonk) {
    const fixed = 1 + strMod;
    return {
      dice: "",
      fixed,
      display: `${fixed}`,
      isMonk: false,
    };
  }
  
  // Monk martial arts
  const dexScore = stats.DES !== undefined ? stats.DES : (stats.des !== undefined ? stats.des : 10);
  const dexMod = getAbilityModifier(dexScore);
  const modifier = Math.max(strMod, dexMod);
  
  let die = 4;
  if (level >= 17) die = 10;
  else if (level >= 11) die = 8;
  else if (level >= 5) die = 6;
  
  return {
    dice: `1d${die}`,
    fixed: modifier,
    display: `1d${die}${modifier >= 0 ? `+${modifier}` : modifier}`,
    isMonk: true,
  };
}
