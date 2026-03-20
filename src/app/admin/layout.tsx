"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings, MessageSquare, RefreshCw, GlobeIcon, BookOpenIcon, SparklesIcon } from "lucide-react";

interface SessionSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: { role: string }[];
  lead?: { full_name?: string; target_exam?: string } | null;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

  const isSettings = pathname === "/admin/settings";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-950 overflow-hidden">
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
          <button
            onClick={fetchSessions}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Sessions label */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
            Sessions ({sessions.length})
          </p>
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
            sessions.map((s) => {
              const isActive = pathname === `/admin/${s.id}`;
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
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MessageSquare
                        size={12}
                        className={
                          isActive
                            ? "text-blue-600 shrink-0"
                            : "text-gray-400 shrink-0"
                        }
                      />
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
