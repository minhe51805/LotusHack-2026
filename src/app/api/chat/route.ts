import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { getSettings, getSchools } from "@/lib/data";
import { buildSystemPrompt } from "@/lib/system-prompt";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Client-side tool — frontend renders the UI and calls addToolOutput.
const askUserTool = tool({
  description:
    "Ask the user a question with predefined options. Use single_select for one answer, multi_select for multiple. Always use this instead of typing out options in plain text.",
  inputSchema: z.object({
    question: z.string().describe("The question to display to the user."),
    type: z
      .enum(["single_select", "multi_select"])
      .describe("single_select = pick one, multi_select = pick many."),
    options: z
      .array(z.string())
      .describe("The list of options the user can choose from."),
  }),
});

// Country name mapping: Vietnamese UI labels → English country names in DB
const COUNTRY_MAP: Record<string, string[]> = {
  "Úc": ["Australia"],
  "Canada": ["Canada"],
  "Anh": ["UK", "United Kingdom", "England"],
  "Mỹ": ["USA", "United States"],
  "New Zealand": ["New Zealand"],
  "Singapore": ["Singapore"],
  "Nhật Bản": ["Japan"],
  "Châu Âu": ["France", "Germany", "Netherlands", "Sweden", "Denmark", "Finland", "Norway", "Belgium", "Switzerland", "Italy", "Spain"],
};

function parseGpa(gpaStr: string): { value: number; scale: number } | null {
  if (!gpaStr) return null;
  const m = gpaStr.match(/^([\d.]+)\s*\/\s*([\d.]+)$/);
  if (!m) return null;
  return { value: parseFloat(m[1]), scale: parseFloat(m[2]) };
}

/** Convert user GPA to the school's scale for comparison */
function normalizeGpa(userGpa: { value: number; scale: number }, schoolScale: number): number {
  if (userGpa.scale === schoolScale) return userGpa.value;
  // Convert between 4.0 and 10.0 scales
  if (userGpa.scale === 10.0 && schoolScale === 4.0) return (userGpa.value / 10.0) * 4.0;
  if (userGpa.scale === 4.0 && schoolScale === 10.0) return (userGpa.value / 4.0) * 10.0;
  return userGpa.value;
}

// Server-side tool — matches schools to user profile with a percentage score.
const matchSchoolsTool = tool({
  description:
    "Match schools to a student's profile and return ranked results with a match percentage. Use this immediately after receiving the initial profile form ([Hồ sơ của tôi]) to show personalized school recommendations.",
  inputSchema: z.object({
    gpa: z.string().optional().describe("Student GPA string, e.g. '8.5/10' or '3.7/4.0'"),
    budget_usd: z.number().optional().describe("Annual budget in USD"),
    countries: z.array(z.string()).optional().describe("Priority countries in Vietnamese, e.g. ['Úc', 'Canada']"),
    certifications: z.array(z.object({
      type: z.string(),
      score: z.string(),
    })).optional().describe("Student's certifications, e.g. [{type:'IELTS', score:'6.5'}]"),
    field_of_study: z.string().optional().describe("Desired field of study"),
  }),
  execute: async ({ gpa, budget_usd, countries, certifications, field_of_study }) => {
    const allSchools = await getSchools();

    const userGpa = gpa ? parseGpa(gpa) : null;

    // Build a set of English country names from Vietnamese selections
    const targetCountries = new Set<string>();
    for (const c of countries ?? []) {
      const mapped = COUNTRY_MAP[c] ?? [c];
      for (const m of mapped) targetCountries.add(m.toLowerCase());
    }

    // Build cert map: type → numeric score
    const certMap: Record<string, number> = {};
    for (const cert of certifications ?? []) {
      const score = parseFloat(cert.score);
      if (!isNaN(score)) certMap[cert.type.toUpperCase()] = score;
    }

    type ScoredSchool = {
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
    };

    const scored: ScoredSchool[] = allSchools.map((school) => {
      let score = 0;
      let maxScore = 0;
      const reasons: string[] = [];

      // — Country match (30 pts) —
      if (targetCountries.size > 0) {
        maxScore += 30;
        if (targetCountries.has(school.country.toLowerCase())) {
          score += 30;
          reasons.push(`Đúng quốc gia mục tiêu (${school.country})`);
        }
      }

      // — Budget match (25 pts) —
      const tuitionMin = school.tuition?.min_usd ?? school.cost?.tuition_usd_per_year;
      if (budget_usd && tuitionMin != null) {
        maxScore += 25;
        if (budget_usd >= tuitionMin) {
          score += 25;
          reasons.push("Học phí trong ngân sách");
        } else if (budget_usd >= tuitionMin * 0.8) {
          score += 12;
          reasons.push("Học phí gần ngân sách");
        }
      }

      // — GPA match (25 pts) —
      const schoolGpa = school.gpa_required ?? null;
      if (userGpa && schoolGpa) {
        maxScore += 25;
        const normalised = normalizeGpa(userGpa, schoolGpa.scale);
        if (normalised >= schoolGpa.value) {
          score += 25;
          reasons.push("GPA đạt yêu cầu");
        } else if (normalised >= schoolGpa.value * 0.9) {
          score += 12;
          reasons.push("GPA gần đạt yêu cầu");
        }
      }

      // — Cert match (20 pts) —
      const certsRequired = school.certs_required ?? [];
      if (certsRequired.length > 0 && Object.keys(certMap).length > 0) {
        maxScore += 20;
        const met = certsRequired.filter((req) => {
          const userScore = certMap[req.name.toUpperCase()];
          return userScore != null && userScore >= req.min_score;
        });
        if (met.length > 0) {
          score += 20;
          reasons.push(`Đạt yêu cầu ${met.map((c) => c.name).join(", ")}`);
        }
      } else if (certsRequired.length === 0 && Object.keys(certMap).length > 0) {
        // School doesn't list cert requirements — neutral bonus
        score += 5;
        maxScore += 5;
      }

      // — Field of study match (bonus 10 pts) —
      if (field_of_study) {
        const q = field_of_study.toLowerCase();
        const fieldMatch =
          (school.fields ?? []).some((f) => f.toLowerCase().includes(q)) ||
          (school.programs ?? []).some((p) => p.toLowerCase().includes(q));
        if (fieldMatch) {
          score += 10;
          maxScore += 10;
          reasons.push(`Ngành ${field_of_study} có sẵn`);
        } else {
          maxScore += 10;
        }
      }

      const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;

      const tuition = school.tuition;
      const tuitionRange = tuition?.min_usd && tuition?.max_usd
        ? `$${tuition.min_usd.toLocaleString()} – $${tuition.max_usd.toLocaleString()}/năm`
        : tuition?.min_usd
          ? `từ $${tuition.min_usd.toLocaleString()}/năm`
          : school.cost?.tuition_usd_per_year
            ? `$${school.cost.tuition_usd_per_year.toLocaleString()}/năm`
            : "Liên hệ";

      const gpaReq = school.gpa_required
        ? `${school.gpa_required.value}/${school.gpa_required.scale === 4 ? "4.0" : "10"}`
        : school.requirements?.gpa_min ?? null;

      const certsStr = certsRequired.length > 0
        ? certsRequired.map((c) => `${c.name} ≥ ${c.min_score}`).join(", ")
        : "Không yêu cầu";

      return {
        name: school.name,
        country: school.country,
        location: school.location ?? "",
        match_percent: matchPercent,
        tuition_range: tuitionRange,
        scholarship: school.scholarship?.available ?? false,
        fields: (school.fields ?? school.programs ?? []).slice(0, 4),
        gpa_required: gpaReq,
        certs_required: certsStr,
        website: school.website ?? "",
        image_url: school.image_url ?? "",
        excerpt: school.excerpt ?? school.overview ?? "",
        reasons,
      };
    });

    // Sort by match % desc, take top 8
    scored.sort((a, b) => b.match_percent - a.match_percent);
    const top = scored.slice(0, 8);

    return {
      matched: top,
      total_schools: allSchools.length,
      criteria_used: {
        countries: countries ?? [],
        budget_usd: budget_usd ?? null,
        gpa,
        certifications: Object.entries(certMap).map(([k, v]) => `${k} ${v}`),
        field_of_study: field_of_study ?? null,
      },
    };
  },
});

// Server-side tool — queries real school data from Supabase.
const searchSchoolsTool = tool({
  description:
    "Search partner schools and return admission requirements, tuition, visa info, and scholarships. Use when a student asks about a specific school, country, or program.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "School name, country, or program to search (e.g. 'Melbourne', 'Canada', 'Computer Science')."
      ),
    exam: z
      .enum(["IELTS", "TOEFL", "SAT", "ACT", "any"])
      .optional()
      .default("any")
      .describe("Filter schools that accept this exam score."),
  }),
  execute: async ({ query, exam }) => {
    const schools = await getSchools();

    const q = query.toLowerCase();

    let matched = schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q) ||
        s.programs?.some((p) => p.toLowerCase().includes(q))
    );

    // Filter by exam requirement
    if (exam && exam !== "any") {
      matched = matched.filter((s) => {
        if (exam === "IELTS") return s.requirements.ielts_min != null;
        if (exam === "TOEFL") return s.requirements.toefl_min != null;
        if (exam === "SAT") return s.requirements.sat_min != null;
        return true;
      });
    }

    // Fall back to all schools if nothing matched
    if (matched.length === 0) matched = schools;

    return {
      results: matched.map((s) => ({
        school: s.name,
        country: s.country,
        overview: s.overview,
        requirements: {
          ielts_min: s.requirements.ielts_min ?? null,
          toefl_min: s.requirements.toefl_min ?? null,
          sat_min: s.requirements.sat_min ?? null,
          gpa_min: s.requirements.gpa_min ?? null,
        },
        cost: {
          tuition_usd_per_year: s.cost.tuition_usd_per_year ?? null,
          living_usd_per_year: s.cost.living_usd_per_year ?? null,
          notes: s.cost.notes ?? null,
        },
        visa: {
          type: s.visa.type ?? null,
          processing_days: s.visa.processing_days ?? null,
          success_rate: s.visa.success_rate ?? null,
          notes: s.visa.notes ?? null,
        },
        scholarship: s.scholarship.available
          ? { amount: s.scholarship.amount, details: s.scholarship.details }
          : null,
        programs: s.programs ?? [],
      })),
      total: matched.length,
    };
  },
});

// Server-side tool — saves student profile for office staff.
const saveLeadTool = tool({
  description:
    "Save the student profile so office staff can prepare before the visit. Call as soon as name + phone are collected, or at conversation end.",
  inputSchema: z.object({
    full_name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    grade_or_year: z.string().optional(),
    age: z.number().optional(),
    current_school: z.string().optional(),
    budget_usd: z.number().optional(),
    gpa: z.string().optional(),
    extracurriculars: z.string().optional(),
    certifications: z.array(z.object({
      type: z.string(),
      score: z.string(),
      date: z.string(),
    })).optional(),
    field_of_study: z.string().optional(),
    priority_countries: z.array(z.string()).optional(),
    target_exam: z
      .enum([
        "IELTS",
        "TOEFL",
        "SAT",
        "ACT",
        "AP",
        "IB",
        "GED",
        "SSAT",
        "ISEE",
        "AMP",
        "other",
      ])
      .optional(),
    target_score: z.string().optional(),
    timeline_months: z.number().optional(),
    study_abroad_goal: z.string().optional(),
    current_english_level: z
      .enum([
        "beginner",
        "elementary",
        "intermediate",
        "upper-intermediate",
        "advanced",
        "unknown",
      ])
      .optional(),
    prior_experience: z.string().optional(),
    main_concern: z.string().optional(),
    preferred_meeting_time: z.string().optional(),
    notes: z.string().optional(),
  }),
  execute: async (lead) => {
    console.log("[save_lead]", JSON.stringify(lead, null, 2));
    return { success: true };
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const { systemPrompt } = await getSettings();
  const fullPrompt = await buildSystemPrompt(systemPrompt);

  const result = streamText({
    model: openrouter("google/gemini-3.1-pro-preview"),
    system: fullPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ask_user: askUserTool,
      match_schools: matchSchoolsTool,
      search_schools: searchSchoolsTool,
      save_lead: saveLeadTool,
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
