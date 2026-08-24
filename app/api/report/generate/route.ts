import { NextResponse } from "next/server";

export async function POST() {
  // Production AI intentionally disabled in starter.
  // Implement after deterministic report UX is tested.
  return NextResponse.json(
    { error: "Production report generation is not enabled yet." },
    { status: 501 }
  );
}
