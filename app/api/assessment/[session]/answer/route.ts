import { NextResponse } from "next/server";
import { QUESTIONS } from "@/lib/assessment/questions";
import { answerColumns, findQuestion, validateAnswer } from "@/lib/assessment/answer-validation";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;
  const body = await request.json().catch(() => null);
  const questionCode = body?.questionCode;
  const value = body?.value;

  if (typeof questionCode !== "string") {
    return NextResponse.json({ error: "Invalid question." }, { status: 400 });
  }

  const question = findQuestion(questionCode);
  if (!question || !validateAnswer(question, value)) {
    return NextResponse.json({ error: "Invalid answer." }, { status: 400 });
  }

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
    return NextResponse.json({ error: "Assessment is already complete." }, { status: 409 });
  }

  const columns = answerColumns(question, value);
  const { error: answerError } = await supabase.from("answers").upsert(
    {
      session_id: sessionRow.id,
      question_code: questionCode,
      ...columns,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_id,question_code" }
  );

  if (answerError) {
    console.error("Failed to persist assessment answer", answerError);
    return NextResponse.json({ error: "Unable to save answer." }, { status: 500 });
  }

  const questionIndex = QUESTIONS.findIndex((item) => item.code === questionCode);
  await supabase
    .from("assessment_sessions")
    .update({
      status: "in_progress",
      current_question: Math.min(questionIndex + 2, QUESTIONS.length),
      last_activity_at: new Date().toISOString(),
    })
    .eq("id", sessionRow.id);

  return NextResponse.json({ ok: true });
}
