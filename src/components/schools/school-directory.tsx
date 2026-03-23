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
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SchoolDirectoryEntry } from "@/lib/school-directory";

interface SchoolDirectoryProps {
  items: SchoolDirectoryEntry[];
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .toLowerCase()
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

export default function SchoolDirectory({ items }: SchoolDirectoryProps) {
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
    <div className="min-h-screen pb-16">
      <section className="page-wrap py-8 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end">
          <div className="space-y-5">
            <Badge variant="outline" className="w-fit">
              Public school directory
            </Badge>
            <div className="space-y-4">
              <h1 className="section-heading text-foreground">
                Lọc trường du học như một{" "}
                <span className="gradient-text">công cụ tra cứu thực chiến</span>,
                không chỉ là trang giới thiệu.
              </h1>
              <p className="section-copy max-w-2xl">
                Dữ liệu đã được chuẩn hóa theo quốc gia, location, bậc học, học phí,
                học bổng, ngành và điều kiện xét tuyển. Phụ huynh, học sinh hoặc đội
                tuyển sinh đều có thể tra cứu từ cùng một nguồn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="metric-pill">{items.length} trường đã index</span>
              <span className="metric-pill">{filteredItems.length} kết quả đang hiển thị</span>
              <span className="metric-pill">CSV có thể tải trực tiếp</span>
            </div>
          </div>

          <div className="saas-card card-lift p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  Why this matters
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  Mỗi bộ lọc giảm thêm một lớp mơ hồ trong quyết định du học.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Thay vì đợi tư vấn viên gợi ý thủ công, người dùng có thể tự narrow xuống
              nhóm trường phù hợp trước khi bước vào hội thoại.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/data/etest-school-directory.csv">
                  Tải CSV
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild className="gradient-btn border-0">
                <Link href="/chat">
                  Hỏi AI từ dữ liệu này
                  <ArrowUpRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap">
        <div className="saas-panel overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 border-b border-border/70 pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="section-kicker">Filters</div>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Kết hợp location, bậc học, học phí, ngành và điều kiện đầu vào để tìm
                  tập trường sát với hồ sơ của học sinh.
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
                  Chỉ hiện trường có học bổng
                </Button>
                <Button type="button" variant="outline" onClick={resetFilters}>
                  <SlidersHorizontal data-icon="inline-start" />
                  Reset bộ lọc
                </Button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Quốc gia
                </span>
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
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Location
                </span>
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
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Bậc học
                </span>
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
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Học phí tối đa
                </span>
                <div className="rounded-[1.2rem] border border-border bg-background/85 px-4 py-3">
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
              </label>

              <label className="space-y-2 xl:col-span-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Theo ngành học
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={fieldQuery}
                    onChange={(event) => setFieldQuery(event.target.value)}
                    placeholder="Ví dụ: Engineering, Business, Medicine..."
                    className="saas-input h-12 pl-11"
                  />
                </div>
              </label>

              <label className="space-y-2 xl:col-span-2">
                <span className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Điều kiện xét tuyển
                </span>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={requirementsQuery}
                    onChange={(event) => setRequirementsQuery(event.target.value)}
                    placeholder="Ví dụ: IELTS 6.5, GPA 7.0, SAT 1200..."
                    className="saas-input h-12 pl-11"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4 text-primary" />
              Bộ kết quả được cập nhật từ dữ liệu đã crawl và chuẩn hóa nội bộ.
            </div>
            <Badge variant="secondary">{filteredItems.length} kết quả</Badge>
          </div>
        </div>
      </section>

      <section className="page-wrap py-6">
        {filteredItems.length === 0 ? (
          <div className="saas-card flex min-h-72 flex-col items-center justify-center gap-3 p-8 text-center">
            <GraduationCap className="size-7 text-primary" />
            <div className="space-y-2">
              <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                Không có trường nào khớp bộ lọc hiện tại.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Hãy nới điều kiện hoặc reset bộ lọc để mở rộng phạm vi tìm kiếm.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={resetFilters}>
              Reset bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <article key={item.id} className="saas-card card-lift overflow-hidden p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.country}</Badge>
                  {item.scholarshipAvailable ? (
                    <Badge variant="secondary">Có học bổng</Badge>
                  ) : null}
                  {item.levels.slice(0, 2).map((entry) => (
                    <Badge key={entry} variant="outline">
                      {entry}
                    </Badge>
                  ))}
                </div>

                <div className="mt-5 grid gap-5">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                      {item.name}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {item.excerpt || item.title}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-border/80 bg-secondary/45 p-4">
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
                    <div className="rounded-[1.2rem] border border-border/80 bg-secondary/45 p-4">
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

                  <div className="grid gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Theo ngành học
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.fields.length > 0 ? (
                          item.fields.slice(0, 8).map((field) => (
                            <span
                              key={field}
                              className="rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground"
                            >
                              {field}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Đang cập nhật</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.25rem] border border-border/80 bg-background/90 p-4">
                      <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Điều kiện xét tuyển
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.requirementsSummary || "Đang cập nhật"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <Button asChild className="gradient-btn border-0">
                      <Link href={item.detailUrl} target="_blank" rel="noreferrer">
                        Xem bài chi tiết
                        <ArrowUpRight data-icon="inline-end" />
                      </Link>
                    </Button>
                    {item.website ? (
                      <Button asChild variant="outline">
                        <Link href={item.website} target="_blank" rel="noreferrer">
                          Website trường
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
      </section>
    </div>
  );
}
