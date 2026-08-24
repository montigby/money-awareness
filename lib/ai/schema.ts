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
