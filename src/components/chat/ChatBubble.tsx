import { Bot, User } from "lucide-react";
import { SchoolMatchCards, type MatchedSchool } from "./SchoolMatchCards";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";

const streamdownPlugins = { cjk, code };

export interface ChatPart {
  type: string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  state?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input?: any;
  output?: unknown;
}

export interface ChatMessage {
  id: string;
  role: string;
  parts: unknown[];
  createdAt?: string | Date;
}

function getParts(raw: unknown[]): ChatPart[] {
  return raw as ChatPart[];
}

function isAskUserPart(part: ChatPart): boolean {
  return (
    part.type === "tool-ask_user" ||
    (part.type === "dynamic-tool" && part.toolName === "ask_user")
  );
}

function formatTime(ts: string | Date | undefined): string | null {
  if (!ts) return null;
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function BotLabel({ time }: { time: string | null }) {
  return (
    <div className="flex items-center gap-1.5 mb-0.5">
      <Bot size={12} className="text-gray-400" />
      <span className="text-xs text-gray-400 dark:text-zinc-500">AI Tư vấn</span>
      {time && (
        <span className="text-[10px] text-gray-300 dark:text-zinc-600">{time}</span>
      )}
    </div>
  );
}

function UserLabel({ time }: { time?: string | null }) {
  return (
    <div className="flex items-center gap-1.5 mb-0.5">
      <span className="text-xs text-gray-400 dark:text-zinc-500">Bạn</span>
      <User size={12} className="text-gray-400" />
      {time && (
        <span className="text-[10px] text-gray-300 dark:text-zinc-600">{time}</span>
      )}
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  /** In live mode the input-available state is handled by AskUserModal, not inline */
  mode?: "live" | "readonly";
}

export function ChatBubble({ message, mode = "readonly" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const parts = getParts(message.parts);
  const timeLabel = formatTime(message.createdAt);

  /* ── User message ──────────────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-1.5">
          <UserLabel time={timeLabel} />
          {parts.map((part, i) => {
            if (part.type === "text" && part.text?.trim()) {
              return (
                <div
                  key={i}
                  className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-wrap bg-blue-600 text-white"
                >
                  {part.text}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  /* ── Assistant message ─────────────────────────────────────── */
  // Each part is rendered as its own full-width row so that ask_user answers
  // can appear right-aligned at the correct position in the parts sequence.
  let labelShown = false;

  return (
    <div className="flex flex-col gap-3">
      {parts.map((part, i) => {
        /* ── Text ───────────────────────────────────── */
        if (part.type === "text" && part.text?.trim()) {
          const showLabel = !labelShown;
          labelShown = true;
          return (
            <div key={i} className="flex justify-start">
              <div className="max-w-[80%] flex flex-col items-start gap-1.5">
                {showLabel && <BotLabel time={timeLabel} />}
                <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 shadow-sm border border-gray-100 dark:border-zinc-700 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-0.5">
                  <Streamdown plugins={streamdownPlugins}>{part.text}</Streamdown>
                </div>
              </div>
            </div>
          );
        }

        /* ── ask_user ───────────────────────────────── */
        if (isAskUserPart(part)) {
          if (mode === "live" && part.state === "input-available") {
            return null;
          }

          if (part.state === "input-streaming") {
            const showLabel = !labelShown;
            labelShown = true;
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[80%] flex flex-col items-start gap-1.5">
                  {showLabel && <BotLabel time={timeLabel} />}
                  <div className="flex gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce"
                        style={{ animationDelay: `${d * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          if (part.state === "output-available") {
            const question = part.input?.question as string | undefined;
            const answer = String(part.output ?? "");
            const isSkipped = answer === "Bỏ qua";
            const showLabel = !labelShown;
            labelShown = true;
            return (
              <div key={i} className="flex flex-col gap-3">
                {/* Question — left side (bot) */}
                {question && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] flex flex-col items-start gap-1.5">
                      {showLabel && <BotLabel time={timeLabel} />}
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm text-gray-700 dark:text-zinc-300">
                        {question}
                      </div>
                    </div>
                  </div>
                )}
                {/* Answer — right side (user), inline at the correct position */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] flex flex-col items-end gap-1.5">
                    <UserLabel />
                    <div
                      className={`px-3.5 py-2 rounded-2xl rounded-br-sm text-sm ${
                        isSkipped
                          ? "bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400 italic"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        }

        /* ── save_lead ──────────────────────────────── */
        if (part.type === "tool-save_lead" && part.state === "output-available") {
          return (
            <div key={i} className="flex justify-start">
              <div className="px-3.5 py-2 rounded-xl text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center gap-1.5">
                <span className="text-green-500">✓</span> Đã lưu khách hàng
              </div>
            </div>
          );
        }

        /* ── search_schools ─────────────────────────── */
        if (part.type === "tool-search_schools" && part.state === "output-available") {
          return (
            <div key={i} className="flex justify-start">
              <div className="px-3.5 py-2 rounded-xl text-xs bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <span>🔍</span> Đã tìm kiếm trường
              </div>
            </div>
          );
        }

        /* ── match_schools (streaming) ──────────────── */
        if (part.type === "tool-match_schools" && part.state === "input-streaming") {
          const showLabel = !labelShown;
          labelShown = true;
          return (
            <div key={i} className="flex justify-start w-full">
              <div className="w-full flex flex-col items-start gap-1.5">
                {showLabel && <BotLabel time={timeLabel} />}
                <div className="w-full space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
                      Đang tìm trường phù hợp…
                    </span>
                  </div>
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 h-24 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        }

        /* ── match_schools (result) ─────────────────── */
        if (part.type === "tool-match_schools" && part.state === "output-available") {
          const output = part.output as {
            matched?: MatchedSchool[];
            total_schools?: number;
          } | null;
          const showLabel = !labelShown;
          labelShown = true;
          return (
            <div key={i} className="flex justify-start w-full">
              <div className="w-full flex flex-col items-start gap-1.5">
                {showLabel && <BotLabel time={timeLabel} />}
                <SchoolMatchCards
                  matched={output?.matched ?? []}
                  total_schools={output?.total_schools ?? 0}
                />
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
