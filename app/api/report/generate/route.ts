import { NextResponse } from "next/server";
import type { AssessmentAnswers, AssessmentResult } from "@/types/assessment";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { generateAndPersistReport } from "@/lib/ai/reportService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { session?: string } | null;
  const session = body?.session;

  if (!session) {
    return NextResponse.json({ error: "session is required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: sessionRow, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("id,status")
    .eq("session_token", session)
    .maybeSingle();

  if (sessionError || !sessionRow || sessionRow.status !== "completed") {
    return NextResponse.json({ error: "Completed assessment not found." }, { status: 404 });
  }

  const [{ data: scoreRow, error: scoreError }, { data: answerRows, error: answerError }] = await Promise.all([
    supabase
      .from("assessment_scores")
      .select("result_json")
      .eq("session_id", sessionRow.id)
      .maybeSingle(),
    supabase
      .from("answers")
      .select("question_code,numeric_value,text_value,choice_value")
      .eq("session_id", sessionRow.id),
  ]);

  if (scoreError || answerError || !scoreRow?.result_json) {
    return NextResponse.json({ error: "Assessment data is unavailable." }, { status: 500 });
  }

  const answers: AssessmentAnswers = {};
  for (const row of answerRows ?? []) {
    if (row.numeric_value !== null) answers[row.question_code] = Number(row.numeric_value);
    else if (row.text_value !== null) answers[row.question_code] = row.text_value;
    else if (row.choice_value !== null) answers[row.question_code] = row.choice_value;
  }

  try {
    const generated = await generateAndPersistReport({
      sessionId: sessionRow.id,
      slug: session,
      result: scoreRow.result_json as AssessmentResult,
      answers,
    });

    return NextResponse.json({
      ok: true,
      slug: session,
      usedFallback: generated.usedFallback,
      model: generated.model,
    });
  } catch (error) {
    console.error("Report persistence failed", error);
    return NextResponse.json({ error: "Unable to generate report." }, { status: 500 });
  }
}
