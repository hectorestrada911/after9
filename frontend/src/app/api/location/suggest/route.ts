import { NextRequest, NextResponse } from "next/server";
import { runLocationSearch } from "@/lib/location-search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  try {
    const suggestions = await runLocationSearch(q);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "Location search failed." }, { status: 503 });
  }
}
