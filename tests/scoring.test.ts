import { describe, expect, it } from "vitest";
import { normalizeLikert, scoreLikert } from "@/lib/assessment/scoring";

describe("Likert scoring", () => {
  it("maps 1 to 0", () => {
    expect(normalizeLikert(1)).toBe(0);
  });

  it("maps 7 to 100", () => {
    expect(normalizeLikert(7)).toBe(100);
  });

  it("reverse scores correctly", () => {
    expect(scoreLikert(1, true)).toBe(100);
    expect(scoreLikert(7, true)).toBe(0);
  });

  it("rejects invalid values", () => {
    expect(() => normalizeLikert(0)).toThrow();
    expect(() => normalizeLikert(8)).toThrow();
  });
});
