"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Plus,
  School,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Certification, LeadData } from "@/lib/data";

const CERT_TYPES = [
  "IELTS",
  "SAT",
  "ACT",
  "PTE",
  "TOEFL",
  "TOEIC",
  "GRE",
  "GMAT",
] as const;
const COUNTRIES = [
  "Úc",
  "Canada",
  "Anh",
  "Mỹ",
  "New Zealand",
  "Singapore",
  "Nhật Bản",
  "Châu Âu",
  "Khác",
] as const;
const BUDGET_OPTIONS = [
  { label: "< $20,000/năm", value: 15000 },
  { label: "$20,000 – $30,000/năm", value: 25000 },
  { label: "$30,000 – $50,000/năm", value: 40000 },
  { label: "> $50,000/năm", value: 55000 },
];

const MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const YEARS = Array.from({ length: 8 }, (_, index) => String(2020 + index));

interface PreChatFormProps {
  onSubmit: (messageSummary: string, lead: Partial<LeadData>) => void;
}

function buildSummary(
  age: string,
  school: string,
  gpa: string,
  certs: Certification[],
  fieldOfStudy: string,
  countries: string[],
  budgetValue: number | null,
): string {
  const lines: string[] = ["[Hồ sơ của tôi]"];

  const basicParts = [
    age ? `Tuổi: ${age}` : null,
    school ? `Trường: ${school}` : null,
    gpa ? `GPA: ${gpa}` : null,
  ].filter(Boolean);
  if (basicParts.length) lines.push(`• ${basicParts.join(" | ")}`);

  if (certs.length) {
    const certStr = certs
      .filter((cert) => cert.type && cert.score)
      .map((cert) => `${cert.type} ${cert.score}${cert.date ? ` (${cert.date})` : ""}`)
      .join(", ");
    if (certStr) lines.push(`• Chứng chỉ: ${certStr}`);
  }

  if (fieldOfStudy) lines.push(`• Ngành mục tiêu: ${fieldOfStudy}`);
  if (countries.length) lines.push(`• Quốc gia ưu tiên: ${countries.join(", ")}`);
  if (budgetValue) {
    const option = BUDGET_OPTIONS.find((item) => item.value === budgetValue);
    lines.push(`• Ngân sách: ~${option?.label ?? `$${budgetValue.toLocaleString()}/năm`}`);
  }

  lines.push("");
  lines.push("Dựa trên hồ sơ này, hãy gợi ý các trường và học bổng phù hợp nhất cho tôi.");
  return lines.join("\n");
}

export function PreChatForm({ onSubmit }: PreChatFormProps) {
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [gpa, setGpa] = useState("");
  const [certs, setCerts] = useState<Certification[]>([]);
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [budgetValue, setBudgetValue] = useState<number | null>(null);

  function addCert() {
    setCerts((prev) => [...prev, { type: "", score: "", date: "" }]);
  }

  function removeCert(index: number) {
    setCerts((prev) => prev.filter((_, certIndex) => certIndex !== index));
  }

  function updateCert(index: number, field: keyof Certification, value: string) {
    setCerts((prev) =>
      prev.map((cert, certIndex) =>
        certIndex === index ? { ...cert, [field]: value } : cert,
      ),
    );
  }

  function toggleCountry(country: string) {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((entry) => entry !== country)
        : [...prev, country],
    );
  }

  function handleSubmit() {
    const summary = buildSummary(
      age,
      school,
      gpa,
      certs,
      fieldOfStudy,
      selectedCountries,
      budgetValue,
    );

    const lead: Partial<LeadData> = {};
    if (age) lead.age = Number(age);
    if (school) lead.current_school = school;
    if (gpa) lead.gpa = gpa;
    if (certs.filter((cert) => cert.type && cert.score).length) {
      lead.certifications = certs.filter((cert) => cert.type && cert.score);
    }
    if (fieldOfStudy) lead.field_of_study = fieldOfStudy;
    if (selectedCountries.length) lead.priority_countries = selectedCountries;
    if (budgetValue) lead.budget_usd = budgetValue;

    onSubmit(summary, lead);
  }

  const hasAnyData =
    age ||
    school ||
    gpa ||
    certs.some((cert) => cert.type || cert.score) ||
    fieldOfStudy ||
    selectedCountries.length ||
    budgetValue;

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
      <div className="grid gap-4">
        <section className="saas-card overflow-hidden p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-4">
              <div className="section-kicker">Warm start</div>
              <div className="space-y-3">
                <h2 className="text-3xl leading-tight font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
                  Cho AI một chút context để gợi ý trường chính xác hơn ngay từ câu đầu.
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Bạn không cần điền hết. Chỉ một vài tín hiệu như GPA, ngành, quốc gia
                  hoặc ngân sách cũng đủ để hệ thống bắt đầu gợi ý.
                </p>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border/80 bg-secondary/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Toàn bộ dữ liệu này sẽ đi kèm session để counselor xem lại khi cần.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="saas-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
              <School className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Thông tin cơ bản
              </p>
              <p className="text-sm text-muted-foreground">
                Đây là những tín hiệu giúp AI định vị mặt bằng hồ sơ của bạn.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Tuổi</span>
              <input
                type="number"
                min={10}
                max={60}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="17"
                className="saas-input"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Trường hiện tại</span>
              <input
                type="text"
                value={school}
                onChange={(event) => setSchool(event.target.value)}
                placeholder="THPT Nguyễn Du, ĐH Bách Khoa..."
                className="saas-input"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-foreground">GPA</span>
            <input
              type="text"
              value={gpa}
              onChange={(event) => setGpa(event.target.value)}
              placeholder="8.5/10 hoặc 3.7/4.0"
              className="saas-input"
            />
          </label>
        </section>

        <section className="saas-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                <BadgeCheck className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                  Chứng chỉ đã có
                </p>
                <p className="text-sm text-muted-foreground">
                  Có thể bỏ qua hoàn toàn nếu bạn chưa thi.
                </p>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={addCert}>
              <Plus data-icon="inline-start" />
              Thêm chứng chỉ
            </Button>
          </div>

          {certs.length === 0 ? (
            <div className="mt-5 rounded-[1.2rem] border border-dashed border-border bg-secondary/20 px-4 py-5 text-sm text-muted-foreground">
              Chưa có chứng chỉ nào. Bạn vẫn có thể bắt đầu tư vấn ngay.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {certs.map((cert, index) => (
                <div
                  key={`${index}-${cert.type}-${cert.score}`}
                  className="rounded-[1.4rem] border border-border/80 bg-secondary/25 p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {CERT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateCert(index, "type", type)}
                        className={`saas-chip ${cert.type === type ? "saas-chip-active" : ""}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Điểm</span>
                      <input
                        type="text"
                        value={cert.score}
                        onChange={(event) => updateCert(index, "score", event.target.value)}
                        placeholder={
                          cert.type === "IELTS"
                            ? "6.5"
                            : cert.type === "SAT"
                              ? "1350"
                              : "Điểm"
                        }
                        className="saas-input"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Tháng</span>
                      <select
                        value={cert.date.split("/")[0] ?? ""}
                        onChange={(event) => {
                          const year = cert.date.split("/")[1] ?? "";
                          updateCert(index, "date", `${event.target.value}/${year}`);
                        }}
                        className="saas-input h-full"
                      >
                        <option value="">MM</option>
                        {MONTHS.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-foreground">Năm</span>
                      <select
                        value={cert.date.split("/")[1] ?? ""}
                        onChange={(event) => {
                          const month = cert.date.split("/")[0] ?? "";
                          updateCert(index, "date", `${month}/${event.target.value}`);
                        }}
                        className="saas-input h-full"
                      >
                        <option value="">YYYY</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => removeCert(index)}
                      >
                        <X />
                        <span className="sr-only">Xoá chứng chỉ</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="saas-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
              <Globe2 className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Định hướng học tập
              </p>
              <p className="text-sm text-muted-foreground">
                Càng rõ ngành và quốc gia, kết quả càng gần nhu cầu của bạn.
              </p>
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-foreground">Ngành học mục tiêu</span>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(event) => setFieldOfStudy(event.target.value)}
              placeholder="Computer Science, Business, Architecture..."
              className="saas-input"
            />
          </label>

          <div className="mt-5">
            <p className="text-sm font-medium text-foreground">Quốc gia ưu tiên</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => toggleCountry(country)}
                  className={`saas-chip ${
                    selectedCountries.includes(country) ? "saas-chip-active" : ""
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="saas-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
              <WalletCards className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Ngân sách dự kiến
              </p>
              <p className="text-sm text-muted-foreground">
                AI sẽ dùng mức ngân sách này để lọc trường và gợi ý học bổng sát hơn.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setBudgetValue((current) =>
                    current === option.value ? null : option.value,
                  )
                }
                className={`rounded-[1.15rem] border px-4 py-4 text-left text-sm transition ${
                  budgetValue === option.value
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_34px_-22px_rgb(15_23_42/0.45)]"
                    : "border-border bg-background/90 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="saas-card p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                {hasAnyData
                  ? "Hồ sơ đủ để AI bắt đầu gợi ý."
                  : "Bạn có thể bắt đầu ngay cả khi chưa điền gì."}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mọi thông tin còn thiếu đều có thể được hỏi tiếp trong lúc chat.
              </p>
            </div>

            <Button type="button" className="gradient-btn border-0" onClick={handleSubmit}>
              {hasAnyData ? "Bắt đầu tư vấn" : "Bắt đầu không cần hồ sơ"}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
