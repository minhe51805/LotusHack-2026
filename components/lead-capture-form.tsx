"use client";

import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type LeadCaptureFormProps = {
  pagePath: string;
  title?: string;
  description?: string;
  className?: string;
};

const interestOptions = [
  "Luyện thi IELTS",
  "Luyện thi TOEFL",
  "Digital SAT",
  "ACT / AP / IB",
  "Tư vấn săn học bổng",
  "Tư vấn tổng quát",
];

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  interest: interestOptions[0],
  note: "",
};

type SubmissionState =
  | {
      kind: "idle";
      message: string;
    }
  | {
      kind: "success";
      message: string;
    }
  | {
      kind: "error";
      message: string;
    };

export function LeadCaptureForm({
  pagePath,
  title = "Đăng ký tư vấn",
  description = "Để lại thông tin để đội ngũ tư vấn liên hệ và gợi ý lộ trình học phù hợp với mục tiêu của bạn.",
  className,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<SubmissionState>({
    kind: "idle",
    message: "",
  });
  const [isPending, startTransition] = useTransition();

  const helperText = useMemo(() => {
    if (status.kind === "success") {
      return status.message;
    }

    if (status.kind === "error") {
      return status.message;
    }

    return "Vui lòng điền họ tên, số điện thoại và nhu cầu quan tâm. Email và ghi chú là tùy chọn.";
  }, [status]);

  return (
    <Card
      className={cn(
        "overflow-hidden border border-primary/10 bg-white shadow-xl shadow-primary/10",
        className,
      )}
    >
      <CardHeader className="border-b border-primary/10 bg-gradient-to-br from-amber-50 via-white to-red-50">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <form
          className="grid gap-4 lg:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();

            startTransition(async () => {
              setStatus({ kind: "idle", message: "" });

              try {
                const response = await fetch("/api/leads", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...form,
                    pagePath,
                  }),
                });

                const payload = (await response.json()) as {
                  ok: boolean;
                  message?: string;
                  errors?: Record<string, string[]>;
                  storage?: string;
                };

                if (!response.ok || !payload.ok) {
                  const fieldError = payload.errors
                    ? Object.values(payload.errors).flat().filter(Boolean).at(0)
                    : undefined;

                  setStatus({
                    kind: "error",
                    message:
                      fieldError ||
                      payload.message ||
                      "Không thể lưu yêu cầu. Vui lòng kiểm tra lại thông tin và thử lại.",
                  });
                  return;
                }

                setStatus({
                  kind: "success",
                  message:
                    payload.storage === "supabase"
                      ? "Thông tin đã được lưu vào Supabase thành công."
                      : "Thông tin đã được lưu cục bộ. Có thể thêm env Supabase và Resend để dùng luồng production.",
                });
                setForm(initialState);
              } catch (error) {
                console.error("Lead submission failed", error);
                setStatus({
                  kind: "error",
                  message: "Đã xảy ra lỗi mạng khi gửi biểu mẫu.",
                });
              }
            });
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lead-full-name">
              Họ và tên
            </label>
            <Input
              id="lead-full-name"
              required
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lead-phone">
              Số điện thoại
            </label>
            <Input
              id="lead-phone"
              required
              inputMode="tel"
              placeholder="0900 123 456"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lead-email">
              Email
            </label>
            <Input
              id="lead-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lead-interest">
              Chương trình quan tâm
            </label>
            <select
              id="lead-interest"
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-slate-900 outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/30"
              value={form.interest}
              onChange={(event) =>
                setForm((current) => ({ ...current, interest: event.target.value }))
              }
            >
              {interestOptions.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lead-note">
              Thông tin thêm
            </label>
            <Textarea
              id="lead-note"
              placeholder="Chia sẻ mục tiêu band điểm, kế hoạch du học hoặc nhu cầu học hiện tại."
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between">
            <p
              className={cn("text-sm leading-6 text-muted-foreground", {
                "text-emerald-700": status.kind === "success",
                "text-destructive": status.kind === "error",
              })}
            >
              {helperText}
            </p>
            <Button type="submit" disabled={isPending} className="min-w-44">
              {isPending ? "Đang gửi..." : "Gửi thông tin"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
