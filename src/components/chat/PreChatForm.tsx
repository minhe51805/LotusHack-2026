"use client";

import { useState } from "react";
import { Plus, X, ChevronRight } from "lucide-react";
import type { LeadData, Certification } from "@/lib/data";

const CERT_TYPES = ["IELTS", "SAT", "ACT", "PTE", "TOEFL", "TOEIC", "GRE", "GMAT"] as const;
const COUNTRIES = ["Úc", "Canada", "Anh", "Mỹ", "New Zealand", "Singapore", "Nhật Bản", "Châu Âu", "Khác"] as const;
const BUDGET_OPTIONS = [
  { label: "< $20,000/năm", value: 15000 },
  { label: "$20,000 – $30,000/năm", value: 25000 },
  { label: "$30,000 – $50,000/năm", value: 40000 },
  { label: "> $50,000/năm", value: 55000 },
];

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"];
const YEARS = Array.from({ length: 8 }, (_, i) => String(2020 + i));

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
      .filter((c) => c.type && c.score)
      .map((c) => `${c.type} ${c.score}${c.date ? ` (${c.date})` : ""}`)
      .join(", ");
    if (certStr) lines.push(`• Chứng chỉ: ${certStr}`);
  }

  if (fieldOfStudy) lines.push(`• Ngành mục tiêu: ${fieldOfStudy}`);
  if (countries.length) lines.push(`• Quốc gia ưu tiên: ${countries.join(", ")}`);
  if (budgetValue) {
    const opt = BUDGET_OPTIONS.find((o) => o.value === budgetValue);
    lines.push(`• Ngân sách: ~${opt?.label ?? `$${budgetValue.toLocaleString()}/năm`}`);
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

  function removeCert(i: number) {
    setCerts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateCert(i: number, field: keyof Certification, value: string) {
    setCerts((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  function toggleCountry(c: string) {
    setSelectedCountries((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  function handleSubmit() {
    const summary = buildSummary(
      age, school, gpa, certs, fieldOfStudy, selectedCountries, budgetValue
    );

    const lead: Partial<LeadData> = {};
    if (age) lead.age = Number(age);
    if (school) lead.current_school = school;
    if (gpa) lead.gpa = gpa;
    if (certs.filter((c) => c.type && c.score).length)
      lead.certifications = certs.filter((c) => c.type && c.score);
    if (fieldOfStudy) lead.field_of_study = fieldOfStudy;
    if (selectedCountries.length) lead.priority_countries = selectedCountries;
    if (budgetValue) lead.budget_usd = budgetValue;

    onSubmit(summary, lead);
  }

  const hasAnyData =
    age || school || gpa || certs.some((c) => c.type) ||
    fieldOfStudy || selectedCountries.length || budgetValue;

  return (
    <div className="h-full overflow-y-auto px-4 py-5 space-y-6">
      {/* Header */}
      <div className="text-center pt-2">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
          E
        </div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Bắt đầu tư vấn du học
        </h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          Cho chúng tôi biết thêm về bạn để AI gợi ý chính xác hơn.
          <br />Tất cả các trường đều không bắt buộc.
        </p>
      </div>

      {/* Basic Info */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Thông tin cơ bản
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-24 shrink-0">
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">Tuổi</label>
              <input
                type="number"
                min={10}
                max={60}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="17"
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">Trường hiện tại</label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="THPT Nguyễn Du, ĐH Bách Khoa…"
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">GPA</label>
            <input
              type="text"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="8.5/10 hoặc 3.7/4.0"
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
            Chứng chỉ đã có
          </h3>
          <button
            onClick={addCert}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus size={12} /> Thêm chứng chỉ
          </button>
        </div>

        {certs.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-zinc-500 italic">
            Chưa có chứng chỉ — nhấn "Thêm chứng chỉ" nếu có.
          </p>
        )}

        <div className="space-y-3">
          {certs.map((cert, i) => (
            <div
              key={i}
              className="bg-gray-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-gray-200 dark:border-zinc-700"
            >
              {/* Type pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {CERT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => updateCert(i, "type", t)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      cert.type === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-600 hover:border-blue-400"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 dark:text-zinc-500 mb-1 block">Điểm</label>
                  <input
                    type="text"
                    value={cert.score}
                    onChange={(e) => updateCert(i, "score", e.target.value)}
                    placeholder={cert.type === "IELTS" ? "6.5" : cert.type === "SAT" ? "1350" : "Điểm"}
                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm px-3 py-1.5 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-1">
                  <div>
                    <label className="text-xs text-gray-400 dark:text-zinc-500 mb-1 block">Tháng</label>
                    <select
                      value={cert.date.split("/")[0] ?? ""}
                      onChange={(e) => {
                        const yr = cert.date.split("/")[1] ?? "";
                        updateCert(i, "date", `${e.target.value}/${yr}`);
                      }}
                      className="rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm px-2 py-1.5 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">MM</option>
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 dark:text-zinc-500 mb-1 block">Năm</label>
                    <select
                      value={cert.date.split("/")[1] ?? ""}
                      onChange={(e) => {
                        const mo = cert.date.split("/")[0] ?? "";
                        updateCert(i, "date", `${mo}/${e.target.value}`);
                      }}
                      className="rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-sm px-2 py-1.5 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">YYYY</option>
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => removeCert(i)}
                  className="mb-0.5 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aspirations */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Định hướng
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">Ngành học mục tiêu</label>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="Computer Science, Business, Kiến trúc…"
              className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">Quốc gia ưu tiên</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedCountries.includes(c)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-blue-400"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Budget */}
      <section>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
          Ngân sách dự kiến
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudgetValue(budgetValue === opt.value ? null : opt.value)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                budgetValue === opt.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-blue-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="pb-4">
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-2xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all flex items-center justify-center gap-2"
        >
          {hasAnyData ? "Bắt đầu tư vấn" : "Bắt đầu không cần hồ sơ"}
          <ChevronRight size={16} />
        </button>
        {!hasAnyData && (
          <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-2">
            Bạn có thể cung cấp thông tin trong lúc trò chuyện.
          </p>
        )}
      </div>
    </div>
  );
}
