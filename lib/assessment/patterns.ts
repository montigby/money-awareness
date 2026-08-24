import type {
  AssessmentAnswers,
  AttentionScores,
  DimensionScores,
  MotivationScores,
  PatternResult,
} from "@/types/assessment";
import type { ScenarioSignals } from "./scenarios";

type Inputs = {
  dimensions: DimensionScores;
  attention: AttentionScores;
  motivations: MotivationScores;
  scenarioSignals: ScenarioSignals;
  objectiveFinancialResilience: number | null;
  securityGap: number | null;
  answers: AssessmentAnswers;
};

const avg = (...v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

export function detectPatterns(input: Inputs): PatternResult[] {
  const { dimensions: d, attention: a, motivations: m, answers } = input;
  const out: PatternResult[] = [];
  const add = (code: string, name: string, when: boolean, strength: number) => {
    if (when) out.push({ code, name, strength: Math.max(0, Math.min(100, strength)) });
  };

  add("P01", "Freedom-Control Paradox",
    d.freedom >= 75 && d.control >= 75,
    avg(d.freedom, d.control));

  add("P02", "Achievement Treadmill",
    m.achievement >= 70 && d.enoughness <= 40,
    avg(m.achievement, 100 - d.enoughness));

  add("P03", "Security Gap",
    input.objectiveFinancialResilience !== null &&
    input.objectiveFinancialResilience >= 70 && d.security <= 45 &&
    (input.securityGap ?? 0) >= 25,
    input.securityGap ?? 0);

  add("P04", "Fragile Confidence",
    input.objectiveFinancialResilience !== null && d.security >= 70 &&
    input.objectiveFinancialResilience <= 40 &&
    d.security - input.objectiveFinancialResilience >= 25,
    d.security - (input.objectiveFinancialResilience ?? d.security));

  add("P05", "Deferred Life",
    d.presence <= 35 && d.enoughness <= 45,
    avg(100 - d.presence, 100 - d.enoughness));

  add("P06", "Conditional Freedom",
    d.freedom >= 75 && d.presence <= 40,
    avg(d.freedom, 100 - d.presence));

  add("P07", "Scorekeeper",
    d.identityAttachment >= 70 && input.scenarioSignals.comparison >= 65,
    avg(d.identityAttachment, input.scenarioSignals.comparison));

  add("P08", "Unreachable Number",
    d.enoughness <= 30 && answers.SCN7 === "E",
    avg(100 - d.enoughness, 95));

  add("P09", "Earned Permission",
    d.presence <= 40 && d.control >= 70,
    avg(100 - d.presence, d.control));

  add("P10", "Money Without Status",
    d.identityAttachment <= 30 && (d.freedom >= 65 || d.presence >= 65),
    avg(100 - d.identityAttachment, Math.max(d.freedom, d.presence)));

  add("P11", "Financial Immersion",
    a.chosen >= 70 && a.compelled >= 70,
    avg(a.chosen, a.compelled));

  add("P12", "Financial Curiosity",
    a.chosen >= 70 && a.compelled <= 40,
    avg(a.chosen, 100 - a.compelled));

  add("P13", "Financial Preoccupation",
    a.compelled >= 70 && a.chosen <= 40,
    avg(a.compelled, 100 - a.chosen));

  add("P14", "Financial Detachment",
    a.chosen <= 35 && a.compelled <= 35,
    avg(100 - a.chosen, 100 - a.compelled));

  add("P15", "Goalpost Drift",
    d.enoughness <= 40 &&
    ["B", "C", "E"].includes(String(answers.SCN7)) &&
    ["D", "E"].includes(String(answers.SCN2)),
    avg(100 - d.enoughness, answers.SCN7 === "E" ? 95 : 80));

  out.sort((x, y) => y.strength - x.strength);
  return out.slice(0, 5);
}
