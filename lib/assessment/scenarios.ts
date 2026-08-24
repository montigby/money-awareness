import type { AssessmentAnswers } from "@/types/assessment";

export type ScenarioSignals = {
  security: number;
  freedom: number;
  achievement: number;
  experience: number;
  comparison: number;
  building: number;
};

const empty = (): ScenarioSignals => ({
  security: 50,
  freedom: 50,
  achievement: 50,
  experience: 50,
  comparison: 50,
  building: 50,
});

export function calculateScenarioSignals(
  answers: AssessmentAnswers
): ScenarioSignals {
  const s = empty();
  const bump = (key: keyof ScenarioSignals, value: number) => {
    s[key] = Math.max(0, Math.min(100, s[key] + value));
  };

  switch (answers.SCN1) {
    case "B": bump("security", 35); break;
    case "C": bump("experience", 35); break;
    case "D": bump("achievement", 35); bump("building", 25); break;
    case "E": bump("freedom", 20); bump("security", 15); break;
    case "F": bump("security", 25); break;
  }

  switch (answers.SCN4) {
    case "B": bump("comparison", 15); break;
    case "C": bump("comparison", 25); bump("achievement", 15); break;
    case "D": bump("comparison", 40); bump("achievement", 20); break;
    case "E": bump("comparison", -25); break;
  }

  switch (answers.SCN5) {
    case "A": bump("building", 30); bump("achievement", 15); break;
    case "C": bump("experience", 20); break;
    case "D": bump("experience", 30); break;
    case "E": bump("experience", 20); break;
    case "F": bump("achievement", 20); bump("building", 20); break;
  }

  switch (answers.SCN6) {
    case "C": bump("experience", 30); break;
    case "D": bump("freedom", 35); break;
    case "E": bump("achievement", 30); bump("building", 25); break;
    case "F": bump("security", 30); break;
  }

  if (answers.SCN8 === "B") bump("freedom", 25);
  if (answers.SCN8B === "B") bump("freedom", 30);

  return s;
}
