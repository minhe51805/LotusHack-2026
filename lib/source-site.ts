import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import "server-only";

export type SiteNavigationItem = {
  label: string;
  href: string;
  external?: boolean;
  hasDropdown?: boolean;
};

export type SiteChrome = {
  importedAt?: string;
  sourceBaseUrl: string;
  brandName: string;
  stylesheets: string[];
  remoteStylesheets: string[];
  headerHtml: string;
  footerHtml: string;
  navigation: SiteNavigationItem[];
};

export type EtestRouteRecord = {
  id: string;
  sourceId?: number;
  kind: "home" | "page" | "post" | "course";
  path: string;
  slug: string;
  title: string;
  description?: string;
  excerpt?: string;
  html: string;
  sourceUrl: string;
  canonicalUrl: string;
  publishedAt?: string;
  updatedAt?: string;
  featuredImage?: string;
  bodyClass?: string;
};

const GENERATED_DIR = path.join(process.cwd(), "content", "generated");
const SITE_FILE = path.join(GENERATED_DIR, "site.json");
const ROUTES_FILE = path.join(GENERATED_DIR, "routes.json");

const defaultNavigation: SiteNavigationItem[] = [
  { label: "About ETEST", href: "/ve-etest/" },
  { label: "Achievements", href: "/thanh-tich/" },
  { label: "Teachers", href: "/doi-ngu-giao-vien/" },
  { label: "IELTS", href: "/khoa-hoc/luyen-thi-ielts/" },
  { label: "SAT", href: "/khoa-hoc/luyen-thi-sat/" },
];

const defaultSiteChrome: SiteChrome = {
  sourceBaseUrl: "https://etest.edu.vn",
  brandName: "ETEST Frontend Clone",
  stylesheets: [],
  remoteStylesheets: [],
  headerHtml: "",
  footerHtml: "",
  navigation: defaultNavigation,
};

async function readJsonFile<T>(filePath: string, fallbackValue: T) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallbackValue;
    }

    throw error;
  }
}

export function normalizeContentPath(slug?: string[] | string) {
  const pathname = Array.isArray(slug)
    ? `/${slug.join("/")}`
    : typeof slug === "string"
      ? slug
      : "/";

  const clean = pathname.replace(/[?#].*$/, "").replace(/\/{2,}/g, "/").replace(/^\s+|\s+$/g, "");

  if (!clean || clean === "/") {
    return "/";
  }

  return clean.endsWith("/") ? clean : `${clean}/`;
}

const loadImportedDataset = cache(async () => {
  const site = await readJsonFile<SiteChrome>(SITE_FILE, defaultSiteChrome);
  const routes = await readJsonFile<EtestRouteRecord[]>(ROUTES_FILE, []);

  const normalizedRoutes = routes
    .map((route) => ({
      ...route,
      path: normalizeContentPath(route.path),
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const routeMap = new Map(normalizedRoutes.map((route) => [route.path, route]));

  return {
    site: {
      ...defaultSiteChrome,
      ...site,
      navigation: site.navigation?.length ? site.navigation : defaultNavigation,
    },
    routes: normalizedRoutes,
    routeMap,
  };
});

export async function getSiteChrome() {
  return (await loadImportedDataset()).site;
}

export async function getAllRoutes() {
  return (await loadImportedDataset()).routes;
}

export async function hasImportedRoutes() {
  return (await loadImportedDataset()).routes.length > 0;
}

export async function getRouteByPath(pathname: string) {
  return (await loadImportedDataset()).routeMap.get(normalizeContentPath(pathname)) ?? null;
}

export async function getStaticRouteParams() {
  const routes = await getAllRoutes();

  return routes.map((route) => ({
    slug: route.path === "/" ? [] : route.path.split("/").filter(Boolean),
  }));
}
