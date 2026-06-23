import { getAbilityModifier } from "./abilityScores";
import { getProficiencyBonus } from "./proficiency";
import { calculateSkillBonus } from "./skills";
import { calculateSavingThrowBonus } from "./savingThrows";
import { calculateInitiative, calculateArmorClass, calculateUnarmedStrikeDamage } from "./combat";

export const fighterLvl1 = {
  name: "Guerreiro Nível 1",
  char_class: "Guerreiro",
  level: 1,
  stats: {
    FOR: 16,
    DES: 12,
    CON: 14,
    INT: 10,
    SAB: 12,
    CAR: 8
  },
  skills: ["Atletismo"],
  saving_throws: ["FOR", "CON"],
  inventory: [
    { name: "Cota de malha", type: "Armadura", bonus: 14, equipped: true },
    { name: "Escudo", type: "Escudo", bonus: 2, equipped: true }
  ]
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const CLASS_SAVING_THROWS: Record<string, string[]> = {
  name: "Ladino Nível 1 com Expertise",
  char_class: "Ladino",
  level: 1,
  stats: {
    FOR: 10,
    DES: 16,
    CON: 12,
    INT: 14,
    SAB: 12,
    CAR: 12
  },
  skills: ["Furtividade", "Acrobacia"],
  expertise: ["Furtividade"],
  saving_throws: ["DES", "INT"],
  inventory: []
};

export const rogueLvl1Expertise = {
  name: "Ladino Nível 1 com Expertise",
  char_class: "Ladino",
  level: 1,
  stats: {
    FOR: 10,
    DES: 16,
    CON: 12,
    INT: 14,
    SAB: 12,
    CAR: 12
  },
  skills: ["Furtividade", "Acrobacia"],
  expertise: ["Furtividade"],
  saving_throws: ["DES", "INT"],
  inventory: []
};

export const wizardLvl1 = {
  name: "Mago Nível 1",
  char_class: "Mago",
  level: 1,
  stats: {
    FOR: 8,
    DES: 14,
    CON: 12,
    INT: 16,
    SAB: 13,
    CAR: 10
  },
  skills: ["Arcanismo", "Investigação"],
  saving_throws: ["INT", "SAB"],
  inventory: []
};

export const fighterLvl5 = {
  name: "Guerreiro Nível 5",
  char_class: "Guerreiro",
  level: 5,
  stats: {
    FOR: 18,
    DES: 12,
    CON: 14,
    INT: 10,
    SAB: 12,
    CAR: 8
  },
  skills: ["Atletismo"],
  saving_throws: ["FOR", "CON"],
  inventory: [
    { name: "Cota de malha", type: "Armadura", bonus: 14, equipped: true }
  ]
};

export function runFixturesTests() {
  const results: string[] = [];
  let failed = false;

  function assert(name: string, actual: any, expected: any) {
    if (actual === expected) {
      results.push(`✅ PASS: ${name} (Expected: ${expected}, Actual: ${actual})`);
    } else {
      results.push(`❌ FAIL: ${name} (Expected: ${expected}, Actual: ${actual})`);
      failed = true;
    }
  }

  // 1. Ability Score Modifier tests
  assert("FOR Mod 16", getAbilityModifier(16), 3);
  assert("DES Mod 12", getAbilityModifier(12), 1);
  assert("FOR Mod 8", getAbilityModifier(8), -1);

  // 2. Proficiency Bonus tests
  assert("Prof Level 1", getProficiencyBonus(1), 2);
  assert("Prof Level 5", getProficiencyBonus(5), 3);
  assert("Prof Level 10", getProficiencyBonus(10), 4);
  assert("Prof Level 15", getProficiencyBonus(15), 5);
  assert("Prof Level 20", getProficiencyBonus(20), 6);

  // 3. Warrior Level 1 tests
  assert("Guerreiro Lvl 1 - Bonus Atletismo", calculateSkillBonus(fighterLvl1, "Atletismo").total, 5); // 3 (FOR) + 2 (Prof)
  assert("Guerreiro Lvl 1 - TR FOR", calculateSavingThrowBonus(fighterLvl1, "FOR").total, 5); // 3 (FOR) + 2 (Prof)
  assert("Guerreiro Lvl 1 - Initiative", calculateInitiative(fighterLvl1), 1); // 1 (DES)
  assert("Guerreiro Lvl 1 - AC", calculateArmorClass(fighterLvl1, fighterLvl1.inventory), 17); // Chain mail (14) + Dex (1) + Shield (2)
  assert("Guerreiro Lvl 1 - Unarmed Strike Damage", calculateUnarmedStrikeDamage(fighterLvl1).fixed, 4); // 1 + 3 (FOR)

  // 4. Rogue Level 1 Expertise tests
  assert("Ladino Lvl 1 - Furtividade Bonus (Expertise)", calculateSkillBonus(rogueLvl1Expertise, "Furtividade").total, 7); // 3 (DES) + 2 (Prof) + 2 (Expertise)
  assert("Ladino Lvl 1 - Acrobacia Bonus (Proficient)", calculateSkillBonus(rogueLvl1Expertise, "Acrobacia").total, 5); // 3 (DES) + 2 (Prof)

  // 5. Wizard Level 1 tests
  assert("Mago Lvl 1 - TR INT", calculateSavingThrowBonus(wizardLvl1, "INT").total, 5); // 3 (INT) + 2 (Prof)
  assert("Mago Lvl 1 - Unarmed Strike Damage", calculateUnarmedStrikeDamage(wizardLvl1).fixed, 0); // 1 - 1 (FOR)

  // 6. Warrior Level 5 tests
  assert("Guerreiro Lvl 5 - Bonus Atletismo", calculateSkillBonus(fighterLvl5, "Atletismo").total, 7); // 4 (FOR) + 3 (Prof)
  assert("Guerreiro Lvl 5 - TR CON", calculateSavingThrowBonus(fighterLvl5, "CON").total, 5); // 2 (CON) + 3 (Prof)
  assert("Guerreiro Lvl 5 - AC (Sem escudo)", calculateArmorClass(fighterLvl5, fighterLvl5.inventory), 15); // Chain mail (14) + Dex (1)

  return { results, failed };
}
