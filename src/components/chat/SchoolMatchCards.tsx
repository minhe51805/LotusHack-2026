"use client";

import { ExternalLink, MapPin, GraduationCap, Banknote, Award } from "lucide-react";

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

function MatchBadge({ percent, overlay = false }: { percent: number; overlay?: boolean }) {
  const circumference = 2 * Math.PI * 14;
  const dashOffset = circumference * (1 - percent / 100);

  return (
    <div className={`relative w-12 h-12 shrink-0 ${overlay ? "drop-shadow" : ""}`}>
      {overlay && (
        <div className="absolute inset-0 rounded-full bg-black/30 backdrop-blur-sm" />
      )}
      <svg className="w-12 h-12 -rotate-90 relative" viewBox="0 0 32 32">
        <circle
          cx="16" cy="16" r="14"
          fill="none"
          strokeWidth="3"
          className={overlay ? "stroke-white/20" : "stroke-gray-200 dark:stroke-zinc-700"}
        />
        <circle
          cx="16" cy="16" r="14"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          className={`transition-all duration-700 ${
            percent >= 70
              ? "stroke-emerald-400"
              : percent >= 45
                ? "stroke-amber-400"
                : "stroke-gray-400"
          }`}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${
          overlay
            ? "text-white"
            : percent >= 70
              ? "text-emerald-600 dark:text-emerald-400"
              : percent >= 45
                ? "text-amber-600 dark:text-amber-400"
                : "text-gray-500 dark:text-zinc-400"
        }`}
      >
        {percent}%
      </span>
    </div>
  );
}

function CountryFlag({ country }: { country: string }) {
  const flags: Record<string, string> = {
    Australia: "🇦🇺", USA: "🇺🇸", Canada: "🇨🇦",
    "United Kingdom": "🇬🇧", UK: "🇬🇧", "New Zealand": "🇳🇿",
    Singapore: "🇸🇬", Japan: "🇯🇵", France: "🇫🇷",
    Germany: "🇩🇪", Netherlands: "🇳🇱", Sweden: "🇸🇪",
  };
  return <span>{flags[country] ?? "🌐"}</span>;
}

export function SchoolMatchCards({ matched, total_schools }: SchoolMatchCardsProps) {
  if (!matched || matched.length === 0) {
    return (
      <div className="w-full px-3.5 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm text-gray-500 dark:text-zinc-400">
        Không tìm thấy trường phù hợp trong cơ sở dữ liệu.
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide">
          Trường phù hợp nhất
        </span>
        <span className="text-[10px] text-gray-400 dark:text-zinc-500">
          từ {total_schools} trường
        </span>
      </div>

      {/* Cards — 2-col grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {matched.map((school, i) => (
          <SchoolCard key={i} school={school} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}

function SchoolCard({ school, rank }: { school: MatchedSchool; rank: number }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm overflow-hidden">
      {/* Cover image */}
      {school.image_url ? (
        <div className="relative h-32 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={school.image_url}
            alt={school.name}
            className="w-full h-full object-cover"
          />
          {/* gradient overlay so text is legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* rank + match badge pinned over image */}
          <div className="absolute top-2 left-3 flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
              #{rank}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <MatchBadge percent={school.match_percent} overlay />
          </div>
          {/* school name pinned at bottom of image */}
          <div className="absolute bottom-2.5 left-3 right-14">
            <div className="flex items-center gap-1 mb-0.5">
              <CountryFlag country={school.country} />
              <span className="text-[10px] text-white/80 truncate">{school.country}</span>
              {school.scholarship && (
                <span className="shrink-0 flex items-center gap-0.5 text-[9px] font-semibold text-amber-300 bg-amber-900/60 border border-amber-700/50 px-1.5 py-0.5 rounded-full">
                  <Award size={9} />
                  HB
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 drop-shadow">
              {school.name}
            </h3>
          </div>
        </div>
      ) : (
        <>
          {/* Top accent bar based on match % — shown only when no image */}
          <div
            className={`h-0.5 w-full ${
              school.match_percent >= 70
                ? "bg-emerald-400"
                : school.match_percent >= 45
                  ? "bg-amber-400"
                  : "bg-gray-300 dark:bg-zinc-600"
            }`}
          />
        </>
      )}

      <div className="p-3.5">
        {/* Row 1 — only shown when there is no cover image */}
        {!school.image_url && (
          <div className="flex items-start gap-3 mb-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 shrink-0">
                  #{rank}
                </span>
                <CountryFlag country={school.country} />
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                  {school.country}
                </span>
                {school.scholarship && (
                  <span className="shrink-0 flex items-center gap-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
                    <Award size={9} />
                    HB
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 leading-tight line-clamp-2">
                {school.name}
              </h3>
            </div>
            <MatchBadge percent={school.match_percent} />
          </div>
        )}

        {/* Row 2: location + tuition */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {school.location && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
              <MapPin size={10} />
              {school.location}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
            <Banknote size={10} />
            {school.tuition_range}
          </span>
        </div>

        {/* Row 3: requirements */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          {school.gpa_required && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-zinc-400">
              <GraduationCap size={10} />
              GPA ≥ {school.gpa_required}
            </span>
          )}
          {school.certs_required && school.certs_required !== "Không yêu cầu" && (
            <span className="text-[11px] text-gray-500 dark:text-zinc-400">
              {school.certs_required}
            </span>
          )}
        </div>

        {/* Row 4: match reasons */}
        {school.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {school.reasons.map((reason, j) => (
              <span
                key={j}
                className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400"
              >
                ✓ {reason}
              </span>
            ))}
          </div>
        )}

        {/* Row 5: fields (up to 3) */}
        {school.fields.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {school.fields.slice(0, 3).map((f, j) => (
              <span
                key={j}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 truncate max-w-[160px]"
              >
                {f}
              </span>
            ))}
            {school.fields.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-400 dark:text-zinc-500">
                +{school.fields.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Row 6: website link */}
        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink size={10} />
            Website trường
          </a>
        )}
      </div>
    </div>
  );
}
