import { NextResponse } from "next/server";
import { getRecentEvents } from "@/lib/dashboard/data";

export async function GET() {
  return NextResponse.json(await getRecentEvents(100));
}
