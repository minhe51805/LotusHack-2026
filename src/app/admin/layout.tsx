"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Settings,
  MessageSquare,
  RefreshCw,
  GlobeIcon,
  BookOpenIcon,
  SparklesIcon,
  Bell,
  BellOff,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SessionSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: string }[];
  lead?: { full_name?: string; target_exam?: string } | null;
  needsSupport?: boolean;
}

interface Toast {
  id: number;
  message: string;
  type: "session" | "lead" | "support";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSummary(row: any): SessionSummary {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: row.messages ?? [],
    lead: row.lead ?? null,
    needsSupport: row.needs_support ?? false,
  };
}

let toastCounter = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveSessions, setLiveSessions] = useState<Set<string>>(new Set());
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notificationsRef = useRef(false);

  // ── Keep ref in sync with state ──────────────────────────────────────────
  useEffect(() => {
    notificationsRef.current = notificationsOn;
  }, [notificationsOn]);

  // ── Load saved notification preference ───────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("etest-admin-notify") === "true";
    setNotificationsOn(saved);
    notificationsRef.current = saved;
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function addToast(message: string, type: Toast["type"]) {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function fireNativeNotif(title: string, body: string) {
    if (typeof window !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }

  function markLive(id: string) {
    setLiveSessions((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setLiveSessions((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 5 * 60 * 1000);
  }

  // ── Initial fetch ─────────────────────────────────────────────────────────
  async function fetchSessions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      setSessions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  // ── Supabase Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-sessions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sessions" },
        (payload) => {
          const session = rowToSummary(payload.new);
          setSessions((prev) => [session, ...prev]);
          markLive(session.id);
          if (notificationsRef.current) {
            addToast("New chat session started", "session");
            fireNativeNotif("ETEST Admin", "New chat session started");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sessions" },
        (payload) => {
          const session = rowToSummary(payload.new);
          setSessions((prev) =>
            prev
              .map((s) => (s.id === session.id ? session : s))
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )
          );
          markLive(session.id);

          // Detect when a lead is first captured
          const hadLead = payload.old?.lead;
          const newLead = payload.new?.lead;
          if (!hadLead && newLead && notificationsRef.current) {
            const name = newLead.full_name ?? "Unknown";
            const exam = newLead.target_exam ? ` (${newLead.target_exam})` : "";
            const msg = `New lead: ${name}${exam}`;
            addToast(msg, "lead");
            fireNativeNotif("ETEST Admin – New Lead!", msg);
          }

          // Detect needs_support flip false → true
          const wasSupport = payload.old?.needs_support;
          const nowSupport = payload.new?.needs_support;
          if (!wasSupport && nowSupport) {
            const name = payload.new?.lead?.full_name ?? "Khách hàng";
            const msg = `⚡ ${name} cần tư vấn chuyên sâu!`;
            addToast(msg, "support");
            fireNativeNotif("INV – Hỗ trợ ngay!", msg);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Notification toggle ───────────────────────────────────────────────────
  async function toggleNotifications() {
    if (notificationsOn) {
      setNotificationsOn(false);
      localStorage.setItem("etest-admin-notify", "false");
      return;
    }

    // Request browser permission if needed
    if ("Notification" in window && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        // Still enable in-app toasts even if browser denied
      }
    }

    setNotificationsOn(true);
    localStorage.setItem("etest-admin-notify", "true");
    addToast("Notifications enabled", "session");
  }

  const isSettings = pathname === "/admin/settings";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 overflow-hidden">
      {/* Toast stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl shadow-lg text-sm max-w-xs animate-in slide-in-from-bottom-2 fade-in duration-200 ${
              t.type === "support"
                ? "bg-red-600 text-white"
                : t.type === "lead"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-white dark:bg-zinc-700"
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 opacity-70 hover:opacity-100 mt-0.5"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <aside className="w-72 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              ETEST Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleNotifications}
              title={notificationsOn ? "Disable notifications" : "Enable notifications"}
              className={`p-1.5 rounded-md transition-colors ${
                notificationsOn
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              {notificationsOn ? <Bell size={14} /> : <BellOff size={14} />}
            </button>
            <button
              onClick={fetchSessions}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Sessions label */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            Sessions ({sessions.length})
          </p>
          {liveSessions.size > 0 && (
            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              {liveSessions.size} live
            </span>
          )}
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
              Loading...
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
              No sessions yet
            </div>
          ) : (
            [...sessions]
              .sort((a, b) => {
                if (a.needsSupport && !b.needsSupport) return -1;
                if (!a.needsSupport && b.needsSupport) return 1;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
              })
              .map((s) => {
              const isActive = pathname === `/admin/${s.id}`;
              const isLive = liveSessions.has(s.id);
              const msgCount = s.messages?.length ?? 0;
              const name = s.lead?.full_name;
              const exam = s.lead?.target_exam;

              return (
                <Link
                  key={s.id}
                  href={`/admin/${s.id}`}
                  className={`block px-4 py-3 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/40 border-l-2 border-l-blue-600"
                      : s.needsSupport
                      ? "border-l-2 border-l-red-500 bg-red-50/40 dark:bg-red-950/20"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isLive ? (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                        </span>
                      ) : (
                        <MessageSquare
                          size={12}
                          className={
                            isActive
                              ? "text-blue-600 shrink-0"
                              : "text-gray-400 shrink-0"
                          }
                        />
                      )}
                      <p
                        className={`text-xs font-medium truncate ${
                          isActive
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-gray-700 dark:text-zinc-300"
                        }`}
                      >
                        {name ?? s.id.slice(0, 16) + "…"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
                      {formatTime(s.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 ml-4">
                    {exam && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        {exam}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 dark:text-zinc-500">
                      {msgCount} msg{msgCount !== 1 ? "s" : ""}
                    </span>
                    {s.lead?.full_name && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ● Lead
                      </span>
                    )}
                    {s.needsSupport && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-semibold animate-pulse">
                        ⚡ Support
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Content nav */}
        <div className="border-t border-gray-200 dark:border-zinc-800 px-3 pt-3 pb-1">
          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-2 mb-2">
            Content
          </p>
          {[
            { href: "/admin/schools", icon: GlobeIcon, label: "Schools" },
            { href: "/admin/courses", icon: BookOpenIcon, label: "Courses" },
            { href: "/admin/services", icon: SparklesIcon, label: "Services" },
          ].map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-zinc-800 p-3 space-y-1">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              isSettings
                ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Settings size={15} />
            Settings & Prompt
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors"
            target="_blank"
          >
            <MessageSquare size={15} />
            Open Chat ↗
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
