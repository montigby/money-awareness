import type { AssessmentAnswers, AttentionScores } from "@/types/assessment";
import { scoreLikert } from "./likert";

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateAttention(
  answers: AssessmentAnswers
): AttentionScores {
  const get = (code: string) => {
    const value = answers[code];
    if (typeof value !== "number") throw new Error(`Missing ${code}`);
    return scoreLikert(value);
  };

  return {
    chosen: mean([get("ATT1"), get("ATT2")]),
    compelled: mean([get("ATT3"), get("ATT4")]),
  };
}
