"use client";

import { useEffect, useState } from "react";
import { Save, RotateCcw, CheckCircle } from "lucide-react";

const DEFAULT_PROMPT = `Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

Nhiệm vụ: Tư vấn học sinh THPT/Đại học chọn khóa học phù hợp và mời họ đến văn phòng.

## Khóa học
IELTS, TOEFL, SAT, ACT, AP, IB, GED, SSAT/ISEE, AMP (viết luận học bổng), Model UN.

## Quy trình (tuần tự, mỗi lượt hỏi tối đa 1 câu)
1. Chào hỏi, hỏi lớp/năm học
2. Hỏi kỳ thi mục tiêu → dùng ask_user (single_select)
3. Hỏi trình độ hiện tại → dùng ask_user (single_select)
4. Hỏi timeline và mục tiêu du học
5. Tư vấn khóa học phù hợp, xử lý phản đối
6. Thu thập tên + SĐT, gọi save_lead, chốt lịch hẹn

## Xử lý lo ngại lừa đảo
Thừa nhận nỗi lo là hợp lý. Nêu bằng chứng: pháp nhân rõ ràng, 20+ năm, báo chí uy tín, mời tham quan văn phòng miễn phí trước khi đăng ký.

## Tools
- ask_user: dùng khi câu hỏi có lựa chọn cố định (kỳ thi, trình độ, timeline, v.v.)
- search_schools: khi hỏi yêu cầu đầu vào của trường cụ thể
- save_lead: khi đã có tên + SĐT, hoặc khi kết thúc hội thoại

## Nguyên tắc
- Trả lời tiếng Việt (trừ khi học sinh dùng tiếng Anh)
- Thân thiện, ngắn gọn — không quá 3 câu mỗi lượt
- Không hứa điểm số cụ thể, không bịa học phí`;

export default function SettingsPage() {
  const [prompt, setPrompt] = useState("");
  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setPrompt(data.systemPrompt ?? "");
        setOriginal(data.systemPrompt ?? "");
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
        body: JSON.stringify({ systemPrompt: prompt }),
      });
      setOriginal(prompt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPrompt(DEFAULT_PROMPT);
  }

  const isDirty = prompt !== original;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              Configure the AI system prompt used in the chat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw size={12} />
              Reset to default
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {saved ? (
                <>
                  <CheckCircle size={12} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={12} />
                  {saving ? "Saving…" : "Save"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="max-w-3xl">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
              System Prompt
            </label>
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {prompt.length} chars
            </span>
          </div>

          {loading ? (
            <div className="w-full h-96 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          ) : (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={28}
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 px-4 py-3 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter your system prompt here…"
              spellCheck={false}
            />
          )}

          <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
            This prompt is sent to the AI at the start of every conversation. Changes take effect immediately for new messages.
          </p>

          {isDirty && !saved && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              Unsaved changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
