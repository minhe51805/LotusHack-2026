import fs from "node:fs/promises";
import path from "node:path";

const DIRECTORY_FILE = path.join(process.cwd(), "data", "etest-school-directory.json");

export interface SchoolDirectoryEntry {
  id: string;
  slug: string;
  name: string;
  title: string;
  country: string;
  location: string;
  levels: string[];
  tuitionRaw: string;
  tuitionMinUsd: number | null;
  tuitionMaxUsd: number | null;
  scholarshipAvailable: boolean;
  scholarshipSummary: string;
  fields: string[];
  requirementsSummary: string;
  ieltsMin: number | null;
  toeflMin: number | null;
  satMin: number | null;
  gpaRequirement: string;
  website: string;
  detailUrl: string;
  imageUrl: string;
  excerpt: string;
  crawledAt: string;
}

export async function getSchoolDirectory(): Promise<SchoolDirectoryEntry[]> {
  try {
    const content = await fs.readFile(DIRECTORY_FILE, "utf-8");
    return JSON.parse(content) as SchoolDirectoryEntry[];
  } catch {
    return [];
  }
}
