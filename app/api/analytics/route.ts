import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/dashboard/data";

export async function GET() {
  return NextResponse.json(await getAnalytics());
}
