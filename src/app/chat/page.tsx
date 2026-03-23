"use client";

import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Headset,
  MessageSquareDot,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ChatView } from "@/components/chat/ChatView";
import { PreChatForm } from "@/components/chat/PreChatForm";
import type { ChatMessage } from "@/components/chat/ChatBubble";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeadData } from "@/lib/data";

const sideNotes = [
  {
    title: "AI chỉ trả lời sau khi tra dữ liệu",
    description:
      "Mọi câu hỏi về trường, học phí, học bổng và điều kiện đầu vào đều phải gọi lớp dữ liệu trước.",
    icon: ShieldCheck,
  },
  {
    title: "Cuộc trò chuyện tự gom thành hồ sơ",
    description:
      "Ngân sách, GPA, mục tiêu quốc gia và yêu cầu tư vấn sâu được lưu ngay trong session.",
    icon: Orbit,
  },
  {
    title: "Counselor chỉ xuất hiện đúng lúc",
    description:
      "Khi bạn thực sự cần hỗ trợ sâu, admin nhận được toàn bộ ngữ cảnh trước khi liên hệ.",
    icon: Headset,
  },
];

export default function ChatPage() {
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

  const [draft, setDraft] = useState("");
  const pendingLeadRef = useRef<Partial<LeadData> | null>(null);
  const [supportRequested, setSupportRequested] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportName, setSupportName] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

  const prevStatus = useRef(status);

  useEffect(() => {
    const wasStreaming =
      prevStatus.current === "streaming" || prevStatus.current === "submitted";
    const isNowReady = status === "ready";

    if (wasStreaming && isNowReady && messages.length > 0 && sessionId) {
      const now = Date.now();
      const toStore = messages.map((message, index) => ({
        id: message.id,
        role: message.role,
        parts: message.parts,
        createdAt: new Date(now - (messages.length - 1 - index) * 1000).toISOString(),
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
      // Ignore request errors in the UI.
    } finally {
      setSupportLoading(false);
    }
  }

  function handleSend() {
    const text = draft.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    sendMessage({ text });
    setDraft("");
  }

  const chatStarted = messages.length > 0;
  const isGenerating = status === "streaming" || status === "submitted";

  return (
    <div className="min-h-screen pb-6">
      <header className="page-wrap py-6">
        <div className="saas-card flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon-sm">
              <Link href="/">
                <ArrowLeft />
                <span className="sr-only">Về trang chủ</span>
              </Link>
            </Button>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Lotus Counsel chat
              </p>
              <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-foreground">
                Một cuộc hội thoại bắt đầu từ dữ liệu thật.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">
              {chatStarted ? "Session đang hoạt động" : "Sẵn sàng bắt đầu"}
            </Badge>
            <Button asChild variant="outline">
              <Link href="/schools">Mở school directory</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="page-wrap grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden xl:grid xl:content-start xl:gap-4">
          <div className="saas-card overflow-hidden p-5">
            <Badge variant="outline" className="w-fit">
              Student briefing
            </Badge>
            <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.05em] text-foreground">
              Chat như một buổi định hướng, không như một form hỏi cung.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Bạn có thể bắt đầu rất ngắn: GPA, ngân sách, quốc gia ưu tiên hoặc đơn
              giản chỉ là “mình muốn tìm trường phù hợp”. Hệ thống sẽ kéo thông tin thật
              để trả lời và lưu bối cảnh cho lần follow-up sau.
            </p>
          </div>

          {sideNotes.map((note) => {
            const Icon = note.icon;

            return (
              <div key={note.title} className="saas-card card-lift p-5">
                <div className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                  <Icon className="size-5 text-primary" />
                </div>
                <p className="mt-4 text-lg font-semibold tracking-[-0.03em] text-foreground">
                  {note.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {note.description}
                </p>
              </div>
            );
          })}
        </aside>

        <section className="saas-panel flex min-h-[78vh] flex-col overflow-hidden">
          <div className="border-b border-border/70 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="section-kicker">Conversation desk</div>
                <p className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
                  Tư vấn du học dựa trên hồ sơ và context thật.
                </p>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Bắt đầu với form gợi ý hoặc nhắn trực tiếp. Khi AI cần hỏi thêm, nó sẽ
                  dùng các câu hỏi dạng lựa chọn để hội thoại không bị loãng.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="outline">
                  <MessageSquareDot data-icon="inline-start" />
                  {chatStarted ? `${messages.length} tin nhắn` : "Chưa có tin nhắn"}
                </Badge>
                <Badge variant="secondary">
                  <Sparkles data-icon="inline-start" />
                  {isGenerating ? "AI đang phản hồi" : "AI sẵn sàng"}
                </Badge>
              </div>
            </div>

            {chatStarted ? (
              <div className="mt-5 rounded-[1.4rem] border border-border/80 bg-secondary/35 p-4">
                {supportRequested ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Đã gửi yêu cầu tư vấn chuyên sâu.
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Đội tư vấn sẽ nhận toàn bộ session này kèm thông tin liên hệ của bạn.
                      </p>
                    </div>
                    <Badge variant="secondary">Đã gửi</Badge>
                  </div>
                ) : showSupportForm ? (
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Họ và tên</span>
                      <input
                        type="text"
                        value={supportName}
                        onChange={(event) => setSupportName(event.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="saas-input"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">
                        Số điện thoại
                      </span>
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(event) => setSupportPhone(event.target.value)}
                        placeholder="09xx xxx xxx"
                        className="saas-input"
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            supportName.trim() &&
                            supportPhone.trim()
                          ) {
                            handleRequestSupport();
                          }
                        }}
                      />
                    </label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSupportForm(false)}
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="button"
                        className="gradient-btn border-0"
                        disabled={
                          supportLoading ||
                          !supportName.trim() ||
                          !supportPhone.trim()
                        }
                        onClick={handleRequestSupport}
                      >
                        {supportLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Cần người thật vào cuộc?
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Gửi yêu cầu tư vấn chuyên sâu để counselor nhận đầy đủ bối cảnh từ
                        cuộc trò chuyện hiện tại.
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="gradient-btn border-0"
                      onClick={() => setShowSupportForm(true)}
                    >
                      Yêu cầu tư vấn chuyên sâu
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            {!chatStarted ? (
              <PreChatForm onSubmit={handleFormSubmit} />
            ) : (
              <ChatView
                messages={messages as ChatMessage[]}
                mode="live"
                onToolOutput={(toolCallId, value) =>
                  addToolOutput({ tool: "ask_user", toolCallId, output: value })
                }
                inputSlot={
                  <div className="p-4 sm:p-5">
                    <div className="rounded-[1.45rem] border border-border/80 bg-background/88 p-3 shadow-[0_18px_40px_-30px_rgb(15_23_42/0.3)]">
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Nhắn nội dung bạn muốn hỏi về trường, ngành, học bổng hoặc lộ trình..."
                        rows={1}
                        className="min-h-20 w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            if (isGenerating) {
                              stop();
                              return;
                            }
                            handleSend();
                          }
                        }}
                      />
                      <div className="mt-2 flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-muted-foreground">
                          `Enter` để gửi. `Shift + Enter` để xuống dòng.
                        </p>
                        <div className="flex gap-3">
                          {isGenerating ? (
                            <Button type="button" variant="outline" onClick={stop}>
                              Dừng phản hồi
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            className="gradient-btn border-0"
                            disabled={!draft.trim()}
                            onClick={handleSend}
                          >
                            Gửi tin nhắn
                            <ArrowRight data-icon="inline-end" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
