export interface RollBreakdownInput {
  d20: number;
  abilityMod?: number;
  proficiencyBonus?: number;
  expertiseBonus?: number;
  extraBonus?: number;
}

export interface RollBreakdownOutput {
  total: number;
  breakdown: {
    attr: number;
    prof: number;
    expertise?: number;
    extra: number;
  };
}

export function buildRollBreakdown({
  d20,
  abilityMod = 0,
  proficiencyBonus = 0,
  expertiseBonus = 0,
  extraBonus = 0,
}: RollBreakdownInput): RollBreakdownOutput {
  const total = d20 + abilityMod + proficiencyBonus + expertiseBonus + extraBonus;
  return {
    total,
    breakdown: {
      attr: abilityMod,
      prof: proficiencyBonus,
      ...(expertiseBonus > 0 ? { expertise: expertiseBonus } : {}),
      extra: extraBonus,
    },
  };
}
