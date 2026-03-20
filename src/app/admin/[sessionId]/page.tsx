"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { User, Bot, Calendar, Hash, Phone, Mail, BookOpen, Target, Clock, StickyNote, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface MessagePart {
  type: string;
  text?: string;
  toolCallId?: string;
  state?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  question?: string;
  options?: string[];
}

interface Message {
  id: string;
  role: string;
  parts: MessagePart[];
}

interface LeadData {
  full_name?: string;
  phone?: string;
  email?: string;
  grade_or_year?: string;
  target_exam?: string;
  target_score?: string;
  timeline_months?: number;
  study_abroad_goal?: string;
  current_english_level?: string;
  prior_experience?: string;
  main_concern?: string;
  preferred_meeting_time?: string;
  notes?: string;
}

interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  lead?: LeadData | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function levelLabel(level?: string) {
  const map: Record<string, string> = {
    beginner: "Mới bắt đầu",
    elementary: "Cơ bản",
    intermediate: "Trung cấp",
    "upper-intermediate": "Khá",
    advanced: "Nâng cao",
    unknown: "Chưa đánh giá",
  };
  return level ? (map[level] ?? level) : "—";
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-1 mb-0.5">
          {!isUser && <Bot size={12} className="text-gray-400" />}
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {isUser ? "User" : "Assistant"}
          </span>
          {isUser && <User size={12} className="text-gray-400" />}
        </div>

        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text?.trim()) {
            return (
              <div
                key={i}
                className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
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
            const input = part.input as { question?: string; type?: string; options?: string[] } | undefined;
            if (part.state === "output-available") {
              return (
                <div key={i} className="flex flex-col gap-1 items-start">
                  {input?.question && (
                    <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm text-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 shadow-sm text-gray-600 dark:text-zinc-300">
                      {input.question}
                    </div>
                  )}
                  <div className="px-3.5 py-2 rounded-2xl rounded-br-sm text-sm bg-blue-600 text-white self-end">
                    {String(part.output)}
                  </div>
                </div>
              );
            }
            return null;
          }

          if (part.type === "tool-save_lead" && part.state === "output-available") {
            return (
              <div key={i} className="px-3.5 py-2 rounded-2xl text-xs bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                ✓ Lead saved
              </div>
            );
          }

          if (part.type === "tool-search_schools" && part.state === "output-available") {
            return (
              <div key={i} className="px-3.5 py-2 rounded-2xl text-xs bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400">
                ✓ Schools searched
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

export default function SessionPage(props: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(props.params);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/sessions/${sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500 dark:text-zinc-400">Session not found.</p>
        <Link href="/admin" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={12} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const { lead } = session;
  const msgCount = session.messages.length;

  const metaRows = [
    { icon: Hash, label: "Session ID", value: session.id },
    { icon: Calendar, label: "Started", value: formatDateTime(session.createdAt) },
    { icon: Clock, label: "Last active", value: formatDateTime(session.updatedAt) },
    { icon: BookOpen, label: "Messages", value: String(msgCount) },
  ];

  const leadRows = lead
    ? [
        { icon: User, label: "Name", value: lead.full_name },
        { icon: Phone, label: "Phone", value: lead.phone },
        { icon: Mail, label: "Email", value: lead.email },
        { icon: BookOpen, label: "Grade / Year", value: lead.grade_or_year },
        { icon: Target, label: "Target exam", value: lead.target_exam },
        { icon: Target, label: "Target score", value: lead.target_score },
        { icon: Clock, label: "Timeline", value: lead.timeline_months ? `${lead.timeline_months} months` : undefined },
        { icon: BookOpen, label: "English level", value: levelLabel(lead.current_english_level) },
        { icon: StickyNote, label: "Goal", value: lead.study_abroad_goal },
        { icon: StickyNote, label: "Concern", value: lead.main_concern },
        { icon: Clock, label: "Preferred time", value: lead.preferred_meeting_time },
        { icon: StickyNote, label: "Notes", value: lead.notes },
      ].filter((r) => r.value)
    : [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-3.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {lead?.full_name ?? "Unknown user"}
          </p>
          <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono mt-0.5">
            {session.id}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-gray-50 dark:bg-zinc-950">
          {session.messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      {/* Metadata panel */}
      <aside className="w-72 shrink-0 flex flex-col border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
        {/* Session info */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-zinc-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Session Info
          </p>
          <div className="space-y-2.5">
            {metaRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-2 items-start">
                <Icon size={13} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 dark:text-zinc-500">{label}</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 break-all">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead info */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Lead Info
            </p>
            {lead ? (
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">
                Captured
              </span>
            ) : (
              <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                Not captured
              </span>
            )}
          </div>

          {leadRows.length > 0 ? (
            <div className="space-y-2.5">
              {leadRows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-2 items-start">
                  <Icon size={13} className="text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">{label}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 break-words">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              No lead data collected yet.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
