import { NextResponse } from "next/server";
import { getSession } from "@/lib/data";

export async function GET(
  _req: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}
