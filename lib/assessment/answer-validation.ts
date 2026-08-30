import { QUESTIONS } from "./questions";
import type { AnswerValue, Question } from "@/types/assessment";

export const FINANCIAL_OPTIONS: Record<string, { id: string; text: string }[]> = {
  FIN1: [
    { id: "<50k", text: "Under $50,000" },
    { id: "50-100k", text: "$50,000–$100,000" },
    { id: "100-200k", text: "$100,000–$200,000" },
    { id: "200-500k", text: "$200,000–$500,000" },
    { id: "500k-1m", text: "$500,000–$1 million" },
    { id: "1m+", text: "$1 million+" },
  ],
  FIN2: [
    { id: "negative", text: "Negative" },
    { id: "0-100k", text: "$0–$100,000" },
    { id: "100-500k", text: "$100,000–$500,000" },
    { id: "500k-1m", text: "$500,000–$1 million" },
    { id: "1m-3m", text: "$1–$3 million" },
    { id: "3m-10m", text: "$3–$10 million" },
    { id: "10m+", text: "$10 million+" },
  ],
  FIN3: [
    { id: "<1m", text: "Less than 1 month" },
    { id: "1-3m", text: "1–3 months" },
    { id: "3-6m", text: "3–6 months" },
    { id: "6-12m", text: "6–12 months" },
    { id: "1-3y", text: "1–3 years" },
    { id: "3y+", text: "3+ years" },
  ],
};

export function findQuestion(code: string): Question | undefined {
  return QUESTIONS.find((question) => question.code === code);
}

export function validateAnswer(question: Question, value: unknown): value is AnswerValue {
  if (value === null || value === "") return question.required === false;

  if (question.type === "likert") {
    return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 7;
  }

  if (question.type === "single_choice") {
    return typeof value === "string" && (question.options?.some((option) => option.id === value) ?? false);
  }

  if (question.type === "financial_context") {
    if (question.code === "FIN4") {
      return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10;
    }
    return typeof value === "string" && (FINANCIAL_OPTIONS[question.code]?.some((option) => option.id === value) ?? false);
  }

  if (question.type === "free_text") {
    return typeof value === "string" && value.length <= 1000;
  }

  return false;
}

export function answerColumns(question: Question, value: AnswerValue) {
  const base = { numeric_value: null as number | null, text_value: null as string | null, choice_value: null as string | null };

  if (value === null || value === "") return base;
  if (question.type === "likert" || question.code === "FIN4") return { ...base, numeric_value: Number(value) };
  if (question.type === "free_text") return { ...base, text_value: String(value) };
  return { ...base, choice_value: String(value) };
}
