import { describe, expect, it } from "vitest";
import type { AssessmentResult } from "@/types/assessment";
import {
  contradictionCopy,
  dimensionInterpretation,
  patternCopy,
  resultHeadline,
} from "@/lib/results/copy";

const baseResult: AssessmentResult = {
  scoringVersion: "1.0.0",
  dimensions: {
    security: 50,
    enoughness: 50,
    identityAttachment: 50,
    control: 50,
    freedom: 50,
    presence: 50,
  },
  attention: { chosen: 50, compelled: 50 },
  motivations: { security: 50, freedom: 50, achievement: 50, experience: 50 },
  objectiveFinancialResilience: null,
  securityGap: null,
  archetypes: { primary: null, secondary: null },
  patterns: [],
  contradictions: [],
};

describe("deterministic results copy", () => {
  it("builds a combined archetype headline", () => {
    const result: AssessmentResult = {
      ...baseResult,
      archetypes: {
        primary: { name: "Builder", confidence: 88 },
        secondary: { name: "Freedom Seeker", confidence: 82 },
      },
    };
    expect(resultHeadline(result)).toBe("Builder × Freedom Seeker");
  });

  it("falls back to a generic profile headline", () => {
    expect(resultHeadline(baseResult)).toBe("Your Money Profile");
  });

  it("changes dimension interpretation across the midpoint", () => {
    const low = dimensionInterpretation("security", 25);
    const high = dimensionInterpretation("security", 80);
    expect(low.interpretation).not.toBe(high.interpretation);
    expect(low.label).toBe("Internal Security");
  });

  it("maps known patterns and contradictions to explanatory copy", () => {
    expect(patternCopy({ code: "P01", name: "Freedom-Control Paradox", strength: 90 }).title)
      .toBe("Freedom-Control Paradox");
    expect(contradictionCopy({ code: "C01", name: "Freedom vs Time Tradeoff", strength: 90, confidence: "high" }).title)
      .toBe("Freedom vs. Time Tradeoff");
  });
});
