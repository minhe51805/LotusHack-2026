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
  console.info("[zalo:webhook] GET health check");

  return NextResponse.json({
    ok: true,
    route: "/api/zalo/webhook",
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.ZALO_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("[zalo:webhook] Missing ZALO_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-bot-api-secret-token");
  if (providedSecret !== expectedSecret) {
    console.warn("[zalo:webhook] Unauthorized request", {
      hasProvidedSecret: Boolean(providedSecret),
      providedSecretLength: providedSecret?.length ?? 0,
      expectedSecretLength: expectedSecret.length,
    });
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
    console.warn("[zalo:webhook] Invalid JSON payload");
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
  const chatId = message?.chat?.id?.trim() ?? message?.from?.id?.trim();
  const userText = message?.text?.trim() ?? message?.caption?.trim();

  if (eventName !== "message.text.received" || !chatId || !userText) {
    console.info("[zalo:webhook] Ignored event", {
      eventName: eventName ?? null,
      chatId: chatId ?? null,
      hasUserText: Boolean(userText),
      hasMessageObject: Boolean(message),
      hasChatObject: Boolean(message?.chat),
      fromId: message?.from?.id ?? null,
      topLevelKeys: Object.keys(payload ?? {}),
      resultKeys:
        payload.result && typeof payload.result === "object"
          ? Object.keys(payload.result)
          : [],
    });
    return NextResponse.json({ ok: true, ignored: true });
  }

  console.info("[zalo:webhook] Incoming message", {
    eventName,
    chatId,
    textLength: userText.length,
  });

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
    console.info("[zalo:webhook] Zalo sendMessage success", {
      chatId,
      sendResult,
    });
  } catch (error) {
    console.error("[zalo:webhook] Failed to process message", {
      chatId,
      eventName,
      userText,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }

  void saveZaloConversation(nextSession).catch((error) => {
    console.error("[zalo:webhook] Failed to save session", {
      chatId,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  console.info("[zalo:webhook] Reply sent", {
    chatId,
    replyLength: replyText.length,
  });

  return NextResponse.json({ ok: true });
}
