import type { AssessmentAnswers, AssessmentResult } from "@/types/assessment";

export type ReportInput = {
  dimensions: AssessmentResult["dimensions"];
  attention: AssessmentResult["attention"];
  motivations: AssessmentResult["motivations"];
  archetypes: AssessmentResult["archetypes"];
  patterns: AssessmentResult["patterns"];
  contradictions: AssessmentResult["contradictions"];
  financial_context: {
    objective_resilience: number | null;
    security_gap: number | null;
  };
  scenario_answers: Record<string, string | number>;
  reflection: string | null;
};

export function buildReportInput(
  result: AssessmentResult,
  answers: AssessmentAnswers
): ReportInput {
  const scenarioAnswers: Record<string, string | number> = {};
  for (const [code, value] of Object.entries(answers)) {
    if (code.startsWith("SCN") && (typeof value === "string" || typeof value === "number")) {
      scenarioAnswers[code] = value;
    }
  }

  const reflection = typeof answers.REF1 === "string" && answers.REF1.trim()
    ? answers.REF1.trim().slice(0, 1000)
    : null;

  return {
    dimensions: result.dimensions,
    attention: result.attention,
    motivations: result.motivations,
    archetypes: result.archetypes,
    patterns: result.patterns.slice(0, 5),
    contradictions: result.contradictions.filter((c) => c.confidence !== "low").slice(0, 3),
    financial_context: {
      objective_resilience: result.objectiveFinancialResilience,
      security_gap: result.securityGap,
    },
    scenario_answers: scenarioAnswers,
    reflection,
  };
}
