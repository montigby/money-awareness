import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;
  const body = await request.json();

  // TODO: validate question code + answer with Zod and upsert in Supabase.
  return NextResponse.json({ ok: true, session, received: body });
}
