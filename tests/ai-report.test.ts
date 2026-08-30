import { describe, expect, it } from "vitest";
import type { AssessmentAnswers, AssessmentResult } from "@/types/assessment";
import { buildReportInput } from "@/lib/ai/reportInput";
import { deterministicFallbackReport } from "@/lib/ai/generateReport";
import { ReportSchema } from "@/lib/ai/schema";

const result: AssessmentResult = {
  scoringVersion: "1.0.0",
  dimensions: {
    security: 30,
    enoughness: 25,
    identityAttachment: 80,
    control: 85,
    freedom: 90,
    presence: 30,
  },
  attention: { chosen: 80, compelled: 75 },
  motivations: { security: 70, freedom: 90, achievement: 88, experience: 32 },
  objectiveFinancialResilience: 85,
  securityGap: 55,
  archetypes: {
    primary: { name: "Builder", confidence: 88 },
    secondary: { name: "Freedom Seeker", confidence: 84 },
  },
  patterns: [
    { code: "P01", name: "Freedom-Control Paradox", strength: 88 },
    { code: "P02", name: "Achievement Treadmill", strength: 82 },
  ],
  contradictions: [
    { code: "C01", name: "Freedom vs Time Tradeoff", strength: 90, confidence: "high" },
  ],
};

const answers: AssessmentAnswers = {
  SCN1: "D",
  SCN7: "E",
  SCN8: "A",
  SCN8B: "A",
  REF1: "I would work less and spend more time with people I care about.",
  FIN1: "500k-1m",
};

describe("Stage 6 report layer", () => {
  it("builds a compact input without financial range fields", () => {
    const input = buildReportInput(result, answers);
    expect(input.scenario_answers.SCN1).toBe("D");
    expect(input.reflection).toContain("work less");
    expect((input as unknown as Record<string, unknown>).FIN1).toBeUndefined();
    expect(JSON.stringify(input)).not.toContain("500k-1m");
  });

  it("creates a schema-valid deterministic fallback", () => {
    const fallback = deterministicFallbackReport(result, answers);
    expect(ReportSchema.safeParse(fallback).success).toBe(true);
    expect(fallback.patterns.length).toBeLessThanOrEqual(3);
    expect(fallback.contradiction.show).toBe(true);
    expect(fallback.financial_reality.show).toBe(true);
  });

  it("does not expose the participant's reflection verbatim in fallback synthesis", () => {
    const fallback = deterministicFallbackReport(result, answers);
    expect(JSON.stringify(fallback)).not.toContain(answers.REF1 as string);
  });
});
