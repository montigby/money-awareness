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
  motivations: { security: 50, freedom: 50, achievement: 50, experience: 50 },
  scenarioSignals: {
    security: 50, freedom: 50, achievement: 50, experience: 50, comparison: 50, building: 50,
  },
  objectiveFinancialResilience: null,
  securityGap: null,
  answers: {} as Record<string, number | string | null>,
};

const has = (result: ReturnType<typeof detectPatterns>, code: string) =>
  result.some((p) => p.code === code);

describe("pattern detection boundaries", () => {
  it("P01 triggers at the exact freedom/control thresholds", () => {
    expect(has(detectPatterns({ ...base, dimensions: { ...base.dimensions, freedom: 75, control: 75 } }), "P01")).toBe(true);
    expect(has(detectPatterns({ ...base, dimensions: { ...base.dimensions, freedom: 74.99, control: 90 } }), "P01")).toBe(false);
  });

  it("P08 requires both very low enoughness and no finish line", () => {
    expect(has(detectPatterns({ ...base, dimensions: { ...base.dimensions, enoughness: 30 }, answers: { SCN7: "E" } }), "P08")).toBe(true);
    expect(has(detectPatterns({ ...base, dimensions: { ...base.dimensions, enoughness: 30.01 }, answers: { SCN7: "E" } }), "P08")).toBe(false);
    expect(has(detectPatterns({ ...base, dimensions: { ...base.dimensions, enoughness: 20 }, answers: { SCN7: "B" } }), "P08")).toBe(false);
  });

  it("P15 requires low enoughness, a moving finish line, and discomfort with the guarantee", () => {
    expect(has(detectPatterns({
      ...base,
      dimensions: { ...base.dimensions, enoughness: 40 },
      answers: { SCN7: "C", SCN2: "D" },
    }), "P15")).toBe(true);
    expect(has(detectPatterns({
      ...base,
      dimensions: { ...base.dimensions, enoughness: 40.01 },
      answers: { SCN7: "C", SCN2: "D" },
    }), "P15")).toBe(false);
  });

  it("P03 requires a security gap of at least 25", () => {
    expect(has(detectPatterns({
      ...base,
      dimensions: { ...base.dimensions, security: 45 },
      objectiveFinancialResilience: 70,
      securityGap: 25,
    }), "P03")).toBe(true);
    expect(has(detectPatterns({
      ...base,
      dimensions: { ...base.dimensions, security: 45.01 },
      objectiveFinancialResilience: 70,
      securityGap: 24.99,
    }), "P03")).toBe(false);
  });
});
