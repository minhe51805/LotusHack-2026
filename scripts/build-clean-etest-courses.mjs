import fs from "node:fs/promises";
import path from "node:path";

const OUTPUT_DIR = path.join(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.join(process.cwd(), "public", "data");
const RAW_JSON_INPUT_FILE = path.join(OUTPUT_DIR, "etest-course-directory.json");
const CLEAN_JSON_OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "etest-course-directory-clean.json"
);
const CLEAN_CSV_OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "etest-course-directory-clean.csv"
);
const PUBLIC_CLEAN_CSV_OUTPUT_FILE = path.join(
  PUBLIC_DATA_DIR,
  "etest-course-directory-clean.csv"
);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/&/g, " va ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function truncate(value, maxLength = 320) {
  const text = compactText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function extractField(value) {
  return compactText(typeof value === "string" ? value : "");
}

function findSectionContents(sections, keywords) {
  return unique(
    (sections ?? [])
      .filter((section) => {
        const heading = normalizeText(section.heading);
        return keywords.some((keyword) => heading.includes(keyword));
      })
      .map((section) => extractField(section.content))
      .filter(Boolean)
  );
}

function firstSectionContent(sections, keywords) {
  return findSectionContents(sections, keywords)[0] ?? "";
}

function firstFaqAnswer(faqItems, keywords) {
  return (
    faqItems.find((item) => {
      const question = normalizeText(item.question);
      return keywords.some((keyword) => question.includes(keyword));
    })?.answer ?? ""
  );
}

function findFaqAnswer(faqItems, predicate) {
  return faqItems.find(predicate)?.answer ?? "";
}

function extractSentenceItems(text, maxItems = 6) {
  const stopPhrases = [
    "dat lich",
    "dang ky ngay",
    "dang ky",
    "xem them",
    "lien he",
    "test ielts",
    "thi thu",
    "tu van lo trinh",
  ];

  const parts = String(text ?? "")
    .replace(/►/g, "\n")
    .replace(/•/g, "\n")
    .replace(/\s{2,}/g, " ")
    .split(/\n|[.;]\s+/)
    .map((part) => compactText(part))
    .filter(Boolean)
    .filter((part) => part.length >= 18 && part.length <= 260)
    .filter((part) => !stopPhrases.some((stop) => normalizeText(part).includes(stop)));

  return unique(parts).slice(0, maxItems);
}

function extractBenefitHeadings(headings) {
  const normalizedHeadings = headings.map((heading) => normalizeText(heading));
  const startIndex = normalizedHeadings.findIndex(
    (heading) =>
      heading.includes("ly do") ||
      heading.includes("loi ich") ||
      heading.includes("ky nang dat duoc")
  );

  if (startIndex < 0) return [];

  const stopKeywords = [
    "chuong trinh",
    "lo trinh",
    "noi dung",
    "doi ngu",
    "thanh tich",
    "cam nhan",
    "lich hoc",
    "cau hoi",
    "faq",
  ];

  const items = [];

  for (let index = startIndex + 1; index < headings.length; index += 1) {
    const heading = headings[index];
    const normalized = normalizedHeadings[index];

    if (stopKeywords.some((keyword) => normalized.includes(keyword))) {
      break;
    }

    if (!heading || heading === heading.toUpperCase()) {
      continue;
    }

    items.push(compactText(heading));
  }

  return unique(items).slice(0, 6);
}

function extractTeacherHighlights(headings, teacherText) {
  const items = [
    ...extractSentenceItems(teacherText, 4),
    ...headings.filter((heading) => {
      const normalized = normalizeText(heading);
      return (
        normalized.includes("giam khao ielts") ||
        normalized.includes("sat 1600") ||
        normalized.includes("ivy league") ||
        normalized.includes("giao vien")
      );
    }),
  ];

  return unique(items).slice(0, 4);
}

function extractRequirementSnippets(text) {
  const patterns = [
    /\bIELTS\s*\d+(?:[.,]\d+)?\+?/gi,
    /\bTOEFL(?:\s*iBT)?\s*\d+(?:[.,]\d+)?\+?/gi,
    /\bSAT\s*\d{3,4}\+?/gi,
    /\bACT\s*\d+(?:[.,]\d+)?\+?/gi,
    /\bGPA\s*[\d.]+(?:\/10|\/4)?\+?/gi,
    /\b(?:từ\s*\d+\s*tuổi|\d+\s*-\s*\d+\s*tuổi)\b/gi,
    /\blớp\s*\d+(?:\s*[-–]\s*\d+)?\b/gi,
  ];

  const matches = [];

  for (const pattern of patterns) {
    for (const match of String(text ?? "").matchAll(pattern)) {
      matches.push(compactText(match[0]));
    }
  }

  return unique(matches);
}

function extractClassSize(text) {
  const match = String(text ?? "").match(
    /\b(?:lớp nhỏ[^.\n]{0,30}?|chỉ\s*)(\d+)\s*(?:học viên|HV)\b/i
  );

  return match ? `${match[1]} học viên` : "";
}

function extractTimelineSnippets(text) {
  return unique(
    [...String(text ?? "").matchAll(/\b\d+\s*(?:tuần|tháng|buổi|giờ)\b/gi)]
      .map((match) => compactText(match[0]))
  );
}

function deriveExamFocus(slug) {
  if (slug.includes("ssat")) return "SSAT";
  if (slug.includes("cambridge-checkpoint")) return "CAMBRIDGE_CHECKPOINT";
  if (slug.includes("model-un")) return "MODEL_UN";
  if (slug.includes("amp")) return "AMP";
  if (slug.includes("ielts")) return "IELTS";
  if (slug.includes("toefl")) return "TOEFL";
  if (slug.includes("sat")) return "SAT";
  if (slug.includes("act")) return "ACT";
  if (slug.includes("ap")) return "AP";
  if (slug.includes("ib")) return "IB";
  if (slug.includes("ged")) return "GED";
  if (slug.includes("isee")) return "ISEE";
  return "OTHER";
}

function deriveVariant(slug, courseName) {
  const normalized = normalizeText(`${slug} ${courseName}`);

  if (normalized.includes("1 kem 1")) return "1_kem_1";
  if (normalized.includes("cap toc")) return "cap_toc";
  if (normalized.includes("juniors")) return "juniors";
  if (normalized.includes("checkpoint")) return "checkpoint";
  if (normalized.includes("model un")) return "model_un";
  if (normalized.includes("amp")) return "mentoring";
  return "standard";
}

function deriveFormat(rawRow, examFocus, variant) {
  const normalized = normalizeText(
    [rawRow.courseName, rawRow.heroTitle, rawRow.introText].join(" ")
  );
  const parts = [];

  if (variant === "1_kem_1" || normalized.includes("1 kem 1")) {
    parts.push("1 kèm 1");
  }

  if (variant === "cap_toc") {
    parts.push("cấp tốc");
  }

  if (variant === "juniors") {
    parts.push("thiếu niên");
  }

  if (examFocus === "AMP") {
    parts.push("mentoring hồ sơ");
  }

  if (extractClassSize(rawRow.introText) || normalized.includes("lop nho")) {
    parts.push("lớp nhỏ");
  }

  if (parts.length === 0) {
    parts.push(examFocus === "AMP" ? "mentoring" : "lớp nhóm");
  }

  return unique(parts).join(" | ");
}

function deriveTags(examFocus, variant, classSize, whoShouldTake, benefits) {
  const tags = [examFocus, variant];
  const normalizedAudience = normalizeText(whoShouldTake);
  const normalizedBenefits = normalizeText(benefits.join(" "));

  if (classSize) tags.push("small_class");
  if (normalizedAudience.includes("du hoc")) tags.push("study_abroad");
  if (normalizedAudience.includes("hoc bong")) tags.push("scholarship");
  if (normalizedAudience.includes("lop 10") || normalizedAudience.includes("lop 11")) {
    tags.push("high_school");
  }
  if (normalizedAudience.includes("9 - 14 tuoi") || normalizedAudience.includes("tu 9 tuoi")) {
    tags.push("young_learners");
  }
  if (normalizedBenefits.includes("giam khao")) tags.push("examiner_teacher");
  if (normalizedBenefits.includes("1 kem 1")) tags.push("personalized");

  return unique(tags.filter(Boolean));
}

function buildFaqSummary(faqItems) {
  return faqItems.slice(0, 3).map((item) => ({
    question: truncate(item.question, 120),
    answer: truncate(item.answer, 220),
  }));
}

function buildChatContext(cleanRow) {
  const parts = [
    `${cleanRow.course_name}: ${cleanRow.summary}`,
    cleanRow.who_should_take
      ? `Phù hợp với ${cleanRow.who_should_take}.`
      : "",
    cleanRow.format
      ? `Hình thức học: ${cleanRow.format}${cleanRow.class_size ? `, ${cleanRow.class_size}` : ""}.`
      : "",
    cleanRow.entry_requirements
      ? `Điều kiện/đầu vào gợi ý: ${cleanRow.entry_requirements}.`
      : "",
    cleanRow.outcome_or_commitment
      ? `Kết quả/cam kết: ${cleanRow.outcome_or_commitment}.`
      : "",
    cleanRow.key_benefits.length > 0
      ? `Điểm nổi bật: ${cleanRow.key_benefits.join("; ")}.`
      : "",
    cleanRow.timeline_summary
      ? `Thời lượng/thời gian: ${cleanRow.timeline_summary}.`
      : "",
    cleanRow.price_summary ? `Học phí: ${cleanRow.price_summary}.` : "",
  ];

  return truncate(parts.filter(Boolean).join(" "), 1400);
}

function buildCleanRow(rawRow) {
  const examFocus = deriveExamFocus(rawRow.slug);
  const variant = deriveVariant(rawRow.slug, rawRow.courseName);
  const audienceText = firstSectionContent(rawRow.sections, [
    "doi tuong",
    "danh cho ai",
  ]);
  const requirementText =
    firstSectionContent(rawRow.sections, ["dieu kien dau vao", "yeu cau dau vao"]) ||
    audienceText ||
    (["SSAT", "ISEE", "CAMBRIDGE_CHECKPOINT"].includes(examFocus)
      ? rawRow.introText
      : "");
  const goalText = firstSectionContent(rawRow.sections, ["muc tieu", "cam ket"]);
  const benefitText =
    firstSectionContent(rawRow.sections, ["loi ich", "ly do", "ky nang"]) || "";
  const teacherText = firstSectionContent(rawRow.sections, [
    "giao vien",
    "giang vien",
    "doi ngu",
  ]);
  const scheduleText = firstSectionContent(rawRow.sections, ["lich hoc"]);
  const priceText = firstFaqAnswer(rawRow.faqItems, ["hoc phi", "chi phi"]);
  const durationText =
    findFaqAnswer(rawRow.faqItems, (item) => {
      const question = normalizeText(item.question);
      return (
        (question.includes("bao lau") ||
          question.includes("keo dai") ||
          question.includes("thoi gian")) &&
        !question.includes("ket qua")
      );
    }) ||
    extractTimelineSnippets(
      [rawRow.introText, goalText, audienceText].filter(Boolean).join(" ")
    ).join(" | ");
  const classSize = extractClassSize(
    [rawRow.introText, rawRow.mainText].filter(Boolean).join(" ")
  );

  const keyBenefits = unique([
    ...extractBenefitHeadings(rawRow.headings),
    ...extractSentenceItems(benefitText, 5),
  ]).slice(0, 6);

  const teacherHighlights = extractTeacherHighlights(rawRow.headings, teacherText);
  const entryRequirements = extractRequirementSnippets(requirementText).join(" | ");
  const outcomeOrCommitment = truncate(
    goalText || extractSentenceItems(rawRow.introText, 3).find((item) => {
      const normalized = normalizeText(item);
      return normalized.includes("cam ket") || normalized.includes("tang den");
    }) || "",
    320
  );
  const whoShouldTake = truncate(
    audienceText || extractSentenceItems(rawRow.introText, 2).join(" "),
    320
  );
  const summary = truncate(rawRow.metaDescription || rawRow.introText, 240);
  const faqSummary = buildFaqSummary(rawRow.faqItems);

  const cleanRow = {
    id: rawRow.id,
    slug: rawRow.slug,
    course_name: rawRow.courseName,
    exam_focus: examFocus,
    variant,
    summary,
    who_should_take: whoShouldTake,
    format: deriveFormat(rawRow, examFocus, variant),
    class_size: classSize,
    entry_requirements: entryRequirements,
    outcome_or_commitment: outcomeOrCommitment,
    teacher_highlights: teacherHighlights,
    key_benefits: keyBenefits,
    price_summary: truncate(priceText, 220),
    timeline_summary: truncate(durationText, 220),
    schedule_summary: truncate(scheduleText, 260),
    faq_summary: faqSummary,
    source_url: rawRow.detailUrl,
    tags: deriveTags(examFocus, variant, classSize, whoShouldTake, keyBenefits),
    crawled_at: rawRow.crawledAt,
  };

  cleanRow.chat_context = buildChatContext(cleanRow);

  return cleanRow;
}

function csvEscape(value) {
  let text = "";

  if (value == null) {
    text = "";
  } else if (typeof value === "string") {
    text = value;
  } else if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    text = String(value);
  } else {
    text = JSON.stringify(value, null, 0);
  }

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function toCsv(rows) {
  const headers = [
    "id",
    "slug",
    "course_name",
    "exam_focus",
    "variant",
    "summary",
    "who_should_take",
    "format",
    "class_size",
    "entry_requirements",
    "outcome_or_commitment",
    "teacher_highlights",
    "key_benefits",
    "price_summary",
    "timeline_summary",
    "schedule_summary",
    "faq_summary",
    "source_url",
    "tags",
    "chat_context",
    "crawled_at",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const rawRows = JSON.parse(await fs.readFile(RAW_JSON_INPUT_FILE, "utf-8"));
  const cleanRows = rawRows.map(buildCleanRow);
  const cleanJson = JSON.stringify(cleanRows, null, 2);
  const cleanCsv = toCsv(cleanRows);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  await fs.writeFile(CLEAN_JSON_OUTPUT_FILE, cleanJson);
  await fs.writeFile(CLEAN_CSV_OUTPUT_FILE, cleanCsv);
  await fs.writeFile(PUBLIC_CLEAN_CSV_OUTPUT_FILE, cleanCsv);

  console.log(
    `Built ${cleanRows.length} cleaned courses -> ${path.relative(process.cwd(), CLEAN_CSV_OUTPUT_FILE)}`
  );
  console.log(
    `Mirrored cleaned CSV -> ${path.relative(process.cwd(), PUBLIC_CLEAN_CSV_OUTPUT_FILE)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
