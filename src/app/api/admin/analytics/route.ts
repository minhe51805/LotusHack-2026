import { NextResponse } from "next/server";
import { getSessions } from "@/lib/data";
import { computeAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await getSessions();
  return NextResponse.json(computeAnalytics(sessions));
}
