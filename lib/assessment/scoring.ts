import { QUESTIONS } from "./questions";
import type {
  AssessmentAnswers,
  AssessmentResult,
  DimensionCode,
  DimensionScores,
} from "@/types/assessment";
import { calculateAttention } from "./attention";
import { normalizeLikert, scoreLikert } from "./likert";
import { calculateScenarioSignals } from "./scenarios";
import { calculateMotivations } from "./motivations";
import { calculateArchetypes } from "./archetypes";
import { detectPatterns } from "./patterns";
import { detectContradictions } from "./contradictions";
import { calculateFinancialResilience } from "./resilience";

export const SCORING_VERSION = "1.0.0";

export { normalizeLikert, scoreLikert } from "./likert";

export function calculateDimensions(answers: AssessmentAnswers): DimensionScores {
  const dimensions: DimensionCode[] = [
    "security",
    "enoughness",
    "identityAttachment",
    "control",
    "freedom",
    "presence",
  ];

  const out = {} as DimensionScores;

  for (const dimension of dimensions) {
    const items = QUESTIONS.filter(
      (q) => q.type === "likert" && q.dimension === dimension
    );

    const scores = items.map((q) => {
      const raw = answers[q.code];
      if (typeof raw !== "number") {
        throw new Error(`Missing numeric answer for ${q.code}`);
      }
      return scoreLikert(raw, q.reverse ?? false);
    });

    out[dimension] =
      scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }

  return out;
}

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const dimensions = calculateDimensions(answers);
  const attention = calculateAttention(answers);
  const scenarioSignals = calculateScenarioSignals(answers);
  const motivations = calculateMotivations({
    dimensions,
    scenarioSignals,
  });
  const objectiveFinancialResilience = calculateFinancialResilience(answers);
  const securityGap =
    objectiveFinancialResilience === null
      ? null
      : objectiveFinancialResilience - dimensions.security;

  const archetypes = calculateArchetypes({
    dimensions,
    attention,
    motivations,
    scenarioSignals,
  });

  const patterns = detectPatterns({
    dimensions,
    attention,
    motivations,
    scenarioSignals,
    objectiveFinancialResilience,
    securityGap,
  });

  const contradictions = detectContradictions({
    dimensions,
    attention,
    answers,
  });

  return {
    scoringVersion: SCORING_VERSION,
    dimensions,
    attention,
    motivations,
    objectiveFinancialResilience,
    securityGap,
    archetypes,
    patterns,
    contradictions,
  };
}
