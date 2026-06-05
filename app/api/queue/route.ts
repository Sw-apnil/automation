import { NextResponse } from "next/server";
import { getQueue } from "@/lib/dashboard/data";

export async function GET() {
  return NextResponse.json(await getQueue(100));
}
