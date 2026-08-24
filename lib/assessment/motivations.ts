import type { DimensionScores, MotivationScores } from "@/types/assessment";
import type { ScenarioSignals } from "./scenarios";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function calculateMotivations({
  dimensions,
  scenarioSignals,
}: {
  dimensions: DimensionScores;
  scenarioSignals: ScenarioSignals;
}): MotivationScores {
  // V1 formulas are intentionally transparent and expected to be calibrated
  // after real testing. 70% psychometric / 30% scenario evidence.
  const securityPsych = 100 - dimensions.security;
  const achievementPsych =
    dimensions.identityAttachment * 0.55 +
    (100 - dimensions.enoughness) * 0.45;

  return {
    security: clamp(securityPsych * 0.7 + scenarioSignals.security * 0.3),
    freedom: clamp(dimensions.freedom * 0.7 + scenarioSignals.freedom * 0.3),
    achievement: clamp(
      achievementPsych * 0.7 + scenarioSignals.achievement * 0.3
    ),
    experience: clamp(
      dimensions.presence * 0.7 + scenarioSignals.experience * 0.3
    ),
  };
}
