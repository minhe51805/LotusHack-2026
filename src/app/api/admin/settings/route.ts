import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/data";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { systemPrompt, zaloSystemPrompt } = body as {
    systemPrompt: string;
    zaloSystemPrompt?: string;
  };

  if (typeof systemPrompt !== "string" || !systemPrompt.trim()) {
    return NextResponse.json({ error: "systemPrompt required" }, { status: 400 });
  }

  if (zaloSystemPrompt != null && typeof zaloSystemPrompt !== "string") {
    return NextResponse.json({ error: "zaloSystemPrompt must be a string" }, { status: 400 });
  }

  await saveSettings({
    systemPrompt: systemPrompt.trim(),
    zaloSystemPrompt:
      typeof zaloSystemPrompt === "string" ? zaloSystemPrompt.trim() : systemPrompt.trim(),
  });
  return NextResponse.json({ ok: true });
}
