"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { SchoolDirectoryEntry } from "@/lib/school-directory";
import {
  ArrowUpRightIcon,
  AwardIcon,
  BadgeDollarSignIcon,
  BookOpenIcon,
  FilterIcon,
  GlobeIcon,
  GraduationCapIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";

interface SchoolDirectoryProps {
  items: SchoolDirectoryEntry[];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function formatTuition(item: SchoolDirectoryEntry) {
  if (item.tuitionMinUsd && item.tuitionMaxUsd && item.tuitionMinUsd !== item.tuitionMaxUsd) {
    return `$${item.tuitionMinUsd.toLocaleString()} - $${item.tuitionMaxUsd.toLocaleString()}`;
  }

  if (item.tuitionMinUsd) {
    return `$${item.tuitionMinUsd.toLocaleString()}`;
  }

  return item.tuitionRaw || "Đang cập nhật";
}

export default function SchoolDirectory({ items }: SchoolDirectoryProps) {
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("");
  const [fieldQuery, setFieldQuery] = useState("");
  const [requirementsQuery, setRequirementsQuery] = useState("");
  const [scholarshipOnly, setScholarshipOnly] = useState(false);

  const tuitionCeiling = Math.max(
    60000,
    ...items.map((item) => item.tuitionMaxUsd ?? item.tuitionMinUsd ?? 0)
  );
  const [maxTuition, setMaxTuition] = useState(tuitionCeiling);

  const deferredFieldQuery = useDeferredValue(fieldQuery);
  const deferredRequirementsQuery = useDeferredValue(requirementsQuery);

  const countries = [...new Set(items.map((item) => item.country).filter(Boolean))].sort();
  const locations = [...new Set(items.map((item) => item.location).filter(Boolean))].sort();
  const levels = [...new Set(items.flatMap((item) => item.levels).filter(Boolean))].sort();

  const filteredItems = items.filter((item) => {
    if (country && item.country !== country) return false;
    if (location && item.location !== location) return false;
    if (level && !item.levels.includes(level)) return false;
    if (scholarshipOnly && !item.scholarshipAvailable) return false;

    const minTuition = item.tuitionMinUsd ?? item.tuitionMaxUsd ?? 0;
    if (minTuition > maxTuition) return false;

    const normalizedFieldQuery = normalizeText(deferredFieldQuery);
    if (
      normalizedFieldQuery &&
      !item.fields.some((field) => normalizeText(field).includes(normalizedFieldQuery))
    ) {
      return false;
    }

    const normalizedRequirementsQuery = normalizeText(deferredRequirementsQuery);
    if (
      normalizedRequirementsQuery &&
      !normalizeText(item.requirementsSummary).includes(normalizedRequirementsQuery)
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f0e7_0%,#f8f6f2_35%,#ffffff_100%)] text-slate-900">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top_left,rgba(163,81,45,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,116,144,0.12),transparent_22%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-10 lg:py-16">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8c2b20]/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8c2b20]">
              <GlobeIcon size={14} />
              School Directory
            </div>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Danh sách trường du học đã crawl từ ETEST và chuẩn hóa để lọc nhanh.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Lọc theo quốc gia, tỉnh bang hoặc thành phố, bậc học, học phí, học bổng,
                ngành học và điều kiện xét tuyển. Dữ liệu CSV đang được publish kèm ngay
                trong ứng dụng.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                {items.length} trường
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1.5">
                {filteredItems.length} kết quả đang hiển thị
              </span>
              <Link
                href="/data/etest-school-directory.csv"
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-900 transition-colors hover:border-slate-900"
              >
                Tải CSV
                <ArrowUpRightIcon size={14} />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-black/5 bg-white/85 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Nước
              </span>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#8c2b20] focus:bg-white"
              >
                <option value="">Tất cả quốc gia</option>
                {countries.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tỉnh bang/Thành phố
              </span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#8c2b20] focus:bg-white"
              >
                <option value="">Tất cả địa điểm</option>
                {locations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Chương trình đào tạo và bậc học
              </span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#8c2b20] focus:bg-white"
              >
                <option value="">Tất cả bậc học</option>
                {levels.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Học phí tối đa
              </span>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="range"
                  min={0}
                  max={tuitionCeiling}
                  step={1000}
                  value={maxTuition}
                  onChange={(event) => setMaxTuition(Number(event.target.value))}
                  className="w-full accent-[#8c2b20]"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>$0</span>
                  <span className="font-semibold text-slate-900">
                    ${maxTuition.toLocaleString()}
                  </span>
                </div>
              </div>
            </label>

            <label className="space-y-2 xl:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Theo ngành học
              </span>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={fieldQuery}
                  onChange={(event) => setFieldQuery(event.target.value)}
                  placeholder="Ví dụ: Engineering, Business, Medicine..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#8c2b20] focus:bg-white"
                />
              </div>
            </label>

            <label className="space-y-2 xl:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Điều kiện xét tuyển
              </span>
              <div className="relative">
                <FilterIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  value={requirementsQuery}
                  onChange={(event) => setRequirementsQuery(event.target.value)}
                  placeholder="Ví dụ: IELTS 6.5, SAT, GPA 7.0..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#8c2b20] focus:bg-white"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => setScholarshipOnly((current) => !current)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition ${
                scholarshipOnly
                  ? "border-[#8c2b20] bg-[#8c2b20] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <AwardIcon size={16} />
              Chỉ hiện trường có học bổng
            </button>

            <button
              type="button"
              onClick={() => {
                setCountry("");
                setLocation("");
                setLevel("");
                setFieldQuery("");
                setRequirementsQuery("");
                setScholarshipOnly(false);
                setMaxTuition(tuitionCeiling);
              }}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Reset bộ lọc
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-10 lg:px-10">
        {filteredItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            Không có trường nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-full flex-col gap-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        <span className="rounded-full bg-[#f4e4dc] px-2.5 py-1 text-[#8c2b20]">
                          {item.country}
                        </span>
                        {item.scholarshipAvailable && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            Có học bổng
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
                          {item.name}
                        </h2>
                        <p className="text-sm leading-6 text-slate-600">{item.excerpt}</p>
                      </div>
                    </div>
                    <div className="hidden rounded-full bg-slate-950 p-3 text-white shadow-lg sm:block">
                      <GraduationCapIcon size={18} />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPinIcon size={16} className="mt-0.5 text-[#8c2b20]" />
                      <div>
                        <p className="font-medium text-slate-900">Tỉnh bang/Thành phố</p>
                        <p>{item.location || "Đang cập nhật"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BadgeDollarSignIcon size={16} className="mt-0.5 text-[#8c2b20]" />
                      <div>
                        <p className="font-medium text-slate-900">Học phí</p>
                        <p>{formatTuition(item)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpenIcon size={16} className="mt-0.5 text-[#8c2b20]" />
                      <div>
                        <p className="font-medium text-slate-900">Bậc học</p>
                        <p>{item.levels.join(", ") || "Đang cập nhật"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AwardIcon size={16} className="mt-0.5 text-[#8c2b20]" />
                      <div>
                        <p className="font-medium text-slate-900">Học bổng</p>
                        <p>{item.scholarshipSummary || "Đang cập nhật"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Theo ngành học
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.fields.length > 0 ? (
                          item.fields.slice(0, 8).map((field) => (
                            <span
                              key={field}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                            >
                              {field}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">Đang cập nhật</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Điều kiện xét tuyển
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.requirementsSummary || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3 pt-1">
                    <Link
                      href={item.detailUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8c2b20]"
                    >
                      Xem bài chi tiết
                      <ArrowUpRightIcon size={14} />
                    </Link>
                    {item.website && (
                      <Link
                        href={item.website}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:border-slate-950"
                      >
                        Website trường
                        <ArrowUpRightIcon size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
