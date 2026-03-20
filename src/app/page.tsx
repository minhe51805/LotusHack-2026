"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState, useEffect, useRef } from "react";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

export default function Chat() {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    const existing = sessionStorage.getItem("chatSessionId");
    if (existing) return existing;
    const newId = crypto.randomUUID();
    sessionStorage.setItem("chatSessionId", newId);
    return newId;
  });

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
      fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messages }),
      }).catch(() => {});
    }
    prevStatus.current = status;
  }, [status, messages, sessionId]);

  function submitSingleSelect(toolCallId: string, value: string) {
    addToolOutput({ tool: "ask_user", toolCallId, output: value });
  }

  function toggleMulti(toolCallId: string, option: string) {
    setSelected((prev) => {
      const current = prev[toolCallId] ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [toolCallId]: next };
    });
  }

  function submitMultiSelect(toolCallId: string) {
    const values = selected[toolCallId] ?? [];
    if (!values.length) return;
    addToolOutput({ tool: "ask_user", toolCallId, output: values.join(", ") });
    setSelected((prev) => {
      const next = { ...prev };
      delete next[toolCallId];
      return next;
    });
  }

  return (
    <div className="flex flex-col h-screen bg-background items-center">
      {/* Header */}
      <header className="w-full max-w-[400px] shrink-0 border-b bg-background px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          E
        </div>
        <div>
          <p className="font-semibold text-sm">ETEST Tư Vấn</p>
          <p className="text-xs text-muted-foreground">
            Trung tâm Anh ngữ Du học
          </p>
        </div>
      </header>

      {/* Conversation area */}
      <div className="w-full max-w-[400px] flex-1 overflow-hidden flex flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm mt-16">
                Xin chào! Hãy bắt đầu trò chuyện để được tư vấn.
              </p>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      if (part.type === "text" && part.text.trim()) {
                        if (isUser) {
                          return <span key={i}>{part.text}</span>;
                        }
                        return (
                          <MessageResponse key={i}>
                            {part.text}
                          </MessageResponse>
                        );
                      }

                      if (part.type === "tool-ask_user") {
                        const { toolCallId, state } = part;

                        if (state === "input-streaming") {
                          return (
                            <span
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              Đang tải...
                            </span>
                          );
                        }

                        if (state === "input-available") {
                          const { question, type, options } =
                            part.input as {
                              question: string;
                              type: string;
                              options: string[];
                            };
                          const isMulti = type === "multi_select";
                          const currentSelected = selected[toolCallId] ?? [];

                          return (
                            <div key={i} className="space-y-3 py-1">
                              <p className="text-sm font-medium">{question}</p>
                              <div className="flex flex-wrap gap-2">
                                {options.map((opt: string) => {
                                  const isChosen =
                                    currentSelected.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      onClick={() =>
                                        isMulti
                                          ? toggleMulti(toolCallId, opt)
                                          : submitSingleSelect(toolCallId, opt)
                                      }
                                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                                        isChosen
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "border-border text-foreground hover:border-primary/60"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              {isMulti && (
                                <button
                                  onClick={() => submitMultiSelect(toolCallId)}
                                  disabled={!currentSelected.length}
                                  className="w-full py-1.5 bg-primary text-primary-foreground text-sm rounded-lg disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                  Xác nhận ({currentSelected.length})
                                </button>
                              )}
                            </div>
                          );
                        }

                        if (state === "output-available") {
                          return (
                            <span key={i}>{String(part.output)}</span>
                          );
                        }
                      }

                      return null;
                    })}
                  </MessageContent>
                </Message>
              );
            })}
          </ConversationContent>
        </Conversation>

        {/* Input */}
        <div className="shrink-0 border-t p-3">
          <PromptInput
            onSubmit={({ text }) => {
              if (!text.trim() || status === "streaming" || status === "submitted") return;
              sendMessage({ text });
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder="Nhắn tin..." />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
