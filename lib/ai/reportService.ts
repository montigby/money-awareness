import type { AssessmentAnswers, AssessmentResult } from "@/types/assessment";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { generateReport } from "./generateReport";

export async function generateAndPersistReport({
  sessionId,
  slug,
  result,
  answers,
}: {
  sessionId: string;
  slug: string;
  result: AssessmentResult;
  answers: AssessmentAnswers;
}) {
  const generated = await generateReport(result, answers);
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("generated_reports").upsert(
    {
      session_id: sessionId,
      slug,
      report_json: generated.report,
      generation_model: generated.model,
      prompt_version: generated.promptVersion,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id" }
  );

  if (error) throw error;
  return generated;
}
