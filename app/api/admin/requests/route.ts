import { NextResponse } from "next/server";
import { mockRequests } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockRequests);
}
