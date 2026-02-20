import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.reason || body.reason.length < 10) {
    return NextResponse.json(
      { error: "Rejection reason must be at least 10 characters" },
      { status: 400 },
    );
  }

  // Mock: return success
  return NextResponse.json({
    message: `Request ${id} rejected`,
    reason: body.reason,
    status: "REJECT",
  });
}
