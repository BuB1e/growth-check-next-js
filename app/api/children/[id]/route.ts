import { NextRequest, NextResponse } from "next/server";
import { mockChildren } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const child = mockChildren.find((c) => c.id === parseInt(id));

  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  return NextResponse.json(child);
}
