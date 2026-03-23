"use client";

import {
  ArrowUpRight,
  Banknote,
  GraduationCap,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

export interface MatchedSchool {
  name: string;
  country: string;
  location: string;
  match_percent: number;
  tuition_range: string;
  scholarship: boolean;
  fields: string[];
  gpa_required: string | null;
  certs_required: string;
  website: string;
  image_url: string;
  excerpt: string;
  reasons: string[];
}

interface SchoolMatchCardsProps {
  matched: MatchedSchool[];
  total_schools: number;
}

function countryFlag(country: string) {
  const flags: Record<string, string> = {
    Australia: "🇦🇺",
    USA: "🇺🇸",
    Canada: "🇨🇦",
    "United Kingdom": "🇬🇧",
    UK: "🇬🇧",
    "New Zealand": "🇳🇿",
    Singapore: "🇸🇬",
    Japan: "🇯🇵",
    France: "🇫🇷",
    Germany: "🇩🇪",
    Netherlands: "🇳🇱",
    Sweden: "🇸🇪",
  };
  return flags[country] ?? "🌍";
}

function matchTone(percent: number) {
  if (percent >= 75) return "bg-[oklch(0.67_0.104_164)] text-white";
  if (percent >= 55) return "bg-[oklch(0.76_0.145_73)] text-[oklch(0.22_0.03_225)]";
  return "bg-secondary text-foreground";
}

export function SchoolMatchCards({
  matched,
  total_schools,
}: SchoolMatchCardsProps) {
  if (!matched || matched.length === 0) {
    return (
      <div className="saas-card p-5 text-sm leading-6 text-muted-foreground">
        Không tìm thấy trường phù hợp trong cơ sở dữ liệu hiện tại.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">School matches</Badge>
          <span className="text-sm text-muted-foreground">
            {matched.length} gợi ý tốt nhất trên tổng {total_schools} trường
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Xếp hạng theo độ phù hợp hiện tại
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {matched.map((school, index) => (
          <article
            key={school.website || `${school.name}-${school.country}-${school.location}`}
            className="saas-card card-lift p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <Badge variant="secondary">
                    {countryFlag(school.country)} {school.country}
                  </Badge>
                  {school.scholarship ? (
                    <Badge variant="secondary">Có học bổng</Badge>
                  ) : null}
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                    {school.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {school.excerpt}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-full px-3 py-2 text-sm font-semibold ${matchTone(
                  school.match_percent,
                )}`}
              >
                {school.match_percent}%
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.1rem] border border-border/80 bg-secondary/35 p-3.5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {school.location || "Đang cập nhật"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.1rem] border border-border/80 bg-secondary/35 p-3.5">
                <div className="flex items-start gap-3">
                  <Banknote className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Học phí</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {school.tuition_range}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {school.gpa_required || school.certs_required ? (
                <div className="rounded-[1.1rem] border border-border/80 bg-background/90 p-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 size-4 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Điều kiện tham khảo
                      </p>
                      {school.gpa_required ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          GPA tối thiểu: {school.gpa_required}
                        </p>
                      ) : null}
                      {school.certs_required && school.certs_required !== "Không yêu cầu" ? (
                        <p className="text-sm leading-6 text-muted-foreground">
                          {school.certs_required}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {school.reasons.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Vì sao phù hợp
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {school.reasons.map((reason) => (
                      <span
                        key={`${school.name}-${reason}`}
                        className="rounded-full border border-border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {school.fields.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    Lĩnh vực mạnh
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {school.fields.slice(0, 4).map((field) => (
                      <span
                        key={`${school.name}-${field}`}
                        className="rounded-full border border-border bg-secondary/35 px-3 py-1 text-xs text-muted-foreground"
                      >
                        {field}
                      </span>
                    ))}
                    {school.fields.length > 4 ? (
                      <span className="rounded-full border border-border bg-secondary/35 px-3 py-1 text-xs text-muted-foreground">
                        +{school.fields.length - 4}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {school.website ? (
              <a
                href={school.website}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-75"
              >
                Website trường
                <ArrowUpRight className="size-4" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
