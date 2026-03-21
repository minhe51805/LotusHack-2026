"use client";

import { useEffect, useRef } from "react";
import { ChatBubble, type ChatMessage } from "./ChatBubble";
import { AskUserModal } from "./AskUserModal";

interface ActiveToolCall {
  toolCallId: string;
  question: string;
  type: "single_select" | "multi_select";
  options: string[];
}

function findActiveToolCall(messages: ChatMessage[]): ActiveToolCall | null {
  // Walk backwards — last assistant message wins
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== "assistant") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parts = msg.parts as any[];
    for (const part of parts) {
      if (
        part.type === "tool-ask_user" &&
        part.state === "input-available" &&
        part.input
      ) {
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
  /** live = interactive (client chat), readonly = replay (admin view) */
  mode?: "live" | "readonly";
  /** Only needed in live mode */
  onToolOutput?: (toolCallId: string, value: string) => void;
  /** Slot for PromptInput — rendered below messages, hidden when modal is open */
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeToolCall =
    mode === "live" ? findActiveToolCall(messages) : null;
  const modalOpen = !!activeToolCall;

  function handleSubmit(value: string) {
    if (!activeToolCall || !onToolOutput) return;
    onToolOutput(activeToolCall.toolCallId, value);
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* ── Messages ─────────────────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto transition-[opacity,filter] duration-300 ${
          modalOpen
            ? "opacity-30 blur-[1px] pointer-events-none select-none"
            : ""
        }`}
      >
        <div className="px-4 py-5 space-y-4">
          {messages.length === 0 && emptyState}
          {messages
            .filter((msg) => {
              if (mode !== "live" || msg.role !== "user") return true;
              // Hide the auto-generated profile form submission
              const parts = msg.parts as { type: string; text?: string }[];
              const text = parts.find((p) => p.type === "text")?.text ?? "";
              return !text.startsWith("[Hồ sơ của tôi]");
            })
            .map((msg) => (
              <ChatBubble key={msg.id} message={msg} mode={mode} />
            ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input slot ───────────────────────────────────────── */}
      {inputSlot && (
        <div
          className={`shrink-0 border-t border-gray-200 dark:border-zinc-800 transition-opacity duration-200 ${
            modalOpen ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          {inputSlot}
        </div>
      )}

      {/* ── AskUser modal (live mode only) ───────────────────── */}
      {modalOpen && activeToolCall && (
        <AskUserModal
          key={activeToolCall.toolCallId}
          question={activeToolCall.question}
          type={activeToolCall.type}
          options={activeToolCall.options}
          onSubmit={handleSubmit}
          onSkip={() => handleSubmit("Bỏ qua")}
        />
      )}
    </div>
  );
}
