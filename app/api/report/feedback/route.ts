import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { captureAnalyticsEvent } from "@/lib/analytics/server";

const BodySchema = z.object({
  session: z.string().uuid(),
  accuracyRating: z.number().int().min(1).max(5),
  helpfulnessRating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
  }

  const { session, accuracyRating, helpfulnessRating, feedbackText } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { data: sessionRow } = await supabase
    .from("assessment_sessions")
    .select("id,status")
    .eq("session_token", session)
    .maybeSingle();

  if (!sessionRow || sessionRow.status !== "completed") {
    return NextResponse.json({ error: "Completed assessment not found." }, { status: 404 });
  }

  const { data: reportRow } = await supabase
    .from("generated_reports")
    .select("id")
    .eq("session_id", sessionRow.id)
    .maybeSingle();

  if (!reportRow) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const { error } = await supabase.from("report_feedback").upsert(
    {
      report_id: reportRow.id,
      accuracy_rating: accuracyRating,
      helpfulness_rating: helpfulnessRating ?? null,
      feedback_text: feedbackText?.trim() || null,
    },
    { onConflict: "report_id" }
  );

  if (error) {
    console.error("Feedback save failed", error);
    return NextResponse.json({ error: "Unable to save feedback." }, { status: 500 });
  }

  await captureAnalyticsEvent({
    event: "accuracy_submitted",
    distinctId: session,
    properties: {
      accuracy_rating: accuracyRating,
      has_written_feedback: Boolean(feedbackText?.trim()),
    },
  });

  return NextResponse.json({ ok: true });
}
