import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/assessment/questions";
import { validateAssessment } from "@/lib/assessment/scoring";
import type { AssessmentAnswers } from "@/types/assessment";

function validAnswers(): AssessmentAnswers {
  const answers: AssessmentAnswers = {};
  for (const q of QUESTIONS.filter((item) => item.required)) {
    answers[q.code] = q.type === "likert" ? 4 : q.options?.[0]?.id ?? null;
  }
  return answers;
}

describe("assessment validation", () => {
  it("accepts a complete set of required answers", () => {
    expect(validateAssessment(validAnswers())).toEqual([]);
  });

  it("reports a missing required answer", () => {
    const answers = validAnswers();
    delete answers.SEC1;
    expect(validateAssessment(answers)).toContain("Missing required answer: SEC1");
  });

  it("rejects an out-of-range Likert value", () => {
    const answers = validAnswers();
    answers.SEC1 = 8;
    expect(validateAssessment(answers)).toContain("Invalid Likert answer: SEC1");
  });

  it("rejects an invalid scenario choice", () => {
    const answers = validAnswers();
    answers.SCN1 = "Z";
    expect(validateAssessment(answers)).toContain("Invalid choice answer: SCN1");
  });

  it("does not require optional financial context or reflection", () => {
    const answers = validAnswers();
    expect(validateAssessment(answers)).toEqual([]);
  });
});
