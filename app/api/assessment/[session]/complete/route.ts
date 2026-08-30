import { NextResponse } from "next/server";
import type { AssessmentAnswers } from "@/types/assessment";
import { scoreAssessment, validateAssessment } from "@/lib/assessment/scoring";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { generateAndPersistReport } from "@/lib/ai/reportService";

const QUESTION_VERSION = "1.0.0";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;
  const supabase = getSupabaseAdmin();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("id,status")
    .eq("session_token", session)
    .maybeSingle();

  if (sessionError || !sessionRow) {
    return NextResponse.json({ error: "Assessment session not found." }, { status: 404 });
  }

  if (sessionRow.status === "completed") {
    return NextResponse.json({ ok: true, slug: session });
  }

  const { data: rows, error: answerError } = await supabase
    .from("answers")
    .select("question_code,numeric_value,text_value,choice_value")
    .eq("session_id", sessionRow.id);

  if (answerError) {
    return NextResponse.json({ error: "Unable to load answers." }, { status: 500 });
  }

  const answers: AssessmentAnswers = {};
  for (const row of rows ?? []) {
    if (row.numeric_value !== null) answers[row.question_code] = Number(row.numeric_value);
    else if (row.text_value !== null) answers[row.question_code] = row.text_value;
    else if (row.choice_value !== null) answers[row.question_code] = row.choice_value;
  }

  const validationErrors = validateAssessment(answers);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: "Assessment is incomplete.", validationErrors },
      { status: 400 }
    );
  }

  await supabase
    .from("assessment_sessions")
    .update({ status: "scoring", last_activity_at: new Date().toISOString() })
    .eq("id", sessionRow.id);

  try {
    const result = scoreAssessment(answers);
    const { error: scoreError } = await supabase.from("assessment_scores").upsert(
      {
        session_id: sessionRow.id,
        result_json: result,
        scoring_version: result.scoringVersion,
        question_version: QUESTION_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

    if (scoreError) throw scoreError;

    const completedAt = new Date().toISOString();
    const { error: completeError } = await supabase
      .from("assessment_sessions")
      .update({
        status: "completed",
        completed_at: completedAt,
        last_activity_at: completedAt,
      })
      .eq("id", sessionRow.id);

    if (completeError) throw completeError;

    let reportGenerated = false;
    let usedFallback = false;
    try {
      const generated = await generateAndPersistReport({
        sessionId: sessionRow.id,
        slug: session,
        result,
        answers,
      });
      reportGenerated = true;
      usedFallback = generated.usedFallback;
    } catch (reportError) {
      // The deterministic Stage 5 result remains available even if report
      // persistence itself fails. A later POST /api/report/generate can retry.
      console.error("Post-completion report generation failed", reportError);
    }

    return NextResponse.json({
      ok: true,
      slug: session,
      reportGenerated,
      usedFallback,
    });
  } catch (error) {
    console.error("Assessment scoring failed", error);
    await supabase
      .from("assessment_sessions")
      .update({ status: "failed", last_activity_at: new Date().toISOString() })
      .eq("id", sessionRow.id);
    return NextResponse.json({ error: "Unable to score assessment." }, { status: 500 });
  }
}
