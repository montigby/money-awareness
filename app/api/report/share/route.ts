import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { captureAnalyticsEvent } from "@/lib/analytics/server";

const BodySchema = z.object({ session: z.string().uuid() });

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assessment session." }, { status: 400 });
  }

  const { session } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { data: sessionRow } = await supabase
    .from("assessment_sessions")
    .select("id,status")
    .eq("session_token", session)
    .maybeSingle();

  if (!sessionRow || sessionRow.status !== "completed") {
    return NextResponse.json({ error: "Completed assessment not found." }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("generated_reports")
    .select("id,public_share_token")
    .eq("session_id", sessionRow.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const token = existing.public_share_token || crypto.randomUUID();
  if (!existing.public_share_token) {
    const { error } = await supabase
      .from("generated_reports")
      .update({ public_share_token: token, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) {
      console.error("Unable to create share token", error);
      return NextResponse.json({ error: "Unable to create share link." }, { status: 500 });
    }
  }

  await captureAnalyticsEvent({
    event: "share_created",
    distinctId: session,
    properties: { source: "results" },
  });

  return NextResponse.json({
    ok: true,
    url: `${siteUrl()}/share/${token}`,
  });
}
