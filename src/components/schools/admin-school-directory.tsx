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
  GraduationCapIcon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react";

interface AdminSchoolDirectoryProps {
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
  if (
    item.tuitionMinUsd &&
    item.tuitionMaxUsd &&
    item.tuitionMinUsd !== item.tuitionMaxUsd
  ) {
    return `$${item.tuitionMinUsd.toLocaleString()} - $${item.tuitionMaxUsd.toLocaleString()}`;
  }

  if (item.tuitionMinUsd) {
    return `$${item.tuitionMinUsd.toLocaleString()}`;
  }

  return item.tuitionRaw || "Đang cập nhật";
}

export default function AdminSchoolDirectory({
  items,
}: AdminSchoolDirectoryProps) {
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
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold">ETEST Directory Filter</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Filter theo Nước, Tỉnh bang/Thành phố, bậc học, học phí, học bổng,
                ngành học và điều kiện xét tuyển.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-3 py-1.5">
                {items.length} trường
              </span>
              <span className="rounded-full bg-muted px-3 py-1.5">
                {filteredItems.length} kết quả
              </span>
              <Link
                href="/data/etest-school-directory.csv"
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-foreground transition-colors hover:bg-muted"
              >
                Tải CSV
                <ArrowUpRightIcon size={13} />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Nước</span>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              <span className="text-xs font-medium text-muted-foreground">
                Tỉnh bang/Thành phố
              </span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              <span className="text-xs font-medium text-muted-foreground">
                Chương trình đào tạo và bậc học
              </span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
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
              <span className="text-xs font-medium text-muted-foreground">Học phí tối đa</span>
              <div className="rounded-md border border-input bg-background px-3 py-2">
                <input
                  type="range"
                  min={0}
                  max={tuitionCeiling}
                  step={1000}
                  value={maxTuition}
                  onChange={(event) => setMaxTuition(Number(event.target.value))}
                  className="w-full"
                />
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>$0</span>
                  <span>${maxTuition.toLocaleString()}</span>
                </div>
              </div>
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Theo ngành học</span>
              <div className="relative">
                <SearchIcon
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={fieldQuery}
                  onChange={(event) => setFieldQuery(event.target.value)}
                  placeholder="Ví dụ: Engineering, Business, Medicine..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                />
              </div>
            </label>

            <label className="space-y-2 lg:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Điều kiện xét tuyển
              </span>
              <div className="relative">
                <FilterIcon
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  value={requirementsQuery}
                  onChange={(event) => setRequirementsQuery(event.target.value)}
                  placeholder="Ví dụ: IELTS 6.5, SAT, GPA 7.0..."
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                />
              </div>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScholarshipOnly((current) => !current)}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                scholarshipOnly
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-muted"
              }`}
            >
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
              className="rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted"
            >
              Reset bộ lọc
            </button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Không có trường nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {item.country}
                    </span>
                    {item.scholarshipAvailable && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        Scholarship
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.excerpt}</p>
                  </div>
                </div>
                <div className="hidden rounded-full bg-muted p-3 sm:block">
                  <GraduationCapIcon size={18} className="text-muted-foreground" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPinIcon size={15} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Tỉnh bang/Thành phố</p>
                      <p className="text-muted-foreground">{item.location || "Đang cập nhật"}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <BadgeDollarSignIcon size={15} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Học phí</p>
                      <p className="text-muted-foreground">{formatTuition(item)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <BookOpenIcon size={15} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Bậc học</p>
                      <p className="text-muted-foreground">
                        {item.levels.join(", ") || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AwardIcon size={15} className="mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Học bổng</p>
                      <p className="text-muted-foreground">
                        {item.scholarshipSummary || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Theo ngành học</p>
                  <div className="flex flex-wrap gap-2">
                    {item.fields.length > 0 ? (
                      item.fields.slice(0, 8).map((field) => (
                        <span
                          key={field}
                          className="text-xs rounded-full border px-2.5 py-1 text-muted-foreground"
                        >
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Đang cập nhật</span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Điều kiện xét tuyển
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.requirementsSummary || "Đang cập nhật"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={item.detailUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
                >
                  Xem bài chi tiết
                  <ArrowUpRightIcon size={13} />
                </Link>
                {item.website && (
                  <Link
                    href={item.website}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    Website trường
                    <ArrowUpRightIcon size={13} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
