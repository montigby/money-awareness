import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { captureAnalyticsEvent } from "@/lib/analytics/server";

const BodySchema = z.object({
  session: z.string().uuid(),
  email: z.string().email().max(320),
});

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REPORT_FROM_EMAIL;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Email delivery is not configured yet." }, { status: 503 });
  }

  const { session, email } = parsed.data;
  const supabase = getSupabaseAdmin();

  const { data: sessionRow } = await supabase
    .from("assessment_sessions")
    .select("id,status")
    .eq("session_token", session)
    .maybeSingle();

  if (!sessionRow || sessionRow.status !== "completed") {
    return NextResponse.json({ error: "Completed assessment not found." }, { status: 404 });
  }

  const { data: scoreRow } = await supabase
    .from("assessment_scores")
    .select("result_json")
    .eq("session_id", sessionRow.id)
    .maybeSingle();

  const result = scoreRow?.result_json as {
    archetypes?: { primary?: { name?: string } | null; secondary?: { name?: string } | null };
  } | null;

  const primary = result?.archetypes?.primary?.name || "Your Money Profile";
  const secondary = result?.archetypes?.secondary?.name;
  const profileName = secondary ? `${primary} × ${secondary}` : primary;
  const reportUrl = `${siteUrl()}/results/${session}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from,
      to: email,
      subject: "Your Money Self-Awareness Profile",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:28px;color:#1d1d1b">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#716e67">Money Self-Awareness</p>
          <h1 style="font-family:Georgia,serif;font-weight:500;font-size:38px;line-height:1.1">${profileName}</h1>
          <p style="font-size:17px;line-height:1.6;color:#4f4c46">Your full profile is ready whenever you want to revisit it.</p>
          <p style="margin:28px 0"><a href="${reportUrl}" style="display:inline-block;background:#1d1d1b;color:white;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">View my profile</a></p>
          <p style="font-size:12px;line-height:1.5;color:#716e67">This email does not include your financial context, reflection, or detailed results.</p>
        </div>
      `,
    },
    { idempotencyKey: `money-profile/${session}/${email.toLowerCase()}` }
  );

  if (error) {
    console.error("Resend failed", error);
    return NextResponse.json({ error: "We could not send the email." }, { status: 502 });
  }

  await supabase
    .from("assessment_sessions")
    .update({ email, last_activity_at: new Date().toISOString() })
    .eq("id", sessionRow.id);

  await captureAnalyticsEvent({
    event: "email_submitted",
    distinctId: session,
    properties: { source: "results" },
  });

  return NextResponse.json({ ok: true });
}
