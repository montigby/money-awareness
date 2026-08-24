import type { AssessmentResult } from "@/types/assessment";
import type { GeneratedReport } from "./schema";

export function generateMockReport(result: AssessmentResult): GeneratedReport {
  const primary = result.archetypes.primary?.name ?? "Individual Profile";
  const secondary = result.archetypes.secondary?.name ?? "No secondary archetype";

  return {
    headline: "Your money patterns reveal both strengths and tradeoffs.",
    profile_summary:
      `Your current profile is ${primary}${result.archetypes.secondary ? ` × ${secondary}` : ""}. This is placeholder copy until production AI is enabled.`,
    money_means: {
      primary: "To be determined",
      secondary: "To be determined",
      interpretation: "This section is intentionally mocked during deterministic development.",
    },
    greatest_strength: {
      title: "A strength worth examining",
      body: "Production narrative will synthesize the deterministic results without changing them.",
    },
    primary_tension: {
      title: "A tension worth noticing",
      body: result.patterns[0]?.name ?? "No high-confidence pattern was triggered.",
    },
    patterns: result.patterns.slice(0, 3).map((p) => ({
      name: p.name,
      body: `Detected deterministically with strength ${Math.round(p.strength)}.`,
    })),
    financial_reality: {
      show: result.securityGap !== null && Math.abs(result.securityGap) >= 25,
      headline: "Financial reality gap",
      body: result.securityGap === null ? "" : `Deterministic gap: ${Math.round(result.securityGap)}.`,
    },
    stress_response: {
      title: "Under financial stress",
      body: "Placeholder narrative.",
    },
    contradiction: {
      show: result.contradictions.length > 0,
      title: result.contradictions[0]?.name ?? "",
      body: "Placeholder narrative.",
    },
    reflection_response: {
      show: false,
      body: "",
    },
    question_to_consider:
      "What would become possible if money no longer had to solve every problem it currently represents?",
  };
}
