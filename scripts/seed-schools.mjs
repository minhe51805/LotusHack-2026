/**
 * seed-schools.mjs
 * Imports all schools from data/schools_structured.json into Supabase.
 *
 * Run:  node scripts/seed-schools.mjs
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.local");
    const contents = readFileSync(envPath, "utf-8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // ignore missing .env.local
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load JSON data
const dataPath = resolve(__dirname, "../data/schools_structured.json");
const { schools } = JSON.parse(readFileSync(dataPath, "utf-8"));

console.log(`Seeding ${schools.length} schools...`);

const rows = schools.map((s) => ({
  id: s.id,
  name: s.name,
  country: s.country,
  // Legacy fields (empty for imported schools — enriched via admin if needed)
  overview: s.excerpt ?? "",
  cost: {},
  visa: {},
  scholarship: { available: s.scholarship_available ?? false },
  requirements: buildRequirements(s.certs_required, s.gpa_required),
  programs: s.fields ?? [],
  // New extended fields
  location: s.location ?? "",
  levels: s.levels ?? [],
  tuition: s.tuition ?? {},
  fields: s.fields ?? [],
  gpa_required: s.gpa_required ?? null,
  certs_required: s.certs_required ?? [],
  website: s.website ?? "",
  detail_url: s.detail_url ?? "",
  image_url: s.image_url ?? "",
  excerpt: s.excerpt ?? "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

/**
 * Build legacy requirements object from new cert/gpa fields
 * so existing search_schools tool still works.
 */
function buildRequirements(certsRequired, gpaRequired) {
  const req = {};

  if (certsRequired) {
    for (const cert of certsRequired) {
      const name = (cert.name ?? "").toUpperCase();
      if (name === "IELTS") req.ielts_min = cert.min_score;
      else if (name === "TOEFL") req.toefl_min = cert.min_score;
      else if (name === "SAT") req.sat_min = cert.min_score;
    }
  }

  if (gpaRequired) {
    if (gpaRequired.scale === 4.0) {
      req.gpa_min = `${gpaRequired.value}/4.0`;
    } else {
      req.gpa_min = `${gpaRequired.value}/10`;
    }
  }

  return req;
}

// Upsert in batches of 50
const BATCH = 50;
let inserted = 0;
let failed = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("schools")
    .upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`Batch ${i / BATCH + 1} error:`, error.message);
    failed += batch.length;
  } else {
    inserted += batch.length;
    console.log(`  Batch ${i / BATCH + 1}: ${batch.length} rows upserted ✓`);
  }
}

console.log(`\nDone. ${inserted} inserted/updated, ${failed} failed.`);
