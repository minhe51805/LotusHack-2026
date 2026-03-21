"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw, CheckCircle } from "lucide-react";
import { DEFAULT_USER_PROMPT } from "@/lib/prompt-defaults";

export default function SettingsPage() {
  const [prompt, setPrompt] = useState("");
  const [zaloPrompt, setZaloPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [originalZaloPrompt, setOriginalZaloPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setPrompt(data.systemPrompt ?? "");
        setZaloPrompt(data.zaloSystemPrompt ?? data.systemPrompt ?? "");
        setOriginal(data.systemPrompt ?? "");
        setOriginalZaloPrompt(data.zaloSystemPrompt ?? data.systemPrompt ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: prompt,
          zaloSystemPrompt: zaloPrompt,
        }),
      });
      setOriginal(prompt);
      setOriginalZaloPrompt(zaloPrompt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  const isDirty = prompt !== original || zaloPrompt !== originalZaloPrompt;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              Cài đặt & Prompt
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              Cấu hình prompt riêng cho web và Zalo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrompt(DEFAULT_USER_PROMPT)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={12} />
              Reset prompt web
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {saved ? (
                <>
                  <CheckCircle size={12} />
                  Đã lưu
                </>
              ) : (
                <>
                  <Save size={12} />
                  {saving ? "Đang lưu…" : "Lưu"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-3xl space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Web System Prompt
                </label>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                  Prompt dùng cho web chat và admin chat hiện tại.
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
                {prompt.length} ký tự
              </span>
            </div>

            {loading ? (
              <div className="w-full h-80 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={18}
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 px-4 py-3 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Nhập web system prompt tại đây…"
                spellCheck={false}
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Zalo System Prompt
                </label>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                  Prompt riêng cho Zalo. Nếu để giống web, hãy dán hoặc đồng bộ theo ý bạn.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setZaloPrompt(prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw size={12} />
                  Đồng bộ từ web
                </button>
                <span className="text-xs text-gray-400 dark:text-zinc-500">
                  {zaloPrompt.length} ký tự
                </span>
              </div>
            </div>

            {loading ? (
              <div className="w-full h-80 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ) : (
              <textarea
                value={zaloPrompt}
                onChange={(e) => setZaloPrompt(e.target.value)}
                rows={18}
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 px-4 py-3 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Nhập Zalo system prompt tại đây…"
                spellCheck={false}
              />
            )}
          </div>

          <div className="flex items-center justify-between mb-1.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Prompt mặc định
              </label>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                Nút reset hiện đặt lại prompt web về mặc định trong source code.
              </p>
            </div>
            <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
              Web: {prompt.length} · Zalo: {zaloPrompt.length}
            </span>
          </div>

          {isDirty && !saved && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Chưa lưu thay đổi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
