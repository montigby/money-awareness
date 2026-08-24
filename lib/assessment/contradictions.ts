import type {
  AssessmentAnswers,
  AttentionScores,
  ContradictionResult,
  DimensionScores,
} from "@/types/assessment";

export function detectContradictions({
  dimensions: d,
  attention: a,
  answers,
}: {
  dimensions: DimensionScores;
  attention: AttentionScores;
  answers: AssessmentAnswers;
}): ContradictionResult[] {
  const out: ContradictionResult[] = [];

  if (d.freedom >= 75 && answers.SCN8 === "A") {
    out.push({
      code: "C01",
      name: "Freedom vs Time Tradeoff",
      strength: answers.SCN8B === "A" ? 90 : 75,
      confidence: answers.SCN8B === "A" ? "high" : "medium",
    });
  }

  if (
    d.enoughness >= 65 &&
    (answers.SCN7 === "C" || answers.SCN7 === "E") &&
    (answers.SCN2 === "D" || answers.SCN2 === "E")
  ) {
    out.push({
      code: "C02",
      name: "Enoughness vs Finish Line",
      strength: 80,
      confidence: "high",
    });
  }

  if (d.security >= 70 && answers.SCN3 === "A" && a.compelled >= 65) {
    out.push({
      code: "C03",
      name: "Security Inconsistency",
      strength: 65,
      confidence: "low",
    });
  }

  return out.sort((x, y) => y.strength - x.strength);
}
