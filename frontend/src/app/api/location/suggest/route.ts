import { NextRequest, NextResponse } from "next/server";
import { runLocationSearch } from "@/lib/location-search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const proximity = req.nextUrl.searchParams.get("proximity");
  try {
    const suggestions = await runLocationSearch(q, { proximity: proximity ?? undefined });
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: "Location search failed." }, { status: 503 });
  }
}
