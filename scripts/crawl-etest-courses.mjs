import fs from "node:fs/promises";
import path from "node:path";

const BASE_URL = "https://etest.edu.vn";
const LIST_URL = `${BASE_URL}/khoa-hoc/`;
const OUTPUT_DIR = path.join(process.cwd(), "data");
const PUBLIC_DATA_DIR = path.join(process.cwd(), "public", "data");
const JSON_OUTPUT_FILE = path.join(OUTPUT_DIR, "etest-course-directory.json");
const CSV_OUTPUT_FILE = path.join(OUTPUT_DIR, "etest-course-directory.csv");
const PUBLIC_CSV_OUTPUT_FILE = path.join(
  PUBLIC_DATA_DIR,
  "etest-course-directory.csv"
);
const CONCURRENCY = 4;

const REQUEST_HEADERS = {
  "accept-language": "vi,en;q=0.9",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
};

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
    trade: "™",
    reg: "®",
    copy: "©",
  };

  return String(value ?? "")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10))
    )
    .replace(/&#x([\da-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(
      /&([a-z]+);/gi,
      (_, name) => named[name.toLowerCase()] ?? `&${name};`
    );
}

function stripTags(html) {
  return decodeHtml(
    String(html ?? "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|ul|ol|h\d|section|article|table|tr)>/gi, "\n")
      .replace(/<\/(td|th)>/gi, "\t")
      .replace(/<[^>]+>/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim()
  );
}

function compactText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = getKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }

  return output;
}

function toSlugFromUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/+$/, "");
  return pathname.split("/").filter(Boolean).at(-1) ?? "";
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function truncate(value, maxLength = 400) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

async function fetchText(url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...REQUEST_HEADERS,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Failed request ${response.status} for ${url}`);
  }

  return {
    status: response.status,
    url: response.url,
    text,
  };
}

function extractMetaContent(html, name, attribute = "name") {
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${escapeRegex(name)}["'][^>]+content=["']([\\s\\S]*?)["'][^>]*>`,
    "i"
  );

  return decodeHtml(pattern.exec(html)?.[1] ?? "").trim();
}

function extractLinkHref(html, rel) {
  const pattern = new RegExp(
    `<link[^>]+rel=["']${escapeRegex(rel)}["'][^>]+href=["']([^"']+)["'][^>]*>`,
    "i"
  );

  return decodeHtml(pattern.exec(html)?.[1] ?? "").trim();
}

function extractTitle(html) {
  return stripTags(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
}

function extractBodyClasses(html) {
  const match = html.match(/<body[^>]+class=["']([^"']+)["']/i);
  return compactText(decodeHtml(match?.[1] ?? ""));
}

function extractPostId(html) {
  const classes = extractBodyClasses(html);
  const match = classes.match(/\bpostid-(\d+)\b/);
  return match?.[1] ?? "";
}

function extractMainHtml(html) {
  return html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]?.trim() ?? "";
}

function extractHeadings(html) {
  return unique(
    [...String(html ?? "").matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)]
      .map((match) => stripTags(match[2]))
      .map((heading) => compactText(heading))
      .filter(Boolean)
  );
}

function extractParagraphs(html, limit = Infinity) {
  return unique(
    [...String(html ?? "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => stripTags(match[1]))
      .map((paragraph) => compactText(paragraph))
      .filter(Boolean)
      .slice(0, limit)
  );
}

function extractListItems(html) {
  return unique(
    [...String(html ?? "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => stripTags(match[1]))
      .map((item) => compactText(item))
      .filter(Boolean)
  );
}

function extractTables(html) {
  return [...String(html ?? "").matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)]
    .map((tableMatch) => {
      const rows = [...tableMatch[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
        .map((rowMatch) =>
          [...rowMatch[1].matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
            .map((cellMatch) => compactText(stripTags(cellMatch[2])))
            .filter(Boolean)
        )
        .filter((row) => row.length > 0);

      return { rows };
    })
    .filter((table) => table.rows.length > 0);
}

function extractFaqItems(html) {
  return [...String(html ?? "").matchAll(
    /<div class="accordion-item"[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<div class="accordion-inner">([\s\S]*?)<\/div>\s*<\/div>/gi
  )]
    .map((match) => ({
      question: compactText(stripTags(match[1])),
      answer: compactText(stripTags(match[2])),
    }))
    .filter((item) => item.question && item.answer);
}

function extractImageUrls(html) {
  const images = [];

  for (const match of String(html ?? "").matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const dataSrc = tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1] ?? "";
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
    const url = dataSrc || src;

    if (!url || url.startsWith("data:")) continue;
    if (!/^https?:\/\//i.test(url)) continue;

    images.push(decodeHtml(url.trim()));
  }

  return unique(images);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractJsonLd(html) {
  return [...String(html ?? "").matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )]
    .map((match) => match[1].trim())
    .map((block) => safeJsonParse(block) ?? { raw: block })
    .filter(Boolean);
}

function splitSections(html) {
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches = [...String(html ?? "").matchAll(headingRegex)];
  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const headingHtml = current[0];
    const heading = compactText(stripTags(current[2]));
    const start = current.index + headingHtml.length;
    const end = next?.index ?? html.length;
    const contentHtml = html.slice(start, end);
    const contentText = compactText(stripTags(contentHtml));

    if (!heading) continue;

    sections.push({
      heading,
      content: truncate(contentText, 1200),
    });
  }

  return sections;
}

function extractCourseCards(listHtml) {
  const cardMap = new Map();
  const blockPattern =
    /<h2>\s*<a\s+href="(https:\/\/etest\.edu\.vn\/khoa-hoc\/[a-z0-9-]+\/)">([\s\S]*?)<\/a>\s*<\/h2>\s*<div class="info">\s*<p>([\s\S]*?)<\/p>/gi;

  for (const match of listHtml.matchAll(blockPattern)) {
    const detailUrl = match[1];
    const slug = toSlugFromUrl(detailUrl);

    cardMap.set(slug, {
      slug,
      detailUrl,
      listTitle: compactText(stripTags(match[2])),
      listSummary: compactText(stripTags(match[3])),
    });
  }

  const linkPattern =
    /<a[^>]+href="(https:\/\/etest\.edu\.vn\/khoa-hoc\/[a-z0-9-]+\/)"[^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of listHtml.matchAll(linkPattern)) {
    const detailUrl = match[1];
    const slug = toSlugFromUrl(detailUrl);
    const existing = cardMap.get(slug) ?? {
      slug,
      detailUrl,
      listTitle: "",
      listSummary: "",
    };
    const anchorText = compactText(stripTags(match[2]));

    if (!existing.listTitle && anchorText) {
      existing.listTitle = anchorText;
    }

    cardMap.set(slug, existing);
  }

  return [...cardMap.values()];
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

function buildCourseRow(card, page, crawledAt) {
  const html = page.text;
  const mainHtml = extractMainHtml(html);
  const headings = extractHeadings(mainHtml);
  const introParagraphs = extractParagraphs(mainHtml, 6);
  const faqItems = extractFaqItems(mainHtml);
  const tables = extractTables(mainHtml);
  const listItems = extractListItems(mainHtml);
  const imageUrls = extractImageUrls(mainHtml);
  const sections = splitSections(mainHtml);
  const schema = extractJsonLd(html);
  const mainText = stripTags(mainHtml);
  const courseName = card.listTitle || headings[0] || extractTitle(html);

  return {
    id: card.slug,
    slug: card.slug,
    sourceListUrl: LIST_URL,
    detailUrl: card.detailUrl,
    finalUrl: page.url,
    status: page.status,
    postId: extractPostId(html),
    bodyClasses: extractBodyClasses(html),
    courseName,
    listTitle: card.listTitle,
    listSummary: card.listSummary,
    pageTitle: extractTitle(html),
    metaDescription: extractMetaContent(html, "description"),
    ogTitle: extractMetaContent(html, "og:title", "property"),
    ogDescription: extractMetaContent(html, "og:description", "property"),
    canonicalUrl: extractLinkHref(html, "canonical"),
    shortlink: extractLinkHref(html, "shortlink"),
    articlePublishedTime: extractMetaContent(
      html,
      "article:published_time",
      "property"
    ),
    articleModifiedTime: extractMetaContent(
      html,
      "article:modified_time",
      "property"
    ),
    heroTitle: headings[0] ?? "",
    introText: introParagraphs.join(" | "),
    introParagraphs,
    headingCount: headings.length,
    headings,
    sectionCount: sections.length,
    sections,
    faqCount: faqItems.length,
    faqItems,
    tableCount: tables.length,
    tables,
    listItemCount: listItems.length,
    listItems,
    imageCount: imageUrls.length,
    imageUrls,
    schemaJsonLd: schema,
    mainHtml,
    mainText,
    crawledAt,
    error: "",
  };
}

function buildErrorRow(card, error, crawledAt) {
  return {
    id: card.slug,
    slug: card.slug,
    sourceListUrl: LIST_URL,
    detailUrl: card.detailUrl,
    finalUrl: "",
    status: "",
    postId: "",
    bodyClasses: "",
    courseName: card.listTitle,
    listTitle: card.listTitle,
    listSummary: card.listSummary,
    pageTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    canonicalUrl: "",
    shortlink: "",
    articlePublishedTime: "",
    articleModifiedTime: "",
    heroTitle: "",
    introText: "",
    introParagraphs: [],
    headingCount: 0,
    headings: [],
    sectionCount: 0,
    sections: [],
    faqCount: 0,
    faqItems: [],
    tableCount: 0,
    tables: [],
    listItemCount: 0,
    listItems: [],
    imageCount: 0,
    imageUrls: [],
    schemaJsonLd: [],
    mainHtml: "",
    mainText: "",
    crawledAt,
    error: String(error instanceof Error ? error.message : error),
  };
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
    text = JSON.stringify(value);
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
    "source_list_url",
    "detail_url",
    "final_url",
    "status",
    "post_id",
    "body_classes",
    "course_name",
    "list_title",
    "list_summary",
    "page_title",
    "meta_description",
    "og_title",
    "og_description",
    "canonical_url",
    "shortlink",
    "article_published_time",
    "article_modified_time",
    "hero_title",
    "intro_text",
    "intro_paragraphs_json",
    "heading_count",
    "headings_json",
    "section_count",
    "sections_json",
    "faq_count",
    "faq_items_json",
    "table_count",
    "tables_json",
    "list_item_count",
    "list_items_json",
    "image_count",
    "image_urls_json",
    "schema_jsonld",
    "main_text",
    "crawled_at",
    "error",
  ];

  const keyMap = {
    source_list_url: "sourceListUrl",
    detail_url: "detailUrl",
    final_url: "finalUrl",
    post_id: "postId",
    body_classes: "bodyClasses",
    course_name: "courseName",
    list_title: "listTitle",
    list_summary: "listSummary",
    page_title: "pageTitle",
    meta_description: "metaDescription",
    og_title: "ogTitle",
    og_description: "ogDescription",
    canonical_url: "canonicalUrl",
    article_published_time: "articlePublishedTime",
    article_modified_time: "articleModifiedTime",
    hero_title: "heroTitle",
    intro_text: "introText",
    intro_paragraphs_json: "introParagraphs",
    heading_count: "headingCount",
    headings_json: "headings",
    section_count: "sectionCount",
    sections_json: "sections",
    faq_count: "faqCount",
    faq_items_json: "faqItems",
    table_count: "tableCount",
    tables_json: "tables",
    list_item_count: "listItemCount",
    list_items_json: "listItems",
    image_count: "imageCount",
    image_urls_json: "imageUrls",
    schema_jsonld: "schemaJsonLd",
    main_text: "mainText",
    crawled_at: "crawledAt",
  };

  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      headers
        .map((header) => csvEscape(row[keyMap[header] ?? header]))
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
  const listPage = await fetchText(LIST_URL);
  const cards = uniqueBy(extractCourseCards(listPage.text), (card) => card.slug);

  const rows = await mapWithConcurrency(cards, CONCURRENCY, async (card) => {
    try {
      const page = await fetchText(card.detailUrl);
      return buildCourseRow(card, page, crawledAt);
    } catch (error) {
      return buildErrorRow(card, error, crawledAt);
    }
  });

  await writeOutputs(rows);

  console.log(
    `Crawled ${rows.length} courses -> ${path.relative(process.cwd(), CSV_OUTPUT_FILE)}`
  );
  console.log(
    `Mirrored CSV -> ${path.relative(process.cwd(), PUBLIC_CSV_OUTPUT_FILE)}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
