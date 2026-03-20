"use client";

import { useEffect, useRef, useState } from "react";
import { Send, SkipForward } from "lucide-react";

interface AskUserModalProps {
  question: string;
  type: "single_select" | "multi_select";
  options: string[];
  onSubmit: (value: string) => void;
  onSkip: () => void;
}

export function AskUserModal({
  question,
  type,
  options,
  onSubmit,
  onSkip,
}: AskUserModalProps) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const otherRef = useRef<HTMLInputElement>(null);

  // Slide-up animation on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleOption(opt: string) {
    if (type === "single_select") {
      onSubmit(opt);
    } else {
      setSelected((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    }
  }

  function handleConfirmMulti() {
    if (!selected.length) return;
    onSubmit(selected.join(", "));
  }

  function handleOtherSubmit() {
    const val = other.trim();
    if (!val) return;
    onSubmit(val);
  }

  function handleOtherKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleOtherSubmit();
    }
  }

  const canConfirmMulti = type === "multi_select" && selected.length > 0;

  return (
    <>
      {/* Backdrop — dims the messages behind */}
      <div
        className={`absolute inset-x-0 bottom-full h-[200vh] bg-background/70 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl border-t border-gray-200 dark:border-zinc-700 px-5 pt-4 pb-6">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

          {/* Question */}
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 leading-snug">
            {question}
          </p>

          {/* Option pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {options.map((opt) => {
              const isChosen = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => handleOption(opt)}
                  className={`px-3.5 py-2 rounded-full text-sm border font-medium transition-all cursor-pointer active:scale-95 ${
                    isChosen
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* "Other answer" input */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl px-3.5 py-2.5 border border-gray-200 dark:border-zinc-700 mb-4">
            <input
              ref={otherRef}
              type="text"
              value={other}
              onChange={(e) => setOther(e.target.value)}
              onKeyDown={handleOtherKey}
              placeholder="Hoặc nhập câu trả lời khác…"
              className="flex-1 bg-transparent text-sm text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
            />
            {other.trim() && (
              <button
                onClick={handleOtherSubmit}
                className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95"
              >
                <Send size={13} />
              </button>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
            >
              <SkipForward size={13} />
              Bỏ qua
            </button>

            {canConfirmMulti && (
              <button
                onClick={handleConfirmMulti}
                className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 active:scale-95 transition-all"
              >
                Xác nhận ({selected.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
