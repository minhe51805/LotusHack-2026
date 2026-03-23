"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function handleOption(option: string) {
    if (type === "single_select") {
      onSubmit(option);
      return;
    }

    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((entry) => entry !== option)
        : [...prev, option],
    );
  }

  function handleConfirmMulti() {
    if (!selected.length) return;
    onSubmit(selected.join(", "));
  }

  function handleOtherSubmit() {
    const value = other.trim();
    if (!value) return;
    onSubmit(value);
  }

  function handleOtherKey(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleOtherSubmit();
    }
  }

  const canConfirmMulti = type === "multi_select" && selected.length > 0;

  return (
    <>
      <div
        className={`absolute inset-0 bg-background/60 backdrop-blur-[3px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="saas-panel rounded-b-none border-x-0 border-b-0 px-5 pb-6 pt-4 shadow-[0_-24px_70px_-30px_rgb(15_23_42/0.3)]">
          <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-border" />

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="section-kicker">One quick question</p>
              <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                {question}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const chosen = selected.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleOption(option)}
                    className={`saas-chip ${
                      chosen ? "saas-chip-active" : ""
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.2rem] border border-border bg-background/88 p-3">
              <input
                ref={otherRef}
                type="text"
                value={other}
                onChange={(event) => setOther(event.target.value)}
                onKeyDown={handleOtherKey}
                placeholder="Hoặc nhập câu trả lời của bạn..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={onSkip}>
                <SkipForward data-icon="inline-start" />
                Bỏ qua
              </Button>

              <div className="flex gap-3">
                {other.trim() ? (
                  <Button
                    type="button"
                    className="gradient-btn border-0"
                    onClick={handleOtherSubmit}
                  >
                    Gửi câu trả lời
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : null}

                {canConfirmMulti ? (
                  <Button
                    type="button"
                    className="gradient-btn border-0"
                    onClick={handleConfirmMulti}
                  >
                    Xác nhận ({selected.length})
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
