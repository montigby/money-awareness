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

export function validateAssessment(answers: AssessmentAnswers): string[] {
  const errors: string[] = [];

  for (const question of QUESTIONS.filter((q) => q.required)) {
    const answer = answers[question.code];
    if (answer === undefined || answer === null || answer === "") {
      errors.push(`Missing required answer: ${question.code}`);
      continue;
    }

    if (question.type === "likert") {
      if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 1 || answer > 7) {
        errors.push(`Invalid Likert answer: ${question.code}`);
      }
    }

    if (question.type === "single_choice") {
      const valid = question.options?.some((option) => option.id === answer) ?? false;
      if (!valid) errors.push(`Invalid choice answer: ${question.code}`);
    }
  }

  return errors;
}

export function calculateDimensions(answers: AssessmentAnswers): DimensionScores {
  const dimensions: DimensionCode[] = [
    "security", "enoughness", "identityAttachment", "control", "freedom", "presence",
  ];
  const out = {} as DimensionScores;

  for (const dimension of dimensions) {
    const items = QUESTIONS.filter((q) => q.type === "likert" && q.dimension === dimension);
    const scores = items.map((q) => {
      const raw = answers[q.code];
      if (typeof raw !== "number") throw new Error(`Missing numeric answer for ${q.code}`);
      return scoreLikert(raw, q.reverse ?? false);
    });
    out[dimension] = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }
  return out;
}

export function scoreAssessment(answers: AssessmentAnswers): AssessmentResult {
  const validationErrors = validateAssessment(answers);
  if (validationErrors.length > 0) {
    throw new Error(`Assessment is incomplete or invalid: ${validationErrors.join(", ")}`);
  }

  const dimensions = calculateDimensions(answers);
  const attention = calculateAttention(answers);
  const scenarioSignals = calculateScenarioSignals(answers);
  const motivations = calculateMotivations({ dimensions, scenarioSignals });
  const objectiveFinancialResilience = calculateFinancialResilience(answers);
  const securityGap = objectiveFinancialResilience === null
    ? null
    : objectiveFinancialResilience - dimensions.security;

  const archetypes = calculateArchetypes({ dimensions, attention, motivations, scenarioSignals });
  const patterns = detectPatterns({
    dimensions,
    attention,
    motivations,
    scenarioSignals,
    objectiveFinancialResilience,
    securityGap,
    answers,
  });
  const contradictions = detectContradictions({ dimensions, attention, answers });

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
