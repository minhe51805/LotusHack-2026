import { NextResponse } from "next/server";
import {
  getSessions,
  saveSession,
  extractLead,
  type StoredMessage,
} from "@/lib/data";

export async function GET() {
  const sessions = await getSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, messages } = body as {
    sessionId: string;
    messages: StoredMessage[];
  };

  if (!sessionId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lead = extractLead(messages);
  const now = new Date().toISOString();

  // Check if session already exists to preserve createdAt
  const { getSession } = await import("@/lib/data");
  const existing = await getSession(sessionId);

  await saveSession({
    id: sessionId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    messages,
    lead,
  });

  return NextResponse.json({ ok: true });
}
