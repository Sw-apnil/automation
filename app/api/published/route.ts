import { NextResponse } from "next/server";
import { getPublished } from "@/lib/dashboard/data";

export async function GET() {
  return NextResponse.json(await getPublished(100));
}
