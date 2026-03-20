import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://duhoc-etest.edu.vn";
const LIST_URL = `${BASE_URL}/danh-sach-truong/`;
const AJAX_URL = `${BASE_URL}/wp-admin/admin-ajax.php`;
const POSTS_API_URL = `${BASE_URL}/wp-json/wp/v2/posts`;
const OUTPUT_DIR = path.join(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.join(process.cwd(), "public", "data");
const JSON_OUTPUT_FILE = path.join(OUTPUT_DIR, "etest-school-directory.json");
const CSV_OUTPUT_FILE = path.join(OUTPUT_DIR, "etest-school-directory.csv");
const PUBLIC_CSV_OUTPUT_FILE = path.join(
  PUBLIC_DATA_DIR,
  "etest-school-directory.csv"
);

const LIST_PAGE_SIZE = 12;
const SECTION_KEYWORDS = {
  programs: [
    "chuong trinh dao tao",
    "nganh dao tao",
    "nganh hoc",
    "cac nganh",
    "linh vuc dao tao",
  ],
  requirements: [
    "dieu kien xet tuyen",
    "dieu kien dau vao",
    "yeu cau dau vao",
    "tieu chi tuyen sinh",
    "yeu cau xet tuyen",
  ],
  tuition: ["hoc phi va hoc bong", "hoc phi", "chi phi va hoc bong"],
};

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

function decodeHtml(value) {
  const named = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "-",
    mdash: "-",
    hellip: "...",
    rsquo: "'",
    lsquo: "'",
    ldquo: '"',
    rdquo: '"',
    middot: "·",
    bull: "•",
    deg: "°",
  };

  return String(value ?? "")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10))
    )
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&([a-z]+);/gi, (_, name) => named[name.toLowerCase()] ?? `&${name};`);
}

function stripTags(html) {
  return decodeHtml(
    String(html ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|ul|ol|h\d|section|figure|figcaption)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
  );
}

function toSlugFromUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/+$/, "");
  return pathname.split("/").filter(Boolean).at(-1) ?? "";
}

function parseAmount(raw) {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number.parseInt(digits, 10);
}

function parseTuitionRange(raw) {
  const values = [...String(raw ?? "").matchAll(/\d[\d.,]*/g)]
    .map((match) => parseAmount(match[0]))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return { tuitionMinUsd: null, tuitionMaxUsd: null };
  }

  if (values.length === 1) {
    return { tuitionMinUsd: values[0], tuitionMaxUsd: values[0] };
  }

  return {
    tuitionMinUsd: Math.min(...values),
    tuitionMaxUsd: Math.max(...values),
  };
}

function splitValues(raw) {
  return String(raw ?? "")
    .split(/,|\/|\||;|•|·/)
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseSchoolItems(html) {
  return html
    .split('<div class="school-item">')
    .slice(1)
    .map((chunk) => chunk.split('<div class="school-view-more-container">')[0])
    .map((chunk) => {
      const linkMatch = chunk.match(/<a href="([^"]+)"/i);
      const titleMatch = chunk.match(/<h3 class="school-item-title">([\s\S]*?)<\/h3>/i);
      const imageMatch =
        chunk.match(/<img [^>]*data-src="([^"]+)"/i) ??
        chunk.match(/<img [^>]*src="([^"]+)"/i);
      const altMatch = chunk.match(/<img [^>]*alt="([^"]+)"/i);
      const infoEntries = [
        ...chunk.matchAll(
          /<span>([^<:]+):<\/span>\s*<strong>([\s\S]*?)<\/strong>/gi
        ),
      ];

      const info = Object.fromEntries(
        infoEntries.map((entry) => [stripTags(entry[1]), stripTags(entry[2])])
      );

      const detailUrl = linkMatch?.[1]?.trim();
      if (!detailUrl) return null;

      const title = stripTags(titleMatch?.[1] ?? altMatch?.[1] ?? "");
      const tuitionRaw = info["Học phí"] ?? "";
      const { tuitionMinUsd, tuitionMaxUsd } = parseTuitionRange(tuitionRaw);

      return {
        id: toSlugFromUrl(detailUrl),
        slug: toSlugFromUrl(detailUrl),
        name: title.split(":")[0]?.trim() || title,
        title,
        detailUrl,
        imageUrl: imageMatch?.[1]?.trim() ?? "",
        country: info["Quốc gia"] ?? "",
        location: info["Tỉnh bang/Thành phố"] ?? "",
        levels: unique(splitValues(info["Bậc học"] ?? "")),
        tuitionRaw,
        tuitionMinUsd,
        tuitionMaxUsd,
        website: info["Website"] ?? "",
      };
    })
    .filter(Boolean);
}

function splitSections(html) {
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches = [...html.matchAll(headingRegex)];
  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const headingHtml = current[0];
    const heading = stripTags(current[2]);
    const start = current.index + headingHtml.length;
    const end = next?.index ?? html.length;
    const content = html.slice(start, end);
    sections.push({ heading, content });
  }

  return sections;
}

function findSection(sections, keywords) {
  return (
    sections.find((section) => {
      const heading = normalizeText(section.heading);
      return keywords.some((keyword) => heading.includes(keyword));
    }) ?? null
  );
}

function extractListItems(html) {
  return unique(
    [...String(html ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => stripTags(match[1]))
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean)
  );
}

function truncate(value, maxLength = 280) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function parseRequirementMetrics(text) {
  const normalized = stripTags(text);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);

  const findLine = (keyword) =>
    lines.find((line) => normalizeText(line).includes(keyword)) ?? "";

  const parseFloatMetric = (line, regex) => {
    const match = String(line).match(regex);
    if (!match) return null;
    return Number.parseFloat(match[1].replace(",", "."));
  };

  const parseIntMetric = (line, regex) => {
    const match = String(line).match(regex);
    if (!match) return null;
    return Number.parseInt(match[1].replace(/[^\d]/g, ""), 10);
  };

  const parseLastNumberString = (line) => {
    const matches = [
      ...String(line).matchAll(/\d+(?:[.,]\d+)?(?:\s*\/\s*\d+(?:[.,]\d+)?)?/g),
    ];
    return matches.at(-1)?.[0]?.replace(/\s+/g, "") ?? "";
  };

  const ieltsLine = findLine("ielts");
  const toeflLine = findLine("toefl");
  const satLine = findLine("sat");
  const gpaLine = findLine("gpa");

  return {
    ieltsMin: parseFloatMetric(ieltsLine, /(\d+(?:[.,]\d+)?)/),
    toeflMin: parseIntMetric(toeflLine, /(\d+(?:[.,]\d+)?)/),
    satMin: parseIntMetric(satLine, /(\d{3,4})/),
    gpaRequirement: parseLastNumberString(gpaLine),
  };
}

function extractScholarshipSummary(sectionText) {
  const lines = unique(
    sectionText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => normalizeText(line).includes("hoc bong"))
  );

  return truncate(lines.join(" | ") || sectionText);
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Failed request ${response.status} for ${url}`);
  }
  return response.text();
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Failed request ${response.status} for ${url}`);
  }
  return response.json();
}

async function fetchAllSchoolCards() {
  const initialHtml = await fetchText(LIST_URL);
  const results = parseSchoolItems(initialHtml);
  let offset = results.length;

  while (true) {
    const form = new URLSearchParams({
      action: "get_more_schools",
      country: "",
      nofilter: "1",
      city: "",
      grade: "",
      "min-fee": "0",
      "max-fee": "60000",
      offset: String(offset),
    });

    const html = await fetchText(AJAX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: form.toString(),
    });

    if (normalizeText(html).includes("khong co them truong nao khac")) {
      break;
    }

    const pageItems = parseSchoolItems(html);
    if (pageItems.length === 0) {
      break;
    }

    results.push(...pageItems);
    offset += pageItems.length;

    if (pageItems.length < LIST_PAGE_SIZE) {
      break;
    }
  }

  return uniqueBy(results, (item) => item.slug);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const next = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(item);
  }

  return next;
}

async function fetchPostDetails(slug) {
  const query = new URLSearchParams({
    slug,
    _fields: "slug,link,title,excerpt,content",
  });
  const data = await fetchJson(`${POSTS_API_URL}?${query.toString()}`);
  return data[0] ?? null;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
}

function buildDirectoryEntry(card, post, crawledAt) {
  const contentHtml = post?.content?.rendered ?? "";
  const excerpt = stripTags(post?.excerpt?.rendered ?? "");
  const sections = splitSections(contentHtml);
  const programSection = findSection(sections, SECTION_KEYWORDS.programs);
  const requirementsSection = findSection(sections, SECTION_KEYWORDS.requirements);
  const tuitionSection = findSection(sections, SECTION_KEYWORDS.tuition);

  const fields = extractListItems(programSection?.content ?? "");
  const requirementsList = extractListItems(requirementsSection?.content ?? "");
  const requirementsSummary = truncate(
    requirementsList.join(" | ") || stripTags(requirementsSection?.content ?? "")
  );
  const tuitionSummary = truncate(stripTags(tuitionSection?.content ?? ""));
  const tuitionMetrics = parseRequirementMetrics(requirementsSection?.content ?? "");
  const scholarshipSummary = extractScholarshipSummary(tuitionSummary);
  const scholarshipAvailable =
    normalizeText(card.title).includes("hoc bong") ||
    normalizeText(tuitionSummary).includes("hoc bong");

  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    title: card.title,
    country: card.country,
    location: card.location,
    levels: card.levels,
    tuitionRaw: card.tuitionRaw,
    tuitionMinUsd: card.tuitionMinUsd,
    tuitionMaxUsd: card.tuitionMaxUsd,
    scholarshipAvailable,
    scholarshipSummary,
    fields,
    requirementsSummary,
    ieltsMin: tuitionMetrics.ieltsMin,
    toeflMin: tuitionMetrics.toeflMin,
    satMin: tuitionMetrics.satMin,
    gpaRequirement: tuitionMetrics.gpaRequirement,
    website: card.website,
    detailUrl: card.detailUrl,
    imageUrl: card.imageUrl,
    excerpt: truncate(excerpt || stripTags(contentHtml), 360),
    crawledAt,
  };
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  const headers = [
    "id",
    "slug",
    "name",
    "title",
    "country",
    "location",
    "levels",
    "tuition_raw",
    "tuition_min_usd",
    "tuition_max_usd",
    "scholarship_available",
    "scholarship_summary",
    "fields",
    "requirements_summary",
    "ielts_min",
    "toefl_min",
    "sat_min",
    "gpa_requirement",
    "website",
    "detail_url",
    "image_url",
    "excerpt",
    "crawled_at",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      headers
        .map((header) =>
          csvEscape(
            row[
              {
                tuition_raw: "tuitionRaw",
                tuition_min_usd: "tuitionMinUsd",
                tuition_max_usd: "tuitionMaxUsd",
                scholarship_available: "scholarshipAvailable",
                scholarship_summary: "scholarshipSummary",
                requirements_summary: "requirementsSummary",
                ielts_min: "ieltsMin",
                toefl_min: "toeflMin",
                sat_min: "satMin",
                gpa_requirement: "gpaRequirement",
                detail_url: "detailUrl",
                image_url: "imageUrl",
                crawled_at: "crawledAt",
              }[header] ?? header
            ]
          )
        )
        .join(",")
    );
  }
  return `${lines.join("\n")}\n`;
}

async function writeOutputs(rows) {
  const json = JSON.stringify(rows, null, 2);
  const csv = toCsv(rows);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  await fs.writeFile(JSON_OUTPUT_FILE, json);
  await fs.writeFile(CSV_OUTPUT_FILE, csv);
  await fs.writeFile(PUBLIC_CSV_OUTPUT_FILE, csv);
}

async function main() {
  const crawledAt = new Date().toISOString();
  const cards = await fetchAllSchoolCards();
  const posts = await mapWithConcurrency(cards, 6, async (card) => {
    const post = await fetchPostDetails(card.slug);
    return buildDirectoryEntry(card, post, crawledAt);
  });

  await writeOutputs(posts);

  console.log(
    `Crawled ${posts.length} schools -> ${path.relative(process.cwd(), JSON_OUTPUT_FILE)}`
  );
  console.log(
    `Exported CSV -> ${path.relative(process.cwd(), PUBLIC_CSV_OUTPUT_FILE)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
