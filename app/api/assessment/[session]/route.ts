import { NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/assessment/questions";
import type { AssessmentAnswers } from "@/types/assessment";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;
  const supabase = getSupabaseAdmin();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("assessment_sessions")
    .select("id,status,current_question,completed_at")
    .eq("session_token", session)
    .maybeSingle();

  if (sessionError || !sessionRow) {
    return NextResponse.json({ error: "Assessment session not found." }, { status: 404 });
  }

  const { data: rows, error: answerError } = await supabase
    .from("answers")
    .select("question_code,numeric_value,text_value,choice_value")
    .eq("session_id", sessionRow.id);

  if (answerError) {
    return NextResponse.json({ error: "Unable to restore assessment." }, { status: 500 });
  }

  const answers: AssessmentAnswers = {};
  for (const row of rows ?? []) {
    if (row.numeric_value !== null) answers[row.question_code] = Number(row.numeric_value);
    else if (row.text_value !== null) answers[row.question_code] = row.text_value;
    else if (row.choice_value !== null) answers[row.question_code] = row.choice_value;
  }

  return NextResponse.json({
    status: sessionRow.status,
    completedAt: sessionRow.completed_at,
    currentIndex: Math.max(0, Math.min((sessionRow.current_question ?? 1) - 1, QUESTIONS.length - 1)),
    answers,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("assessment_sessions")
    .delete()
    .eq("session_token", session);

  if (error) {
    console.error("Failed to delete assessment", error);
    return NextResponse.json({ error: "Unable to delete results." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
