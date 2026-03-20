import { NextResponse } from "next/server";
import {
  getSessions,
  saveSession,
  extractLead,
  type StoredMessage,
  type LeadData,
} from "@/lib/data";

export async function GET() {
  const sessions = await getSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, messages, formLead } = body as {
    sessionId: string;
    messages: StoredMessage[];
    formLead?: Partial<LeadData>;
  };

  if (!sessionId || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Merge: AI-extracted lead fields take priority; form data fills any gaps
  const aiLead = extractLead(messages);
  const lead: LeadData | null = aiLead || formLead
    ? { ...(formLead ?? {}), ...(aiLead ?? {}) } as LeadData
    : null;
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
