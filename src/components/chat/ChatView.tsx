"use client";

import { useEffect, useRef } from "react";

import { AskUserModal } from "./AskUserModal";
import { ChatBubble, type ChatMessage } from "./ChatBubble";

interface ActiveToolCall {
  toolCallId: string;
  question: string;
  type: "single_select" | "multi_select";
  options: string[];
}

function isAskUserPart(part: unknown): part is {
  type: string;
  toolName?: string;
  toolCallId: string;
  state: string;
  input?: {
    question?: string;
    type?: "single_select" | "multi_select";
    options?: string[];
  };
} {
  if (!part || typeof part !== "object") return false;

  const candidate = part as {
    type?: string;
    toolName?: string;
    toolCallId?: string;
    state?: string;
  };

  return (
    typeof candidate.toolCallId === "string" &&
    typeof candidate.state === "string" &&
    (candidate.type === "tool-ask_user" ||
      (candidate.type === "dynamic-tool" && candidate.toolName === "ask_user"))
  );
}

function findActiveToolCall(messages: ChatMessage[]): ActiveToolCall | null {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
    const message = messages[messageIndex];
    if (message.role !== "assistant") continue;

    const parts = message.parts as unknown[];
    for (const part of parts) {
      if (isAskUserPart(part) && part.state === "input-available" && part.input) {
        return {
          toolCallId: part.toolCallId,
          question: part.input.question ?? "",
          type: part.input.type ?? "single_select",
          options: part.input.options ?? [],
        };
      }
    }
  }

  return null;
}

interface ChatViewProps {
  messages: ChatMessage[];
  mode?: "live" | "readonly";
  onToolOutput?: (toolCallId: string, value: string) => void;
  inputSlot?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function ChatView({
  messages,
  mode = "readonly",
  onToolOutput,
  inputSlot,
  emptyState,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const activeToolCall = mode === "live" ? findActiveToolCall(messages) : null;
  const modalOpen = !!activeToolCall;

  function handleSubmit(value: string) {
    if (!activeToolCall || !onToolOutput) return;
    onToolOutput(activeToolCall.toolCallId, value);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div
        className={`flex-1 overflow-y-auto transition-[opacity,filter] duration-300 ${
          modalOpen ? "pointer-events-none select-none opacity-30 blur-[2px]" : ""
        }`}
      >
        <div className="min-h-full bg-[linear-gradient(180deg,transparent,oklch(0.82_0.076_66/0.04))] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {messages.length === 0 && emptyState}
            {messages
              .filter((message) => {
                if (mode !== "live" || message.role !== "user") return true;
                const parts = message.parts as { type: string; text?: string }[];
                const text = parts.find((part) => part.type === "text")?.text ?? "";
                return !text.startsWith("[Hồ sơ của tôi]");
              })
              .map((message) => (
                <ChatBubble key={message.id} message={message} mode={mode} />
              ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {inputSlot ? (
        <div
          className={`shrink-0 border-t border-border/80 bg-card/72 backdrop-blur-xl transition-opacity duration-200 ${
            modalOpen ? "pointer-events-none opacity-0" : ""
          }`}
        >
          {inputSlot}
        </div>
      ) : null}

      {modalOpen && activeToolCall ? (
        <AskUserModal
          key={activeToolCall.toolCallId}
          question={activeToolCall.question}
          type={activeToolCall.type}
          options={activeToolCall.options}
          onSubmit={handleSubmit}
          onSkip={() => handleSubmit("Bỏ qua")}
        />
      ) : null}
    </div>
  );
}
