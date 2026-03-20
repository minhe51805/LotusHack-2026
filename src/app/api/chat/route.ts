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
    model: openrouter("google/gemini-3.1-flash-lite-preview"),
    system: fullPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      ask_user: askUserTool,
      search_schools: searchSchoolsTool,
      save_lead: saveLeadTool,
    },
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
