import { NextResponse } from "next/server";
import { z } from "zod";
import { captureAnalyticsEvent } from "@/lib/analytics/server";

const ALLOWED_EVENTS = [
  "results_viewed",
  "dimension_expanded",
  "share_clicked",
  "share_completed",
  "email_clicked",
  "feedback_opened",
] as const;

const BodySchema = z.object({
  event: z.enum(ALLOWED_EVENTS),
  distinctId: z.string().uuid(),
  properties: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
  ).optional(),
});

export async function POST(request: Request) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  await captureAnalyticsEvent(parsed.data);
  return NextResponse.json({ ok: true });
}
