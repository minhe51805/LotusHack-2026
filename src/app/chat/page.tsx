"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useEffect, useRef } from "react";
import { ChatView } from "@/components/chat/ChatView";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

export default function Chat() {
  const [sessionId] = [
    (() => {
      if (typeof window === "undefined") return "";
      const existing = sessionStorage.getItem("chatSessionId");
      if (existing) return existing;
      const newId = crypto.randomUUID();
      sessionStorage.setItem("chatSessionId", newId);
      return newId;
    })(),
  ];

  const { messages, sendMessage, addToolOutput, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const prevStatus = useRef(status);
  useEffect(() => {
    const wasStreaming =
      prevStatus.current === "streaming" ||
      prevStatus.current === "submitted";
    const isNowReady = status === "ready";
    if (wasStreaming && isNowReady && messages.length > 0 && sessionId) {
      const now = Date.now();
      const toStore = messages.map((m, idx) => ({
        id: m.id,
        role: m.role,
        parts: m.parts,
        // Approximate timestamp: spread messages evenly up to now
        createdAt: new Date(now - (messages.length - 1 - idx) * 1000).toISOString(),
      }));
      fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages: toStore }),
      }).catch(() => {});
    }
    prevStatus.current = status;
  }, [status, messages, sessionId]);

  return (
    <div className="flex flex-col h-screen bg-background items-center">
      {/* Header */}
      <header className="w-full max-w-[420px] shrink-0 border-b bg-background px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          E
        </div>
        <div>
          <p className="font-semibold text-sm">ETEST Tư Vấn</p>
          <p className="text-xs text-muted-foreground">
            Trung tâm Anh ngữ Du học
          </p>
        </div>
        {/* Online indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </header>

      {/* Chat area */}
      <div className="w-full max-w-[420px] flex-1 overflow-hidden">
        <ChatView
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages={messages as any}
          mode="live"
          onToolOutput={(toolCallId, value) =>
            addToolOutput({ tool: "ask_user", toolCallId, output: value })
          }
          emptyState={
            <p className="text-center text-muted-foreground text-sm mt-16">
              Xin chào! Hãy bắt đầu trò chuyện để được tư vấn. 👋
            </p>
          }
          inputSlot={
            <div className="p-3">
              <PromptInput
                onSubmit={({ text }) => {
                  if (
                    !text.trim() ||
                    status === "streaming" ||
                    status === "submitted"
                  )
                    return;
                  sendMessage({ text });
                }}
              >
                <PromptInputBody>
                  <PromptInputTextarea placeholder="Nhắn tin…" />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools />
                  <PromptInputSubmit status={status} onStop={stop} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          }
        />
      </div>
    </div>
  );
}
