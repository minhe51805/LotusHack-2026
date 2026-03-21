import { NextResponse } from "next/server";
import {
  buildZaloConversationTurn,
  saveZaloConversation,
  sendZaloTextMessage,
  type ZaloBotWebhookPayload,
} from "@/lib/zalo-bot";

export const runtime = "nodejs";

type ZaloWebhookMessage = NonNullable<
  NonNullable<ZaloBotWebhookPayload["result"]>["message"]
>;

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/zalo/webhook",
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.ZALO_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-bot-api-secret-token");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let payload: ZaloBotWebhookPayload;
  let rawBody = "";

  try {
    rawBody = await request.text();
    payload = rawBody
      ? (JSON.parse(rawBody) as ZaloBotWebhookPayload)
      : ({} as ZaloBotWebhookPayload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventContainer =
    payload.result && typeof payload.result === "object"
      ? payload.result
      : payload;

  const eventName =
    (eventContainer as { event_name?: string }).event_name ??
    (payload as { event_name?: string }).event_name;
  const message =
    (eventContainer as { message?: ZaloWebhookMessage }).message ??
    (payload as { message?: ZaloWebhookMessage }).message;
  const chatId = message?.chat?.id?.trim();
  const userText = message?.text?.trim();

  if (eventName !== "message.text.received" || !chatId || !userText) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let replyText: string;
  let nextSession;

  try {
    const result = await buildZaloConversationTurn({
      chatId,
      incomingText: userText,
      displayName: message?.from?.display_name,
    });
    replyText = result.replyText;
    nextSession = result.session;

    const sendResult = await sendZaloTextMessage({
      chatId,
      text: replyText,
    });
    void sendResult;
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }

  void saveZaloConversation(nextSession).catch(() => {});

  return NextResponse.json({ ok: true });
}
