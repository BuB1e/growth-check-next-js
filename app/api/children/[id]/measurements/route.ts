import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  // Validate
  if (!body.height || body.height <= 0) {
    return NextResponse.json(
      { error: "Height must be positive" },
      { status: 400 },
    );
  }
  if (!body.weight || body.weight <= 0) {
    return NextResponse.json(
      { error: "Weight must be positive" },
      { status: 400 },
    );
  }

  // Mock: return created measurement
  const measurement = {
    id: Date.now(),
    childId: parseInt(id),
    height: body.height,
    weight: body.weight,
    date: body.date || new Date().toISOString(),
    recordedBy: "mock-user",
  };

  return NextResponse.json(measurement, { status: 201 });
}
