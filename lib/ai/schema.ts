import { z } from "zod";

export const ReportSchema = z.object({
  headline: z.string(),
  profile_summary: z.string(),
  money_means: z.object({
    primary: z.string(),
    secondary: z.string(),
    interpretation: z.string(),
  }),
  greatest_strength: z.object({
    title: z.string(),
    body: z.string(),
  }),
  primary_tension: z.object({
    title: z.string(),
    body: z.string(),
  }),
  patterns: z.array(z.object({
    name: z.string(),
    body: z.string(),
  })).max(3),
  financial_reality: z.object({
    show: z.boolean(),
    headline: z.string(),
    body: z.string(),
  }),
  stress_response: z.object({
    title: z.string(),
    body: z.string(),
  }),
  contradiction: z.object({
    show: z.boolean(),
    title: z.string(),
    body: z.string(),
  }),
  reflection_response: z.object({
    show: z.boolean(),
    body: z.string(),
  }),
  question_to_consider: z.string(),
});

export type GeneratedReport = z.infer<typeof ReportSchema>;

export const REPORT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "headline",
    "profile_summary",
    "money_means",
    "greatest_strength",
    "primary_tension",
    "patterns",
    "financial_reality",
    "stress_response",
    "contradiction",
    "reflection_response",
    "question_to_consider",
  ],
  properties: {
    headline: { type: "string" },
    profile_summary: { type: "string" },
    money_means: {
      type: "object",
      additionalProperties: false,
      required: ["primary", "secondary", "interpretation"],
      properties: {
        primary: { type: "string" },
        secondary: { type: "string" },
        interpretation: { type: "string" },
      },
    },
    greatest_strength: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body"],
      properties: { title: { type: "string" }, body: { type: "string" } },
    },
    primary_tension: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body"],
      properties: { title: { type: "string" }, body: { type: "string" } },
    },
    patterns: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "body"],
        properties: { name: { type: "string" }, body: { type: "string" } },
      },
    },
    financial_reality: {
      type: "object",
      additionalProperties: false,
      required: ["show", "headline", "body"],
      properties: {
        show: { type: "boolean" },
        headline: { type: "string" },
        body: { type: "string" },
      },
    },
    stress_response: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body"],
      properties: { title: { type: "string" }, body: { type: "string" } },
    },
    contradiction: {
      type: "object",
      additionalProperties: false,
      required: ["show", "title", "body"],
      properties: {
        show: { type: "boolean" },
        title: { type: "string" },
        body: { type: "string" },
      },
    },
    reflection_response: {
      type: "object",
      additionalProperties: false,
      required: ["show", "body"],
      properties: { show: { type: "boolean" }, body: { type: "string" } },
    },
    question_to_consider: { type: "string" },
  },
} as const;
