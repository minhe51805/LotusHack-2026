"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import {
  ArrowUpRight,
  Filter,
  GraduationCap,
  Landmark,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SchoolDirectoryEntry } from "@/lib/school-directory";

interface AdminSchoolDirectoryProps {
  items: SchoolDirectoryEntry[];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .replace(/đ/g, "d")
    .toLowerCase()
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
    ...items.map((item) => item.tuitionMaxUsd ?? item.tuitionMinUsd ?? 0),
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

  function resetFilters() {
    setCountry("");
    setLocation("");
    setLevel("");
    setFieldQuery("");
    setRequirementsQuery("");
    setScholarshipOnly(false);
    setMaxTuition(tuitionCeiling);
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[1.6rem] border border-border/80 bg-secondary/35 p-5">
        <div className="flex flex-col gap-4 border-b border-border/70 pb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                Directory filters
              </p>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Cùng một logic lọc với bản public nhưng đặt trong admin để đội vận hành
                đối chiếu dữ liệu nhanh hơn khi tư vấn.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={scholarshipOnly ? "default" : "outline"}
                className={scholarshipOnly ? "gradient-btn border-0" : undefined}
                onClick={() => setScholarshipOnly((value) => !value)}
              >
                <Sparkles data-icon="inline-start" />
                Có học bổng
              </Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="saas-input h-12"
            >
              <option value="">Tất cả quốc gia</option>
              {countries.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="saas-input h-12"
            >
              <option value="">Tất cả location</option>
              {locations.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="saas-input h-12"
            >
              <option value="">Tất cả bậc học</option>
              {levels.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="rounded-[1.15rem] border border-border bg-background/85 px-4 py-3">
              <input
                type="range"
                min={0}
                max={tuitionCeiling}
                step={1000}
                value={maxTuition}
                onChange={(event) => setMaxTuition(Number(event.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="font-medium text-foreground">
                  ${maxTuition.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={fieldQuery}
                onChange={(event) => setFieldQuery(event.target.value)}
                placeholder="Lọc theo ngành học"
                className="saas-input h-12 pl-11"
              />
            </div>

            <div className="relative xl:col-span-2">
              <Filter className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={requirementsQuery}
                onChange={(event) => setRequirementsQuery(event.target.value)}
                placeholder="Lọc theo điều kiện xét tuyển"
                className="saas-input h-12 pl-11"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} kết quả phù hợp trên tổng {items.length} trường.
          </p>
          <Button asChild variant="outline">
            <Link href="/data/etest-school-directory.csv">
              CSV
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border bg-secondary/20 px-6 py-16 text-center text-sm text-muted-foreground">
          Không có trường nào khớp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => (
            <article key={item.id} className="saas-card card-lift p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{item.country}</Badge>
                {item.scholarshipAvailable ? (
                  <Badge variant="secondary">Có học bổng</Badge>
                ) : null}
                <Badge variant="outline">{item.levels[0] || "N/A"}</Badge>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.excerpt || item.title}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.1rem] border border-border/80 bg-background/85 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.location || "Đang cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.1rem] border border-border/80 bg-background/85 p-4">
                    <div className="flex items-start gap-3">
                      <Landmark className="mt-0.5 size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Học phí</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {formatTuition(item)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Fields
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.fields.length > 0 ? (
                      item.fields.slice(0, 6).map((field) => (
                        <span
                          key={field}
                          className="rounded-full border border-border bg-secondary/45 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Đang cập nhật</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.15rem] border border-border/80 bg-secondary/35 p-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Requirements
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.requirementsSummary || "Đang cập nhật"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="gradient-btn border-0">
                    <Link href={item.detailUrl} target="_blank" rel="noreferrer">
                      Bài chi tiết
                      <ArrowUpRight data-icon="inline-end" />
                    </Link>
                  </Button>
                  {item.website ? (
                    <Button asChild variant="outline">
                      <Link href={item.website} target="_blank" rel="noreferrer">
                        Website
                        <ArrowUpRight data-icon="inline-end" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
