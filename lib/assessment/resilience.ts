import type { AssessmentAnswers } from "@/types/assessment";

const NET_WORTH: Record<string, number> = {
  negative: 0,
  "0-100k": 20,
  "100-500k": 40,
  "500k-1m": 55,
  "1m-3m": 70,
  "3m-10m": 85,
  "10m+": 100,
};

const RUNWAY: Record<string, number> = {
  "<1m": 0,
  "1-3m": 20,
  "3-6m": 40,
  "6-12m": 60,
  "1-3y": 80,
  "3y+": 100,
};

export function calculateFinancialResilience(
  answers: AssessmentAnswers
): number | null {
  const netWorth = answers.FIN2;
  const runway = answers.FIN3;
  const burden = answers.FIN4;

  if (
    typeof netWorth !== "string" ||
    typeof runway !== "string" ||
    typeof burden !== "number"
  ) {
    return null;
  }

  const nw = NET_WORTH[netWorth];
  const rw = RUNWAY[runway];

  if (nw === undefined || rw === undefined || burden < 0 || burden > 10) {
    return null;
  }

  const obligationScore = (10 - burden) * 10;

  return rw * 0.5 + nw * 0.3 + obligationScore * 0.2;
}
