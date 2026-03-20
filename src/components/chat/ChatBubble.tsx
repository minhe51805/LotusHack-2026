import { Bot, User } from "lucide-react";

export interface ChatPart {
  type: string;
  text?: string;
  toolCallId?: string;
  state?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input?: any;
  output?: unknown;
}

export interface ChatMessage {
  id: string;
  role: string;
  parts: unknown[];
}

function getParts(raw: unknown[]): ChatPart[] {
  return raw as ChatPart[];
}

interface ChatBubbleProps {
  message: ChatMessage;
  /** In live mode the input-available state is handled by AskUserModal, not inline */
  mode?: "live" | "readonly";
}

export function ChatBubble({ message, mode = "readonly" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const parts = getParts(message.parts);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Role label */}
        <div className="flex items-center gap-1 mb-0.5">
          {!isUser && <Bot size={12} className="text-gray-400" />}
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {isUser ? "You" : "ETEST"}
          </span>
          {isUser && <User size={12} className="text-gray-400" />}
        </div>

        {parts.map((part, i) => {
          /* ── Text ─────────────────────────────────────── */
          if (part.type === "text" && part.text?.trim()) {
            return (
              <div
                key={i}
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 shadow-sm border border-gray-100 dark:border-zinc-700 rounded-bl-sm"
                }`}
              >
                {part.text}
              </div>
            );
          }

          /* ── ask_user ──────────────────────────────────── */
          if (part.type === "tool-ask_user") {
            // Live mode: input-available is handled by AskUserModal, skip here
            if (mode === "live" && part.state === "input-available") {
              return null;
            }

            if (part.state === "input-streaming") {
              return (
                <div
                  key={i}
                  className="flex gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm"
                >
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </div>
              );
            }

            if (part.state === "output-available") {
              const question = part.input?.question as string | undefined;
              const answer = String(part.output ?? "");
              const isSkipped = answer === "Bỏ qua";
              return (
                <div key={i} className="flex flex-col gap-1.5 items-start w-full">
                  {question && (
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm text-gray-700 dark:text-zinc-300">
                      {question}
                    </div>
                  )}
                  <div
                    className={`self-end px-3.5 py-2 rounded-2xl rounded-br-sm text-sm ${
                      isSkipped
                        ? "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 italic"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {answer}
                  </div>
                </div>
              );
            }

            return null;
          }

          /* ── save_lead ─────────────────────────────────── */
          if (
            part.type === "tool-save_lead" &&
            part.state === "output-available"
          ) {
            return (
              <div
                key={i}
                className="px-3.5 py-2 rounded-xl text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-1.5"
              >
                <span className="text-green-500">✓</span> Lead saved
              </div>
            );
          }

          /* ── search_schools ────────────────────────────── */
          if (
            part.type === "tool-search_schools" &&
            part.state === "output-available"
          ) {
            return (
              <div
                key={i}
                className="px-3.5 py-2 rounded-xl text-xs bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center gap-1.5"
              >
                <span>🔍</span> Schools searched
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
