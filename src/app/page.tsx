"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState, useEffect, useRef } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    const existing = sessionStorage.getItem("chatSessionId");
    if (existing) return existing;
    const newId = crypto.randomUUID();
    sessionStorage.setItem("chatSessionId", newId);
    return newId;
  });

  const { messages, sendMessage, addToolOutput, status } = useChat({
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

  const isLoading = status === "streaming" || status === "submitted";

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          E
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            ETEST Tư Vấn
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Trung tâm Anh ngữ Du học
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 dark:text-zinc-500 text-sm mt-16">
            Xin chào! Hãy bắt đầu trò chuyện để được tư vấn.
          </p>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
              >
                {message.parts.map((part, i) => {
                  if (part.type === "text" && part.text.trim()) {
                    return (
                      <div
                        key={i}
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 shadow-sm border border-gray-100 dark:border-zinc-700 rounded-bl-sm"
                        }`}
                      >
                        {part.text}
                      </div>
                    );
                  }

                  if (part.type === "tool-ask_user") {
                    const { toolCallId, state } = part;

                    if (state === "input-streaming") {
                      return (
                        <div
                          key={i}
                          className="text-xs text-gray-400 dark:text-zinc-500 px-1"
                        >
                          Đang tải...
                        </div>
                      );
                    }

                    if (state === "input-available") {
                      const { question, type, options } = part.input as { question: string; type: string; options: string[] };
                      const isMulti = type === "multi_select";
                      const currentSelected = selected[toolCallId] ?? [];

                      return (
                        <div
                          key={i}
                          className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 space-y-3 max-w-xs"
                        >
                          <p className="text-sm text-gray-800 dark:text-zinc-100 font-medium">
                            {question}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {options.map((opt: string) => {
                              const isChosen = currentSelected.includes(opt);
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
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
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
                              className="w-full py-1.5 bg-blue-600 text-white text-sm rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Xác nhận ({currentSelected.length})
                            </button>
                          )}
                        </div>
                      );
                    }

                    if (state === "output-available") {
                      return (
                        <div
                          key={i}
                          className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm bg-blue-600 text-white"
                        >
                          {String(part.output)}
                        </div>
                      );
                    }
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhắn tin..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4 rotate-90"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
