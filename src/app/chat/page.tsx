"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useEffect, useRef, useState } from "react";
import { ChatView } from "@/components/chat/ChatView";
import { PreChatForm } from "@/components/chat/PreChatForm";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import type { LeadData } from "@/lib/data";

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

  const pendingLeadRef = useRef<Partial<LeadData> | null>(null);
  const [supportRequested, setSupportRequested] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

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
        createdAt: new Date(now - (messages.length - 1 - idx) * 1000).toISOString(),
      }));
      fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: toStore,
          formLead: pendingLeadRef.current ?? undefined,
        }),
      }).catch(() => {});
    }
    prevStatus.current = status;
  }, [status, messages, sessionId]);

  function handleFormSubmit(summary: string, lead: Partial<LeadData>) {
    pendingLeadRef.current = lead;
    sendMessage({ text: summary });
  }

  async function handleRequestSupport() {
    if (!sessionId || supportRequested || supportLoading) return;
    setSupportLoading(true);
    try {
      await fetch("/api/chat/request-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: supportName.trim() || undefined,
          phone: supportPhone.trim() || undefined,
        }),
      });
      setSupportRequested(true);
      setShowSupportForm(false);
    } catch {
      // silently fail
    } finally {
      setSupportLoading(false);
    }
  }

  const chatStarted = messages.length > 0;

  return (
    <div className="flex flex-col h-screen bg-background items-center">
      {/* Header */}
      <header className="w-full max-w-[680px] shrink-0 border-b bg-background px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          AI
        </div>
        <div>
          <p className="font-semibold text-sm">Tư vấn du học</p>
          <p className="text-xs text-muted-foreground">
            Tư vấn du học AI
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs text-gray-400">Trực tuyến</span>
        </div>
      </header>

      {/* Support CTA — shown after first exchange */}
      {chatStarted && (
        <div className="w-full max-w-[680px] shrink-0 px-4 pt-2">
          {supportRequested ? (
            <div className="w-full py-2 px-4 rounded-xl text-xs text-center bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400">
              ⚡ Yêu cầu đã gửi — tư vấn viên sẽ liên hệ bạn sớm nhất!
            </div>
          ) : showSupportForm ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-orange-200 dark:border-orange-800 p-4 shadow-lg">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                ⚡ Tư vấn chuyên sâu
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mb-3">
                Để lại thông tin, tư vấn viên sẽ liên hệ bạn ngay.
              </p>
              <div className="space-y-2 mb-3">
                <input
                  type="text"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder="Họ và tên *"
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="Số điện thoại *"
                  className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && supportName.trim() && supportPhone.trim()) handleRequestSupport();
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSupportForm(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleRequestSupport}
                  disabled={supportLoading || !supportName.trim() || !supportPhone.trim()}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  {supportLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : "Gửi yêu cầu"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSupportForm(true)}
              className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white transition-all flex items-center justify-center gap-1.5"
            >
              ⚡ Tôi cần tư vấn chuyên sâu hơn
            </button>
          )}
        </div>
      )}

      {/* Chat / Form area */}
      <div className="w-full max-w-[680px] flex-1 overflow-hidden">
        {!chatStarted ? (
          <PreChatForm onSubmit={handleFormSubmit} />
        ) : (
          <ChatView
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages={messages as any}
            mode="live"
            onToolOutput={(toolCallId, value) =>
              addToolOutput({ tool: "ask_user", toolCallId, output: value })
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
        )}
      </div>
    </div>
  );
}
