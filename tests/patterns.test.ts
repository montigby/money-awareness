import { describe, expect, it } from "vitest";
import { detectPatterns } from "@/lib/assessment/patterns";

const base = {
  dimensions: {
    security: 50,
    enoughness: 50,
    identityAttachment: 50,
    control: 50,
    freedom: 50,
    presence: 50,
  },
  attention: { chosen: 50, compelled: 50 },
  motivations: {
    security: 50,
    freedom: 50,
    achievement: 50,
    experience: 50,
  },
  scenarioSignals: {
    security: 50,
    freedom: 50,
    achievement: 50,
    experience: 50,
    comparison: 50,
    building: 50,
  },
  objectiveFinancialResilience: null,
  securityGap: null,
};

describe("pattern detection", () => {
  it("detects the Freedom-Control Paradox", () => {
    const result = detectPatterns({
      ...base,
      dimensions: {
        ...base.dimensions,
        freedom: 91,
        control: 84,
      },
    });
    expect(result.some((p) => p.code === "P01")).toBe(true);
  });

  it("does not detect P01 below threshold", () => {
    const result = detectPatterns({
      ...base,
      dimensions: {
        ...base.dimensions,
        freedom: 74.9,
        control: 90,
      },
    });
    expect(result.some((p) => p.code === "P01")).toBe(false);
  });
});
