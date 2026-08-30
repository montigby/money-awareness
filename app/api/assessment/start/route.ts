import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const token = crypto.randomUUID();
  const now = new Date().toISOString();

  const { error } = await supabase.from("assessment_sessions").insert({
    session_token: token,
    status: "in_progress",
    started_at: now,
    last_activity_at: now,
    current_question: 1,
  });

  if (error) {
    console.error("Failed to create assessment session", error);
    return NextResponse.json({ error: "Unable to start assessment." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL(`/assessment/${token}`, origin), 303);
}
