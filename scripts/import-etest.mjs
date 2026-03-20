import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

const BASE_URL = "https://etest.edu.vn";
const WP_API_BASE = `${BASE_URL}/wp-json/wp/v2`;
const GENERATED_DIR = path.join(process.cwd(), "content", "generated");
const STYLE_DIR = path.join(process.cwd(), "public", "et-source", "styles");
const BASE_HOSTNAME = new URL(BASE_URL).hostname;

const EXCLUDED_PREFIXES = ["/programs/", "/studying-abroad/", "/science-camp/"];

function normalizePathname(input) {
  if (!input || input === "//") {
    return "/";
  }

  let url;
  try {
    url = input.startsWith("http") ? new URL(input) : new URL(input, BASE_URL);
  } catch {
    return "/";
  }

  let pathname = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");

  if (!pathname || pathname === "//") {
    pathname = "/";
  }

  if (pathname !== "/" && !pathname.endsWith("/")) {
    pathname = `${pathname}/`;
  }

  return pathname;
}

function shouldExcludePath(pathname) {
  return EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function hashValue(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function decodeHtml(value = "") {
  return cheerio.load(`<div>${value}</div>`).text().replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return cheerio.load(`<div>${value}</div>`).text().replace(/\s+/g, " ").trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "LotusHack-2026 ETEST importer",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchPaginatedRestCollection(type) {
  const items = [];
  let page = 1;

  while (true) {
    const endpoint = new URL(`${WP_API_BASE}/${type}`);
    endpoint.searchParams.set("per_page", "100");
    endpoint.searchParams.set("page", String(page));
    endpoint.searchParams.set("_embed", "wp:featuredmedia");

    const response = await fetch(endpoint, {
      headers: {
        "user-agent": "LotusHack-2026 ETEST importer",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} page ${page}: ${response.status}`);
    }

    const pageItems = await response.json();
    items.push(...pageItems);

    const totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
    if (page >= totalPages) {
      break;
    }

    page += 1;
  }

  return items;
}

async function fetchSitemapUrls(url) {
  const xml = await fetchText(url);
  const $ = cheerio.load(xml, { xmlMode: true });

  return $("url > loc")
    .map((_, element) => $(element).text().trim())
    .get();
}

function absolutizeUrl(rawUrl, base = BASE_URL) {
  if (!rawUrl) {
    return "";
  }

  if (rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  try {
    return new URL(rawUrl, base).toString();
  } catch {
    return "";
  }
}

function rewriteInternalAnchors($, root) {
  root.find("a[href]").each((_, element) => {
    const rawHref = $(element).attr("href");
    if (!rawHref) {
      return;
    }

    if (rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }

    const absoluteHref = absolutizeUrl(rawHref);
    if (!absoluteHref) {
      return;
    }

    const url = new URL(absoluteHref);

    if (url.hostname === BASE_HOSTNAME) {
      $(element).attr("href", normalizePathname(url.pathname));
      $(element).removeAttr("target");
      $(element).removeAttr("rel");
      return;
    }

    $(element).attr("href", url.toString());
    $(element).attr("target", "_blank");
    $(element).attr("rel", "noreferrer noopener");
  });

  root.find("img[src], source[src], source[srcset]").each((_, element) => {
    const src = $(element).attr("src");
    if (src) {
      $(element).attr("src", absolutizeUrl(src));
    }

    const srcSet = $(element).attr("srcset");
    if (srcSet) {
      const normalizedSrcSet = srcSet
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const [assetUrl, descriptor] = item.split(/\s+/, 2);
          const absoluteAssetUrl = absolutizeUrl(assetUrl);
          return descriptor ? `${absoluteAssetUrl} ${descriptor}` : absoluteAssetUrl;
        })
        .join(", ");
      $(element).attr("srcset", normalizedSrcSet);
    }
  });
}

function stripUnsafeNodes($, root) {
  root.find("script, noscript, iframe, style").remove();
  root.find("form").each((_, formElement) => {
    $(formElement).replaceWith(
      '<div class="etest-form-placeholder">This imported form is replaced by the reusable Next.js lead form rendered below the page.</div>',
    );
  });

  root.find("*").each((_, element) => {
    const attributes = element.attribs || {};
    for (const attributeName of Object.keys(attributes)) {
      if (attributeName.toLowerCase().startsWith("on")) {
        $(element).removeAttr(attributeName);
      }
    }
  });
}

function sanitizeFragment(html) {
  const $ = cheerio.load(`<div data-etest-root="true">${html}</div>`, {
    decodeEntities: false,
  });
  const root = $("[data-etest-root='true']");

  stripUnsafeNodes($, root);
  rewriteInternalAnchors($, root);

  return root.html() ?? "";
}

function rewriteCssUrls(css, stylesheetUrl) {
  return css.replace(/url\(([^)]+)\)/g, (_, rawToken) => {
    const token = rawToken.trim().replace(/^['"]|['"]$/g, "");

    if (!token || token.startsWith("data:")) {
      return `url("${token}")`;
    }

    if (token.startsWith("http://") || token.startsWith("https://")) {
      return `url("${token}")`;
    }

    return `url("${absolutizeUrl(token, stylesheetUrl)}")`;
  });
}

function extractNavigationItems(headerHtml) {
  const $ = cheerio.load(headerHtml);
  const seen = new Set();
  const items = [];
  const selectors = [
    ".header-nav-main > li > a",
    "#main-menu .nav-sidebar > li > a",
    ".nav-top-link",
  ];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const rawHref = $(element).attr("href");
      const label = $(element).text().replace(/\s+/g, " ").trim();

      if (!rawHref || !label) {
        return;
      }

      const absoluteHref = absolutizeUrl(rawHref);
      const url = new URL(absoluteHref);
      const href = url.hostname === BASE_HOSTNAME ? normalizePathname(url.pathname) : url.toString();
      const key = `${label}:${href}`;

      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      items.push({
        label,
        href,
        external: url.hostname !== BASE_HOSTNAME,
      });
    });

    if (items.length >= 6) {
      break;
    }
  }

  return items;
}

async function downloadStylesheets(homeHtml) {
  const $ = cheerio.load(homeHtml);
  const localStylesheets = [];
  const remoteStylesheets = [];
  const seen = new Set();
  let index = 0;

  await mkdir(STYLE_DIR, { recursive: true });

  for (const element of $("link[rel='stylesheet'][href]").toArray()) {
    const rawHref = $(element).attr("href");
    if (!rawHref || rawHref.startsWith("data:")) {
      continue;
    }

    const stylesheetUrl = absolutizeUrl(rawHref);
    if (!stylesheetUrl) {
      continue;
    }

    if (seen.has(stylesheetUrl)) {
      continue;
    }

    seen.add(stylesheetUrl);
    const url = new URL(stylesheetUrl);

    if (!url.pathname.endsWith(".css")) {
      continue;
    }

    if (url.hostname !== BASE_HOSTNAME) {
      remoteStylesheets.push(url.toString());
      continue;
    }

    const css = await fetchText(url.toString());
    const fileName = `${String(index).padStart(2, "0")}-${path
      .basename(url.pathname)
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${hashValue(url.toString())}.css`;

    await writeFile(path.join(STYLE_DIR, fileName), rewriteCssUrls(css, url.toString()), "utf8");
    localStylesheets.push(`/et-source/styles/${fileName}`);
    index += 1;
  }

  return {
    localStylesheets,
    remoteStylesheets,
  };
}

function buildWrappedRestHtml(kind, item, featuredImage) {
  const title = item.title?.rendered ?? "";
  const content = sanitizeFragment(item.content?.rendered ?? "");
  const titleHtml = title;
  const featuredImageHtml = featuredImage
    ? `<div class="entry-image"><img src="${featuredImage}" alt="${decodeHtml(title)}" loading="lazy" /></div>`
    : "";

  if (kind === "home") {
    return `
      <main id="main" class="site-main">
        <div class="page-wrapper">
          <div class="page-inner">
            ${content}
          </div>
        </div>
      </main>
    `;
  }

  if (kind === "post") {
    return `
      <main id="main" class="site-main">
        <div class="page-wrapper page-right-sidebar">
          <div class="row row-large row-divided">
            <div class="large-12 col">
              <article class="post type-post status-publish">
                <div class="article-inner">
                  <header class="entry-header">
                    <h1 class="entry-title">${titleHtml}</h1>
                  </header>
                  ${featuredImageHtml}
                  <div class="entry-content single-page">
                    ${content}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  return `
    <main id="main" class="site-main">
      <div class="page-wrapper">
        <div class="page-inner">
          <header class="page-header">
            <h1 class="entry-title main-title">${titleHtml}</h1>
          </header>
          ${featuredImageHtml}
          <div class="entry-content">
            ${content}
          </div>
        </div>
      </div>
    </main>
  `;
}

function extractFeaturedImage(restItem) {
  return (
    restItem?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    restItem?._embedded?.["wp:featuredmedia"]?.[0]?.guid?.rendered ||
    undefined
  );
}

function collectInlineImages(html) {
  const $ = cheerio.load(html);
  const images = new Set();

  $("img[src]").each((_, element) => {
    const src = $(element).attr("src");
    if (src) {
      images.add(absolutizeUrl(src));
    }
  });

  return Array.from(images);
}

async function importRestRecords(type, items) {
  return items
    .map((item) => {
      const pathname = normalizePathname(item.link || "/");
      if (shouldExcludePath(pathname)) {
        return null;
      }

      const featuredImage = extractFeaturedImage(item);
      const kind = pathname === "/" ? "home" : type === "posts" ? "post" : "page";
      const html = buildWrappedRestHtml(kind, item, featuredImage);
      const description = stripHtml(item.excerpt?.rendered ?? "");
      const title = decodeHtml(item.title?.rendered ?? "");

      return {
        id: `${kind}:${pathname}`,
        sourceId: item.id,
        kind,
        path: pathname,
        slug: pathname === "/" ? "home" : pathname.split("/").filter(Boolean).at(-1),
        title,
        description,
        excerpt: description,
        html,
        sourceUrl: item.link,
        canonicalUrl: pathname,
        publishedAt: item.date_gmt || item.date,
        updatedAt: item.modified_gmt || item.modified,
        featuredImage,
        bodyClass:
          kind === "home"
            ? `home page page-id-${item.id}`
            : kind === "post"
              ? `single single-post postid-${item.id}`
              : `page page-id-${item.id}`,
      };
    })
    .filter(Boolean);
}

async function importCourseRecord(url) {
  const html = await fetchText(url);
  const $ = cheerio.load(html, { decodeEntities: false });
  const mainHtml = $.html($("main#main").first()) || "";
  const pathname = normalizePathname(url);

  if (!mainHtml || shouldExcludePath(pathname)) {
    return null;
  }

  return {
    id: `course:${pathname}`,
    kind: "course",
    path: pathname,
    slug: pathname.split("/").filter(Boolean).at(-1),
    title:
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() ||
      pathname.split("/").filter(Boolean).at(-1),
    description:
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "",
    excerpt:
      $("main#main")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 240),
    html: sanitizeFragment(mainHtml),
    sourceUrl: url,
    canonicalUrl: pathname,
    updatedAt: $('meta[property="og:updated_time"]').attr("content") || undefined,
    featuredImage:
      $('meta[property="og:image"]').attr("content") ||
      $("main#main img").first().attr("src") ||
      undefined,
    bodyClass: $("body").attr("class") || "page page-course",
  };
}

function dedupeRoutes(routes) {
  const routeMap = new Map();

  for (const route of routes) {
    if (!route || !route.path) {
      continue;
    }

    routeMap.set(route.path, route);
  }

  return Array.from(routeMap.values()).sort((left, right) => left.path.localeCompare(right.path));
}

async function main() {
  console.log("Fetching homepage chrome and stylesheet manifest...");
  const homeHtml = await fetchText(BASE_URL);
  const $home = cheerio.load(homeHtml, { decodeEntities: false });
  const headerHtml = sanitizeFragment($home.html($home("#header").first()) || "");
  const footerHtml = sanitizeFragment($home.html($home("#footer").first()) || "");
  const navigation = extractNavigationItems(headerHtml);
  const { localStylesheets, remoteStylesheets } = await downloadStylesheets(homeHtml);

  console.log("Fetching WordPress pages and posts via REST API...");
  const [pages, posts, courseUrls] = await Promise.all([
    fetchPaginatedRestCollection("pages"),
    fetchPaginatedRestCollection("posts"),
    fetchSitemapUrls(`${BASE_URL}/khoa-hoc-sitemap.xml`),
  ]);

  console.log(`Pages: ${pages.length}, posts: ${posts.length}, courses: ${courseUrls.length}`);

  const [pageRecords, postRecords, courseRecords] = await Promise.all([
    importRestRecords("pages", pages),
    importRestRecords("posts", posts),
    Promise.all(courseUrls.map((url) => importCourseRecord(url))),
  ]);

  const routes = dedupeRoutes([...pageRecords, ...postRecords, ...courseRecords.filter(Boolean)]);
  const mediaManifest = routes.map((route) => ({
    path: route.path,
    kind: route.kind,
    featuredImage: route.featuredImage || null,
    inlineImages: collectInlineImages(route.html),
  }));

  await mkdir(GENERATED_DIR, { recursive: true });

  await writeFile(
    path.join(GENERATED_DIR, "site.json"),
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        sourceBaseUrl: BASE_URL,
        brandName: "ETEST Frontend Clone",
        stylesheets: localStylesheets,
        remoteStylesheets,
        headerHtml,
        footerHtml,
        navigation,
      },
      null,
      2,
    ),
    "utf8",
  );

  await writeFile(path.join(GENERATED_DIR, "routes.json"), JSON.stringify(routes, null, 2), "utf8");
  await writeFile(
    path.join(GENERATED_DIR, "media-manifest.json"),
    JSON.stringify(mediaManifest, null, 2),
    "utf8",
  );

  console.log(`Imported ${routes.length} routes into ${GENERATED_DIR}`);
  console.log(`Downloaded ${localStylesheets.length} local stylesheets`);
}

main().catch((error) => {
  console.error("ETEST import failed");
  console.error(error);
  process.exitCode = 1;
});
