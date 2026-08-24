import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ session: string }> }
) {
  const { session } = await params;

  // TODO:
  // 1. load answers
  // 2. validate all required answers
  // 3. score deterministically
  // 4. persist score
  // 5. build mock report first
  // 6. later invoke production report generator
  return NextResponse.json({ ok: true, session });
}
