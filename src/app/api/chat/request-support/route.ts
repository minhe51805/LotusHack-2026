import { NextResponse } from "next/server";
import { markSessionNeedsSupport, getSession, saveSession } from "@/lib/data";

export async function POST(req: Request) {
  const { sessionId, name, phone } = (await req.json()) as {
    sessionId?: string;
    name?: string;
    phone?: string;
  };
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }
  try {
    // Merge name/phone into the session lead if provided
    if (name || phone) {
      const session = await getSession(sessionId);
      if (session) {
        const lead = { ...(session.lead ?? {}), ...(name ? { full_name: name } : {}), ...(phone ? { phone } : {}) };
        await saveSession({ ...session, lead, updatedAt: new Date().toISOString() });
      }
    }
    await markSessionNeedsSupport(sessionId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[request-support]", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
