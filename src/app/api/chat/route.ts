import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SYSTEM_PROMPT = `
Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

Nhiệm vụ: Tư vấn học sinh THPT/Đại học chọn khóa học phù hợp và mời họ đến văn phòng.

## Khóa học
IELTS, TOEFL, SAT, ACT, AP, IB, GED, SSAT/ISEE, AMP (viết luận học bổng), Model UN.

## Quy trình (tuần tự, mỗi lượt hỏi tối đa 1 câu)
1. Chào hỏi, hỏi lớp/năm học
2. Hỏi kỳ thi mục tiêu → dùng ask_user (single_select)
3. Hỏi trình độ hiện tại → dùng ask_user (single_select)
4. Hỏi timeline và mục tiêu du học
5. Tư vấn khóa học phù hợp, xử lý phản đối
6. Thu thập tên + SĐT, gọi save_lead, chốt lịch hẹn

## Xử lý lo ngại lừa đảo
Thừa nhận nỗi lo là hợp lý. Nêu bằng chứng: pháp nhân rõ ràng, 20+ năm, báo chí uy tín, mời tham quan văn phòng miễn phí trước khi đăng ký.

## Tools
- ask_user: dùng khi câu hỏi có lựa chọn cố định (kỳ thi, trình độ, timeline, v.v.)
- search_schools: khi hỏi yêu cầu đầu vào của trường cụ thể
- save_lead: khi đã có tên + SĐT, hoặc khi kết thúc hội thoại

## Nguyên tắc
- Trả lời tiếng Việt (trừ khi học sinh dùng tiếng Anh)
- Thân thiện, ngắn gọn — không quá 3 câu mỗi lượt
- Không hứa điểm số cụ thể, không bịa học phí
`.trim();

// Client-side tool — no execute. Frontend renders the UI and calls addToolOutput.
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

// Server-side tool — placeholder, replace with real data source.
const searchSchoolsTool = tool({
  description:
    "Search for a university or study-abroad program and return its admission requirements (IELTS/TOEFL/SAT minimums, GPA, deadlines, tuition).",
  inputSchema: z.object({
    query: z.string().describe("School name, program, or country to search."),
    exam: z
      .enum(["IELTS", "TOEFL", "SAT", "ACT", "any"])
      .optional()
      .default("any"),
  }),
  execute: async ({ query, exam }) => {
    // TODO: replace with Google Sheets / Notion / Supabase fetch
    console.log(`[search_schools] query="${query}" exam="${exam}"`);
    return {
      results: [
        {
          school: "Placeholder University",
          country: "Australia",
          program: "Bachelor of Business",
          ielts_min: 6.5,
          toefl_min: 80,
          sat_min: null,
          gpa_min: "5.0/10",
          application_deadline: "31/08/2026",
          tuition_usd_per_year: 22000,
        },
      ],
      disclaimer:
        "Dữ liệu mẫu — cần kết nối nguồn thực từ ETEST. Yêu cầu có thể thay đổi theo năm.",
    };
  },
});

// Server-side tool — placeholder, replace with real CRM/Sheets write.
const saveLeadTool = tool({
  description:
    "Save the student profile so office staff can prepare before the visit.",
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
    // TODO: replace with real write:
    //   Google Sheets: sheets.spreadsheets.values.append(...)
    //   Supabase:      supabase.from('leads').insert(lead)
    //   n8n webhook:   fetch(process.env.N8N_WEBHOOK_URL, { method:'POST', body: JSON.stringify(lead) })
    console.log("[save_lead]", JSON.stringify(lead, null, 2));
    return { success: true };
  },
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openrouter("google/gemini-3.1-flash-lite-preview"),
    system: SYSTEM_PROMPT,
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
