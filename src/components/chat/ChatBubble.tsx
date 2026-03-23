import { Bot, DatabaseZap, Search, User } from "lucide-react";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";

import { SchoolMatchCards, type MatchedSchool } from "./SchoolMatchCards";

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
  const date = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function isBotLabelPart(part: ChatPart, mode: "live" | "readonly"): boolean {
  if (part.type === "text" && part.text?.trim()) return true;

  if (isAskUserPart(part)) {
    if (mode === "live" && part.state === "input-available") return false;
    return part.state === "input-streaming" || part.state === "output-available";
  }

  return (
    part.type === "tool-match_schools" &&
    (part.state === "input-streaming" || part.state === "output-available")
  );
}

function BotLabel({ time }: { time: string | null }) {
  return (
    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex size-6 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
        <Bot className="size-3 text-primary" />
      </div>
      <span className="font-medium text-foreground/80">Lotus AI</span>
      {time ? <span>{time}</span> : null}
    </div>
  );
}

function UserLabel({ time }: { time?: string | null }) {
  return (
    <div className="mb-1 flex items-center justify-end gap-2 text-xs text-muted-foreground">
      {time ? <span>{time}</span> : null}
      <span className="font-medium text-foreground/80">Bạn</span>
      <div className="flex size-6 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
        <User className="size-3 text-primary" />
      </div>
    </div>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
  mode?: "live" | "readonly";
}

export function ChatBubble({ message, mode = "readonly" }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const parts = getParts(message.parts);
  const timeLabel = formatTime(message.createdAt);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[86%] sm:max-w-[78%]">
          <UserLabel time={timeLabel} />
          {parts.map((part, index) => {
            if (part.type !== "text" || !part.text?.trim()) return null;

            return (
              <div
                key={index}
                className="gradient-btn rounded-[1.35rem] rounded-br-sm px-4 py-3 text-sm leading-7 text-primary-foreground shadow-[0_24px_48px_-32px_rgb(15_23_42/0.48)]"
              >
                {part.text}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const firstBotLabelIndex = parts.findIndex((part) => isBotLabelPart(part, mode));

  return (
    <div className="flex flex-col gap-4">
      {parts.map((part, index) => {
        if (part.type === "text" && part.text?.trim()) {
          const showLabel = index === firstBotLabelIndex;

          return (
            <div key={index} className="flex justify-start">
              <div className="max-w-[92%] sm:max-w-[86%]">
                {showLabel ? <BotLabel time={timeLabel} /> : null}
                <div className="glass-card rounded-[1.45rem] rounded-bl-sm px-4 py-3 text-sm leading-7 text-foreground [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-0.5">
                  <Streamdown plugins={streamdownPlugins}>{part.text}</Streamdown>
                </div>
              </div>
            </div>
          );
        }

        if (isAskUserPart(part)) {
          if (mode === "live" && part.state === "input-available") {
            return null;
          }

          if (part.state === "input-streaming") {
            const showLabel = index === firstBotLabelIndex;

            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-[92%] sm:max-w-[86%]">
                  {showLabel ? <BotLabel time={timeLabel} /> : null}
                  <div className="saas-card flex w-fit items-center gap-2 px-4 py-3">
                    {[0, 1, 2].map((dotIndex) => (
                      <span
                        key={dotIndex}
                        className="size-2 rounded-full bg-primary/70 animate-bounce"
                        style={{ animationDelay: `${dotIndex * 120}ms` }}
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
            const showLabel = index === firstBotLabelIndex;

            return (
              <div key={index} className="flex flex-col gap-4">
                {question ? (
                  <div className="flex justify-start">
                    <div className="max-w-[92%] sm:max-w-[86%]">
                      {showLabel ? <BotLabel time={timeLabel} /> : null}
                      <div className="glass-card rounded-[1.35rem] rounded-bl-sm px-4 py-3 text-sm leading-7 text-foreground">
                        {question}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <div className="max-w-[86%] sm:max-w-[78%]">
                    <UserLabel />
                    <div
                      className={`rounded-[1.35rem] rounded-br-sm px-4 py-3 text-sm leading-7 ${
                        isSkipped
                          ? "border border-border bg-secondary/40 text-muted-foreground"
                          : "gradient-btn text-primary-foreground"
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

        if (part.type === "tool-save_lead" && part.state === "output-available") {
          return (
            <div key={index} className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
                <DatabaseZap className="size-3.5 text-primary" />
                Lead đã được lưu vào workspace.
              </div>
            </div>
          );
        }

        if (part.type === "tool-search_schools" && part.state === "output-available") {
          return (
            <div key={index} className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
                <Search className="size-3.5 text-primary" />
                Đã truy vấn dữ liệu trường học.
              </div>
            </div>
          );
        }

        if (part.type === "tool-match_schools" && part.state === "input-streaming") {
          const showLabel = index === firstBotLabelIndex;

          return (
            <div key={index} className="flex justify-start">
              <div className="w-full max-w-4xl">
                {showLabel ? <BotLabel time={timeLabel} /> : null}
                <div className="grid gap-3 lg:grid-cols-2">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="h-40 rounded-[1.45rem] border border-border/80 bg-secondary/35 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        }

        if (part.type === "tool-match_schools" && part.state === "output-available") {
          const output = part.output as {
            matched?: MatchedSchool[];
            total_schools?: number;
          } | null;
          const showLabel = index === firstBotLabelIndex;

          return (
            <div key={index} className="flex justify-start">
              <div className="w-full max-w-4xl">
                {showLabel ? <BotLabel time={timeLabel} /> : null}
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
