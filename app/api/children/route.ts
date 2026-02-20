import { NextRequest, NextResponse } from "next/server";
import { mockChildren, paginate } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";

  // Filter by search
  let filtered = [...mockChildren];
  if (search) {
    filtered = filtered.filter((c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()),
    );
  }

  const result = paginate(filtered, page, limit);
  return NextResponse.json(result);
}
