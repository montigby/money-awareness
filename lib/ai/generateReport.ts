import OpenAI from "openai";
import type { AssessmentAnswers, AssessmentResult } from "@/types/assessment";
import { ARCHETYPE_COPY, contradictionCopy, patternCopy, resultHeadline } from "@/lib/results/copy";
import { REPORT_SYSTEM_PROMPT, REPORT_PROMPT_VERSION } from "@/lib/prompts/report-v1";
import { REPORT_JSON_SCHEMA, ReportSchema, type GeneratedReport } from "./schema";
import { buildReportInput } from "./reportInput";

export const DEFAULT_REPORT_MODEL = "gpt-5.6-luna";

export type ReportGenerationResult = {
  report: GeneratedReport;
  model: string;
  promptVersion: string;
  usedFallback: boolean;
};

function topMotivations(result: AssessmentResult) {
  return Object.entries(result.motivations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
}

export function deterministicFallbackReport(
  result: AssessmentResult,
  answers: AssessmentAnswers
): GeneratedReport {
  const [primaryMotivation = "Money", secondaryMotivation = "Life"] = topMotivations(result);
  const primary = result.archetypes.primary?.name;
  const primaryArchetype = primary ? ARCHETYPE_COPY[primary] : null;
  const topPattern = result.patterns[0] ? patternCopy(result.patterns[0]) : null;
  const contradiction = result.contradictions.find((c) => c.confidence !== "low");
  const contradictionText = contradiction ? contradictionCopy(contradiction) : null;
  const reflection = typeof answers.REF1 === "string" ? answers.REF1.trim() : "";
  const securityGap = result.securityGap;

  return ReportSchema.parse({
    headline: resultHeadline(result),
    profile_summary: primaryArchetype?.summary ??
      "Your responses form a distinct profile across security, enoughness, identity, control, freedom, and present enjoyment.",
    money_means: {
      primary: primaryMotivation,
      secondary: secondaryMotivation,
      interpretation: `Your strongest motivation signals are ${primaryMotivation.toLowerCase()} and ${secondaryMotivation.toLowerCase()}. These describe what money appears most likely to represent or enable for you, not what it should represent.`,
    },
    greatest_strength: {
      title: primaryArchetype?.meaning ?? "Your existing pattern has strengths",
      body: primaryArchetype?.summary ??
        "Your responses suggest that the way you relate to money has developed useful strengths as well as tradeoffs.",
    },
    primary_tension: {
      title: topPattern?.title ?? "No single tension dominates",
      body: topPattern?.body ??
        "Your responses do not currently trigger one dominant high-confidence pattern. The dimension scores may be more useful than a single label.",
    },
    patterns: result.patterns.slice(0, 3).map((pattern) => {
      const copy = patternCopy(pattern);
      return { name: copy.title, body: copy.body };
    }),
    financial_reality: {
      show: securityGap !== null && Math.abs(securityGap) >= 25,
      headline: securityGap !== null && securityGap >= 25
        ? "Your financial life appears safer than it feels."
        : "Your confidence appears stronger than your current financial cushion.",
      body: securityGap === null || Math.abs(securityGap) < 25
        ? ""
        : securityGap >= 25
          ? "Your objective resilience materially exceeds your internal security score. More financial resources and more felt security may be operating as partially separate variables."
          : "Your internal security materially exceeds your objective resilience score. Self-trust may be doing more of the work than your current financial buffer.",
    },
    stress_response: {
      title: result.dimensions.control >= 65 ? "Your instinct is likely to regain control" : "You may tolerate uncertainty before acting",
      body: result.dimensions.control >= 65
        ? "When financial uncertainty rises, your profile suggests a tendency to gather information, solve, optimize, or act rather than leave the situation unresolved."
        : "Your profile suggests relatively more tolerance for unresolved financial uncertainty before you feel compelled to intervene.",
    },
    contradiction: {
      show: Boolean(contradictionText),
      title: contradictionText?.title ?? "",
      body: contradictionText?.body ?? "",
    },
    reflection_response: {
      show: Boolean(reflection),
      body: reflection
        ? "Your written answer is not scored. It may still be one of the clearest clues about what you believe money must make possible before you permit a change in how you live."
        : "",
    },
    question_to_consider: topPattern?.question ??
      "What are you still asking money to make true before you allow yourself to feel differently?",
  });
}

async function callModel(result: AssessmentResult, answers: AssessmentAnswers) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const model = process.env.OPENAI_REPORT_MODEL || DEFAULT_REPORT_MODEL;
  const client = new OpenAI({ apiKey });
  const compactInput = buildReportInput(result, answers);

  const response = await client.responses.create({
    model,
    instructions: REPORT_SYSTEM_PROMPT,
    input: `Create the personalized Money Self-Awareness report from this deterministic assessment result.\n\n${JSON.stringify(compactInput)}`,
    text: {
      format: {
        type: "json_schema",
        name: "money_self_awareness_report",
        strict: true,
        schema: REPORT_JSON_SCHEMA,
      },
    },
  });

  if (!response.output_text) throw new Error("Model returned no report text.");
  const parsed = JSON.parse(response.output_text);
  return { report: ReportSchema.parse(parsed), model };
}

export async function generateReport(
  result: AssessmentResult,
  answers: AssessmentAnswers
): Promise<ReportGenerationResult> {
  try {
    const first = await callModel(result, answers);
    return {
      report: first.report,
      model: first.model,
      promptVersion: REPORT_PROMPT_VERSION,
      usedFallback: false,
    };
  } catch (firstError) {
    console.error("AI report generation attempt 1 failed", firstError);
    try {
      const second = await callModel(result, answers);
      return {
        report: second.report,
        model: second.model,
        promptVersion: REPORT_PROMPT_VERSION,
        usedFallback: false,
      };
    } catch (secondError) {
      console.error("AI report generation attempt 2 failed; using deterministic fallback", secondError);
      return {
        report: deterministicFallbackReport(result, answers),
        model: "deterministic-fallback",
        promptVersion: REPORT_PROMPT_VERSION,
        usedFallback: true,
      };
    }
  }
}
