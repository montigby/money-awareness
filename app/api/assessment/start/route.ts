import { NextResponse } from "next/server";

export async function POST() {
  // TODO Phase 2:
  // 1. create session in Supabase
  // 2. generate non-guessable session token
  // 3. redirect to /assessment/[token]
  const token = crypto.randomUUID();
  return NextResponse.redirect(
    new URL(`/assessment/${token}`, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    303
  );
}
