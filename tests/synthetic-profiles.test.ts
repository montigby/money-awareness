import { describe, expect, it } from "vitest";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { SYNTHETIC_PROFILES } from "@/tests/fixtures/profiles";

describe("synthetic assessment profiles", () => {
  for (const profile of SYNTHETIC_PROFILES) {
    it(`${profile.name} produces the expected profile shape`, () => {
      const result = scoreAssessment(profile.answers);

      for (const [dimension, range] of Object.entries(
        profile.expected.dimensionRanges ?? {}
      )) {
        const value = result.dimensions[
          dimension as keyof typeof result.dimensions
        ];
        expect(value).toBeGreaterThanOrEqual(range[0]);
        expect(value).toBeLessThanOrEqual(range[1]);
      }

      if (profile.expected.primaryArchetypes?.length) {
        expect(result.archetypes.primary).not.toBeNull();
        expect(profile.expected.primaryArchetypes).toContain(
          result.archetypes.primary?.name
        );
      }

      const patternCodes = result.patterns.map((p) => p.code);

      for (const code of profile.expected.requiredPatterns ?? []) {
        expect(patternCodes, `${profile.name} should include ${code}`).toContain(code);
      }

      for (const code of profile.expected.forbiddenPatterns ?? []) {
        expect(patternCodes, `${profile.name} should not include ${code}`).not.toContain(code);
      }
    });
  }
});
