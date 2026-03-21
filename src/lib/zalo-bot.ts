import { randomUUID } from "crypto";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import {
  getSession,
  getSettings,
  saveSession,
  type Certification,
  type ChatSession,
  type LeadData,
  type StoredMessage,
} from "@/lib/data";
import { matchSchoolsForProfile } from "@/lib/school-match";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const DEFAULT_MODEL =
  process.env.ZALO_BOT_MODEL ?? "google/gemini-3.1-flash-lite-preview";
const MAX_SESSION_MESSAGES = 40;
const MAX_REPLY_LENGTH = 2000;
const MAX_PROMPT_MESSAGES = 6;
const MAX_PROMPT_MESSAGE_CHARS = 240;
const SKIP_VALUES = new Set([
  "bo qua",
  "bỏ qua",
  "skip",
  "khong biet",
  "không biết",
  "khong ro",
  "không rõ",
  "khong co",
  "không có",
  "chua biet",
  "chưa biết",
]);
const RESTART_VALUES = new Set([
  "bat dau lai",
  "bắt đầu lại",
  "lam lai",
  "làm lại",
  "reset",
]);
const MENU_VALUES = new Set([
  "bat dau",
  "bắt đầu",
  "start",
  "menu",
  "hello",
  "hi",
  "helo",
  "xin chao",
  "xin chào",
  "tu van",
  "tư vấn",
]);

type ZaloOnboardingStep =
  | "age"
  | "current_school"
  | "gpa"
  | "certifications"
  | "field_of_study"
  | "priority_countries"
  | "budget_usd";

interface ZaloOnboardingMetaPart {
  type: "zalo-onboarding-meta";
  status: "welcome" | "collecting" | "completed";
  nextStep: ZaloOnboardingStep | null;
}

interface ZaloTurnResult {
  replyText: string;
  session: ChatSession;
}

const ONBOARDING_STEPS: ZaloOnboardingStep[] = [
  "age",
  "current_school",
  "gpa",
  "certifications",
  "field_of_study",
  "priority_countries",
  "budget_usd",
];

const AGE_OPTIONS = [
  { label: "15 tuổi hoặc nhỏ hơn", value: 15 },
  { label: "16 tuổi", value: 16 },
  { label: "17 tuổi", value: 17 },
  { label: "18 tuổi", value: 18 },
  { label: "19 tuổi hoặc lớn hơn", value: 19 },
] as const;
const CURRENT_SCHOOL_OPTIONS = [
  "THPT",
  "Đại học",
  "Gap year",
  "Đã tốt nghiệp",
] as const;
const GPA_OPTIONS = [
  "Dưới 7.0/10",
  "7.0 - 7.9/10",
  "8.0 - 8.9/10",
  "9.0+/10",
  "Theo thang 4.0",
] as const;
const FIELD_OPTIONS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Architecture",
  "Art & Design",
  "Hospitality",
  "Health Sciences",
  "Khác",
] as const;
const BUDGET_OPTIONS = [
  { label: "< $20,000/năm", value: 15000 },
  { label: "$20,000 - $30,000/năm", value: 25000 },
  { label: "$30,000 - $50,000/năm", value: 40000 },
  { label: "> $50,000/năm", value: 55000 },
] as const;
const COUNTRY_OPTIONS = [
  "Úc",
  "Canada",
  "Anh",
  "Mỹ",
  "New Zealand",
  "Singapore",
  "Nhật Bản",
  "Châu Âu",
] as const;
const CERTIFICATION_OPTIONS = [
  "IELTS",
  "SAT",
  "ACT",
  "PTE",
  "TOEFL",
  "TOEIC",
  "GRE",
  "GMAT",
] as const;

export interface ZaloBotWebhookPayload {
  ok?: boolean;
  result?: {
    event_name?: string;
    message?: {
      from?: {
        id?: string;
        display_name?: string;
      };
      chat?: {
        id?: string;
        chat_type?: "PRIVATE" | "GROUP" | string;
      };
      text?: string;
      caption?: string;
      photo?: string;
      sticker?: string;
      url?: string;
    };
  };
}

export function buildZaloSessionId(chatId: string): string {
  return `zalo-${chatId}`;
}

function createStoredTextMessage(
  role: "user" | "assistant",
  text: string
): StoredMessage {
  return {
    id: randomUUID(),
    role,
    parts: [{ type: "text", text }],
    createdAt: new Date().toISOString(),
  };
}

function createMetaMessage(meta: Omit<ZaloOnboardingMetaPart, "type">): StoredMessage {
  return {
    id: randomUUID(),
    role: "assistant",
    parts: [{ type: "zalo-onboarding-meta", ...meta }],
    createdAt: new Date().toISOString(),
  };
}

function getStoredMessageText(message: StoredMessage): string {
  const parts = Array.isArray(message.parts) ? message.parts : [];

  return parts
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { type?: string; text?: unknown }).type === "text"
        ? (part as { text?: unknown }).text
        : undefined;
      return typeof text === "string" ? text.trim() : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

function compactPromptText(text: string, maxChars = MAX_PROMPT_MESSAGE_CHARS): string {
  const compacted = text.replace(/\s+/g, " ").trim();
  if (compacted.length <= maxChars) return compacted;
  return `${compacted.slice(0, maxChars - 1).trimEnd()}…`;
}

function buildConversationTranscript(messages: StoredMessage[]): string {
  const relevant = messages
    .filter((message) => {
      const text = getStoredMessageText(message);
      if (!text) return false;
      return !text.startsWith("[Hồ sơ của tôi]");
    })
    .slice(-MAX_PROMPT_MESSAGES);

  return relevant
    .map((message) => {
      const text = getStoredMessageText(message);
      if (!text) return null;
      return `${message.role === "assistant" ? "Trợ lý" : "Người dùng"}: ${compactPromptText(text)}`;
    })
    .filter(Boolean)
    .join("\n");
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1: $2")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clampReplyText(text: string): string {
  const cleaned = stripMarkdown(text);
  if (cleaned.length <= MAX_REPLY_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_REPLY_LENGTH - 1).trimEnd()}…`;
}

function normalizeComparable(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isSkipAnswer(input: string): boolean {
  return SKIP_VALUES.has(normalizeComparable(input));
}

function isRestartAnswer(input: string): boolean {
  return RESTART_VALUES.has(normalizeComparable(input));
}

function isMenuAnswer(input: string): boolean {
  return MENU_VALUES.has(normalizeComparable(input));
}

function parseNumberSelections(input: string, max: number): number[] {
  return [...new Set(
    [...input.matchAll(/\b\d+\b/g)]
      .map((match) => Number(match[0]))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= max)
  )];
}

function parseQuickStartChoice(input: string): number | null {
  const normalized = normalizeComparable(input);
  if (normalized.includes("ho so") || normalized.includes("hồ sơ")) return 1;
  if (normalized.includes("truong") || normalized.includes("trường")) return 2;
  if (normalized.includes("hoc bong") || normalized.includes("học bổng")) return 3;
  if (normalized.includes("so sanh") || normalized.includes("quoc gia") || normalized.includes("quốc gia")) return 4;
  if (normalized.includes("tu van vien") || normalized.includes("tư vấn viên")) return 5;

  const numbered = parseNumberSelections(input, 5);
  return numbered.length > 0 ? numbered[0] : null;
}

function getLatestOnboardingMeta(messages: StoredMessage[]): ZaloOnboardingMetaPart | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const parts = Array.isArray(messages[i].parts) ? messages[i].parts : [];
    for (let j = parts.length - 1; j >= 0; j -= 1) {
      const part = parts[j];
      if (
        part &&
        typeof part === "object" &&
        (part as { type?: string }).type === "zalo-onboarding-meta"
      ) {
        return part as ZaloOnboardingMetaPart;
      }
    }
  }
  return null;
}

function getStepNumber(step: ZaloOnboardingStep): number {
  return ONBOARDING_STEPS.indexOf(step) + 1;
}

function getNextStep(step: ZaloOnboardingStep): ZaloOnboardingStep | null {
  const index = ONBOARDING_STEPS.indexOf(step);
  if (index === -1 || index === ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[index + 1];
}

function getOnboardingQuestion(step: ZaloOnboardingStep): string {
  const prefix = `Câu ${getStepNumber(step)}/${ONBOARDING_STEPS.length}: `;

  if (step === "age") {
    return `${prefix}Bạn bao nhiêu tuổi?
1) 15 tuổi hoặc nhỏ hơn
2) 16 tuổi
3) 17 tuổi
4) 18 tuổi
5) 19 tuổi hoặc lớn hơn

Bạn có thể trả lời theo số hoặc gõ tuổi cụ thể.`;
  }

  if (step === "current_school") {
    return `${prefix}Bạn đang ở nhóm nào?
1) THPT
2) Đại học
3) Gap year
4) Đã tốt nghiệp

Bạn có thể trả lời theo số hoặc gõ tên trường cụ thể.`;
  }

  if (step === "gpa") {
    return `${prefix}GPA hiện tại của bạn gần nhất với mức nào?
1) Dưới 7.0/10
2) 7.0 - 7.9/10
3) 8.0 - 8.9/10
4) 9.0+/10
5) Theo thang 4.0

Bạn cũng có thể gõ trực tiếp như 8.5/10 hoặc 3.7/4.0.`;
  }

  if (step === "certifications") {
    return `${prefix}Bạn đã có chứng chỉ nào rồi?
1) IELTS
2) SAT
3) ACT
4) PTE
5) TOEFL
6) TOEIC
7) GRE
8) GMAT
9) Chưa có

Bạn có thể trả lời:
- 9
- 1 6.5
- 1 6.5, 5 90`;
  }

  if (step === "field_of_study") {
    return `${prefix}Ngành học mục tiêu của bạn là gì?
1) Computer Science
2) Business
3) Engineering
4) Architecture
5) Art & Design
6) Hospitality
7) Health Sciences
8) Khác

Bạn có thể trả lời theo số hoặc gõ ngành cụ thể.`;
  }

  if (step === "priority_countries") {
    return `${prefix}Bạn ưu tiên quốc gia nào?
1) Úc
2) Canada
3) Anh
4) Mỹ
5) New Zealand
6) Singapore
7) Nhật Bản
8) Châu Âu

Bạn có thể trả lời 1 số hoặc nhiều số, ví dụ: 1,2,4`;
  }

  return `${prefix}Ngân sách mỗi năm của bạn khoảng bao nhiêu? Trả lời 1, 2, 3, 4 hoặc nhập số USD/năm:
1) < $20,000
2) $20,000 - $30,000
3) $30,000 - $50,000
4) > $50,000`;
}

function buildOnboardingIntro(displayName?: string): string {
  const salutation = displayName ? `Chào ${displayName}, ` : "Chào bạn, ";
  return `${salutation}mình sẽ hỏi nhanh 7 mục để gợi ý trường phù hợp hơn. Ở nhiều câu bạn chỉ cần trả lời theo số.\n\n${getOnboardingQuestion("age")}`;
}

function buildQuickStartMenu(displayName?: string): string {
  const salutation = displayName ? `Chào ${displayName}, ` : "Chào bạn, ";
  return `${salutation}mình là bot tư vấn du học. Bạn có thể bắt đầu nhanh bằng cách trả lời một số:

1) Bắt đầu hồ sơ du học
2) Tìm trường theo ngân sách
3) Tư vấn học bổng
4) So sánh quốc gia du học
5) Gặp tư vấn viên

Ví dụ: trả lời 1 để bắt đầu hồ sơ.`;
}

function buildQuickStartReply(choice: number): string {
  if (choice === 2) {
    return "Bạn gửi giúp mình theo mẫu: GPA | ngân sách mỗi năm | quốc gia mục tiêu. Ví dụ: 8.5/10 | 25000 | Úc, Canada. Mình sẽ gợi ý trường phù hợp ngay.";
  }

  if (choice === 3) {
    return "Để lọc học bổng phù hợp, bạn gửi giúp mình: GPA | chứng chỉ | ngân sách | ngành học. Ví dụ: 8.7/10 | IELTS 7.0 | 30000 | Computer Science.";
  }

  if (choice === 4) {
    return "Bạn muốn so sánh hai quốc gia nào? Ví dụ: Úc và Canada, hoặc Anh và Mỹ.";
  }

  return "Nếu bạn muốn gặp tư vấn viên, hãy để lại theo mẫu: Họ tên | Số điện thoại. Mình sẽ ghi nhận để đội ngũ liên hệ sớm nhất.";
}

function parseAgeAnswer(input: string): number | null {
  const menuChoice = parseNumberSelections(input, AGE_OPTIONS.length);
  if (/^\s*\d+\s*$/.test(input.trim()) && menuChoice.length === 1) {
    return AGE_OPTIONS[menuChoice[0] - 1]?.value ?? null;
  }

  const match = input.match(/\b(\d{1,2})\b/);
  if (!match) return null;
  const age = Number(match[1]);
  return age >= 10 && age <= 60 ? age : null;
}

function parseCurrentSchoolAnswer(input: string): string | null {
  const menuChoice = parseNumberSelections(input, CURRENT_SCHOOL_OPTIONS.length);
  if (/^\s*\d+\s*$/.test(input.trim()) && menuChoice.length === 1) {
    return CURRENT_SCHOOL_OPTIONS[menuChoice[0] - 1] ?? null;
  }

  const text = input.trim();
  return text.length > 0 ? text : null;
}

function parseGpaAnswer(input: string): string | null {
  const menuChoice = parseNumberSelections(input, GPA_OPTIONS.length);
  if (/^\s*\d+\s*$/.test(input.trim()) && menuChoice.length === 1) {
    return GPA_OPTIONS[menuChoice[0] - 1] ?? null;
  }

  const text = input.trim();
  return text.length > 0 ? text : null;
}

function parseFieldOfStudyAnswer(input: string): string | null {
  const menuChoice = parseNumberSelections(input, FIELD_OPTIONS.length);
  if (/^\s*\d+\s*$/.test(input.trim()) && menuChoice.length === 1) {
    return FIELD_OPTIONS[menuChoice[0] - 1] ?? null;
  }

  const text = input.trim();
  return text.length > 0 ? text : null;
}

function parseCertifications(input: string): Certification[] {
  const normalized = normalizeComparable(input);
  if (
    normalized.includes("chua co") ||
    normalized.includes("khong co") ||
    normalized.includes("none") ||
    normalized === "9"
  ) {
    return [];
  }

  const numericMatches = [...input.matchAll(/\b([1-8])\b(?:\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?))?/g)];
  if (numericMatches.length > 0) {
    const certifications = numericMatches
      .map((match) => {
        const index = Number(match[1]) - 1;
        const type = CERTIFICATION_OPTIONS[index];
        const score = match[2]?.replace(",", ".");
        if (!type || !score) return null;
        return {
          type,
          score,
          date: "",
        } satisfies Certification;
      })
      .filter((value) => value !== null);

    if (certifications.length > 0) {
      return certifications;
    }
  }

  const patterns: Array<{ type: Certification["type"]; regex: RegExp }> = [
    { type: "IELTS", regex: /ielts\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "TOEFL", regex: /toefl\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "TOEIC", regex: /toeic\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "SAT", regex: /sat\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "ACT", regex: /act\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "PTE", regex: /pte\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "GRE", regex: /gre\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
    { type: "GMAT", regex: /gmat\s*[:\-]?\s*([0-9]+(?:[.,][0-9]+)?)/gi },
  ];

  const certifications: Certification[] = [];

  for (const pattern of patterns) {
    for (const match of input.matchAll(pattern.regex)) {
      const score = match[1]?.replace(",", ".");
      if (!score) continue;
      certifications.push({
        type: pattern.type,
        score,
        date: "",
      });
    }
  }

  return certifications;
}

function parsePriorityCountries(input: string): string[] {
  const normalized = normalizeComparable(input);
  const numbered = parseNumberSelections(input, COUNTRY_OPTIONS.length);
  if (numbered.length > 0) {
    return numbered.map((index) => COUNTRY_OPTIONS[index - 1]);
  }

  const matched = new Set<string>();

  const mapping: Array<{ label: string; aliases: string[] }> = [
    { label: "Úc", aliases: ["uc", "australia", "au"] },
    { label: "Canada", aliases: ["canada"] },
    { label: "Anh", aliases: ["anh", "uk", "united kingdom", "england", "britain"] },
    { label: "Mỹ", aliases: ["my", "usa", "united states", "america"] },
    { label: "New Zealand", aliases: ["new zealand", "nz"] },
    { label: "Singapore", aliases: ["singapore"] },
    { label: "Nhật Bản", aliases: ["nhat ban", "japan"] },
    { label: "Châu Âu", aliases: ["chau au", "europe", "eu"] },
  ];

  for (const item of mapping) {
    if (item.aliases.some((alias) => normalized.includes(alias))) {
      matched.add(item.label);
    }
  }

  if (matched.size > 0) {
    return [...matched];
  }

  return input
    .split(/[,\n;/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBudgetUsd(input: string): number | null {
  const normalized = normalizeComparable(input);
  const numbered = parseNumberSelections(input, BUDGET_OPTIONS.length);
  if (numbered.length > 0) {
    return BUDGET_OPTIONS[numbered[0] - 1]?.value ?? null;
  }

  if (normalized === "1" || normalized.includes("< 20000") || normalized.includes("<20")) {
    return 15000;
  }
  if (normalized === "2" || normalized.includes("20000 - 30000") || normalized.includes("20-30")) {
    return 25000;
  }
  if (normalized === "3" || normalized.includes("30000 - 50000") || normalized.includes("30-50")) {
    return 40000;
  }
  if (normalized === "4" || normalized.includes("> 50000") || normalized.includes(">50")) {
    return 55000;
  }

  const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*k\b/);
  if (match) {
    return Math.round(Number(match[1].replace(",", ".")) * 1000);
  }

  const digits = normalized.replace(/[^\d]/g, "");
  if (!digits) return null;

  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;

  if (value < 1000) {
    return value * 1000;
  }

  return value;
}

function formatBudgetLabel(value?: number): string | null {
  if (!value) return null;
  const matched = BUDGET_OPTIONS.find((option) => option.value === value);
  return matched?.label ?? `$${value.toLocaleString()}/năm`;
}

function buildProfileSummary(lead: LeadData | null): string {
  if (!lead) {
    return "[Hồ sơ của tôi]\n\nChưa có dữ liệu hồ sơ.";
  }

  const lines: string[] = ["[Hồ sơ của tôi]"];
  const basicParts = [
    lead.age ? `Tuổi: ${lead.age}` : null,
    lead.current_school ? `Trường: ${lead.current_school}` : null,
    lead.gpa ? `GPA: ${lead.gpa}` : null,
  ].filter(Boolean);

  if (basicParts.length > 0) {
    lines.push(`• ${basicParts.join(" | ")}`);
  }

  if (lead.certifications?.length) {
    const certText = lead.certifications
      .map((cert) => `${cert.type} ${cert.score}`)
      .join(", ");
    lines.push(`• Chứng chỉ: ${certText}`);
  }

  if (lead.field_of_study) {
    lines.push(`• Ngành mục tiêu: ${lead.field_of_study}`);
  }

  if (lead.priority_countries?.length) {
    lines.push(`• Quốc gia ưu tiên: ${lead.priority_countries.join(", ")}`);
  }

  if (lead.budget_usd) {
    lines.push(`• Ngân sách: ${formatBudgetLabel(lead.budget_usd)}`);
  }

  return lines.join("\n");
}

function buildCompactLeadSummary(lead: LeadData | null): string | null {
  if (!lead) return null;

  const fields = [
    lead.age ? `Tuổi ${lead.age}` : null,
    lead.current_school ? `Trường/Nhóm ${lead.current_school}` : null,
    lead.gpa ? `GPA ${lead.gpa}` : null,
    lead.certifications?.length
      ? `Chứng chỉ ${lead.certifications.map((cert) => `${cert.type} ${cert.score}`).join(", ")}`
      : null,
    lead.field_of_study ? `Ngành ${lead.field_of_study}` : null,
    lead.priority_countries?.length
      ? `Quốc gia ${lead.priority_countries.join(", ")}`
      : null,
    lead.budget_usd ? `Ngân sách ${formatBudgetLabel(lead.budget_usd)}` : null,
  ].filter(Boolean);

  return fields.length > 0 ? fields.join(" | ") : null;
}

function buildMatchedContext(matched: Awaited<ReturnType<typeof matchSchoolsForProfile>>): string {
  if (matched.matched.length === 0) {
    return "Hiện chưa có trường nào khớp rõ ràng trong hệ thống.";
  }

  return matched.matched
    .slice(0, 3)
    .map((school, index) => {
      const reasons = school.reasons.length > 0 ? school.reasons.join("; ") : "Phù hợp tổng thể";
      const scholarship = school.scholarship ? "Có học bổng" : "Chưa thấy học bổng rõ";
      return `${index + 1}. ${school.name} (${school.country}) - ${school.match_percent}% phù hợp - ${school.tuition_range} - ${scholarship}. Lý do: ${reasons}.`;
    })
    .join("\n");
}

async function generateZaloReply(params: {
  history: StoredMessage[];
  incomingText: string;
  displayName?: string;
  lead?: LeadData | null;
}): Promise<string> {
  const { history, incomingText, displayName, lead } = params;

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const { zaloSystemPrompt, systemPrompt } = await getSettings();
  const adminPrompt = (zaloSystemPrompt || systemPrompt).trim();
  const transcript = buildConversationTranscript(history);
  const compactLead = buildCompactLeadSummary(lead);

  const channelRules = `
## Ràng buộc kênh Zalo Bot
- Bạn đang trả lời qua Zalo Bot.
- Chỉ trả về một tin nhắn văn bản thuần, không dùng markdown phức tạp, không code block, không bảng.
- Giữ câu trả lời ngắn gọn, tự nhiên, tối đa khoảng 4 câu.
- Nếu chưa đủ dữ kiện, chỉ hỏi đúng 1 câu ngắn gọn nhất cần thiết.
- Nếu hồ sơ đã có GPA, chứng chỉ, ngành học, quốc gia ưu tiên hoặc ngân sách thì không được hỏi lại các mục đó.
- Nếu người dùng vừa nói "có", "ok", "rồi", hãy tiếp nối từ hồ sơ hiện có thay vì bắt đầu thu thập thông tin lại.
- Không nhắc tới tool, prompt, hệ thống nội bộ, hay việc bạn là model.
`.trim();

  const prompt = [
    displayName ? `Tên người dùng: ${displayName}` : null,
    compactLead ? `Hồ sơ đã lưu: ${compactLead}` : null,
    transcript
      ? `Lịch sử hội thoại gần đây:\n${transcript}`
      : "Đây là tin nhắn đầu tiên của cuộc hội thoại.",
    `Tin nhắn mới nhất của người dùng:\n${incomingText}`,
    "Hãy soạn câu trả lời phù hợp để gửi lại ngay cho người dùng.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await generateText({
    model: openrouter(DEFAULT_MODEL),
    system: [adminPrompt, channelRules].filter(Boolean).join("\n\n"),
    prompt,
    temperature: 0.4,
  });

  const reply = clampReplyText(result.text);
  return reply || "Mình đã nhận được tin nhắn của bạn. Bạn có thể nói rõ hơn để mình hỗ trợ chính xác hơn không?";
}

async function generateOnboardingRecommendation(params: {
  history: StoredMessage[];
  lead: LeadData;
  displayName?: string;
}): Promise<string> {
  const { history, lead, displayName } = params;
  const matched = await matchSchoolsForProfile({
    gpa: lead.gpa,
    budget_usd: lead.budget_usd,
    countries: lead.priority_countries,
    certifications: lead.certifications?.map((item) => ({
      type: item.type,
      score: item.score,
    })),
    field_of_study: lead.field_of_study,
  });

  const input = [
    "Người dùng vừa hoàn tất onboarding hồ sơ du học trên Zalo.",
    buildProfileSummary(lead),
    "Top trường phù hợp từ dữ liệu hệ thống:",
    buildMatchedContext(matched),
    "Hãy trả lời ngắn gọn bằng tiếng Việt: xác nhận đã nhận hồ sơ, nêu 3 trường nổi bật nhất kèm 1 lý do ngắn cho mỗi trường, nhắc nhanh về học phí hoặc học bổng nếu có, rồi kết bằng 1 câu hỏi tiếp theo để tiếp tục tư vấn.",
  ].join("\n\n");

  return generateZaloReply({
    history,
    incomingText: input,
    displayName,
    lead,
  });
}

function appendMessages(
  existingMessages: StoredMessage[],
  additions: StoredMessage[]
): StoredMessage[] {
  return [...existingMessages, ...additions].slice(-MAX_SESSION_MESSAGES);
}

function buildUpdatedLead(params: {
  step: ZaloOnboardingStep;
  answer: string;
  existingLead: LeadData | null;
}): { lead: LeadData | null; invalidReply?: string } {
  const { step, answer, existingLead } = params;
  const lead: LeadData = { ...(existingLead ?? {}) };

  if (isSkipAnswer(answer)) {
    if (step === "certifications") lead.certifications = [];
    return { lead };
  }

  if (step === "age") {
    const age = parseAgeAnswer(answer);
    if (age == null) {
      return {
        lead: existingLead,
        invalidReply:
          'Mình chưa đọc được tuổi của bạn. Bạn trả lời giúp mình bằng số, ví dụ "17", hoặc gõ "bỏ qua".',
      };
    }
    lead.age = age;
    return { lead };
  }

  if (step === "current_school") {
    const currentSchool = parseCurrentSchoolAnswer(answer);
    if (!currentSchool) {
      return {
        lead: existingLead,
        invalidReply:
          "Mình chưa đọc được lựa chọn của bạn. Bạn trả lời 1-4 hoặc gõ tên trường cụ thể nhé.",
      };
    }
    lead.current_school = currentSchool;
    return { lead };
  }

  if (step === "gpa") {
    const gpa = parseGpaAnswer(answer);
    if (!gpa) {
      return {
        lead: existingLead,
        invalidReply:
          "Mình chưa đọc được GPA. Bạn trả lời 1-5 hoặc gõ như 8.5/10 hay 3.7/4.0 nhé.",
      };
    }
    lead.gpa = gpa;
    return { lead };
  }

  if (step === "certifications") {
    const certifications = parseCertifications(answer);
    if (certifications.length > 0) {
      lead.certifications = certifications;
    } else {
      const selectedCertTypes = parseNumberSelections(answer, CERTIFICATION_OPTIONS.length);
      if (selectedCertTypes.length > 0) {
        return {
          lead: existingLead,
          invalidReply:
            "Bạn chọn chứng chỉ rồi nhưng mình chưa thấy điểm. Bạn trả lời giúp mình theo mẫu như: 1 6.5 hoặc 1 6.5, 5 90. Nếu chưa có chứng chỉ thì trả lời 9.",
        };
      }

      lead.certifications = [];
      const normalized = normalizeComparable(answer);
      if (
        !isSkipAnswer(answer) &&
        normalized !== "chua co" &&
        normalized !== "9"
      ) {
        lead.notes = [lead.notes, `Chứng chỉ tự khai qua Zalo: ${answer.trim()}`]
          .filter(Boolean)
          .join(" | ");
      }
    }
    return { lead };
  }

  if (step === "field_of_study") {
    const fieldOfStudy = parseFieldOfStudyAnswer(answer);
    if (!fieldOfStudy) {
      return {
        lead: existingLead,
        invalidReply:
          "Mình chưa đọc được ngành mục tiêu. Bạn trả lời 1-8 hoặc gõ ngành cụ thể nhé.",
      };
    }
    lead.field_of_study = fieldOfStudy;
    return { lead };
  }

  if (step === "priority_countries") {
    const countries = parsePriorityCountries(answer);
    if (countries.length === 0) {
      return {
        lead: existingLead,
        invalidReply:
          "Mình chưa đọc được quốc gia ưu tiên. Bạn trả lời giúp mình theo số, ví dụ 1 hoặc 1,2,4.",
      };
    }
    lead.priority_countries = countries;
    return { lead };
  }

  const budget = parseBudgetUsd(answer);
  if (budget == null) {
    return {
      lead: existingLead,
      invalidReply:
        "Mình chưa đọc được ngân sách. Bạn trả lời 1, 2, 3, 4 hoặc nhập số USD/năm, ví dụ 25000.",
    };
  }
  lead.budget_usd = budget;
  return { lead };
}

function startOnboardingSession(params: {
  existingSession: ChatSession | null;
  existingMessages: StoredMessage[];
  userText: string;
  displayName?: string;
}): ZaloTurnResult {
  const replyText = buildOnboardingIntro(params.displayName);
  const messages = appendMessages(params.existingMessages, [
    createStoredTextMessage("user", params.userText),
    createStoredTextMessage("assistant", replyText),
    createMetaMessage({
      status: "collecting",
      nextStep: "age",
    }),
  ]);

  return {
    replyText,
    session: {
      id: params.existingSession?.id ?? buildZaloSessionId("unknown"),
      createdAt: params.existingSession?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
      lead: null,
      needsSupport: params.existingSession?.needsSupport ?? false,
    },
  };
}

function maybeUseFirstMessageAsAge(input: string): number | null {
  return parseAgeAnswer(input);
}

export async function buildZaloConversationTurn(params: {
  chatId: string;
  incomingText: string;
  displayName?: string;
}): Promise<ZaloTurnResult> {
  const existingSession = await getSession(buildZaloSessionId(params.chatId));
  const existingMessages = existingSession?.messages ?? [];
  const existingLead = existingSession?.lead ?? null;
  const meta = getLatestOnboardingMeta(existingMessages);
  const userText = params.incomingText.trim();

  if (isRestartAnswer(userText)) {
    const replyText = buildOnboardingIntro(params.displayName);
    const messages = appendMessages(existingMessages, [
      createStoredTextMessage("user", userText),
      createStoredTextMessage("assistant", replyText),
      createMetaMessage({
        status: "collecting",
        nextStep: "age",
      }),
    ]);

    return {
      replyText,
      session: {
        id: existingSession?.id ?? buildZaloSessionId(params.chatId),
        createdAt: existingSession?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages,
        lead: null,
        needsSupport: existingSession?.needsSupport ?? false,
      },
    };
  }

  if (isMenuAnswer(userText)) {
    const replyText = buildQuickStartMenu(params.displayName);
    const messages = appendMessages(existingMessages, [
      createStoredTextMessage("user", userText),
      createStoredTextMessage("assistant", replyText),
      createMetaMessage({
        status: "welcome",
        nextStep: null,
      }),
    ]);

    return {
      replyText,
      session: {
        id: existingSession?.id ?? buildZaloSessionId(params.chatId),
        createdAt: existingSession?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages,
        lead: existingLead,
        needsSupport: existingSession?.needsSupport ?? false,
      },
    };
  }

  if (!meta) {
    const quickStartChoice = parseQuickStartChoice(userText);
    if (quickStartChoice === 1) {
      return startOnboardingSession({
        existingSession,
        existingMessages,
        userText,
        displayName: params.displayName,
      });
    }

    if (quickStartChoice && quickStartChoice >= 2) {
      const replyText = buildQuickStartReply(quickStartChoice);
      const messages = appendMessages(existingMessages, [
        createStoredTextMessage("user", userText),
        createStoredTextMessage("assistant", replyText),
        createMetaMessage({
          status: "completed",
          nextStep: null,
        }),
      ]);

      return {
        replyText,
        session: {
          id: existingSession?.id ?? buildZaloSessionId(params.chatId),
          createdAt: existingSession?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          lead: existingLead,
          needsSupport: existingSession?.needsSupport ?? false,
        },
      };
    }

    const initialAge = maybeUseFirstMessageAsAge(userText);
    if (initialAge != null) {
      const lead: LeadData = { ...(existingLead ?? {}), age: initialAge };
      const nextStep = "current_school" satisfies ZaloOnboardingStep;
      const replyText = getOnboardingQuestion(nextStep);
      const messages = appendMessages(existingMessages, [
        createStoredTextMessage("user", userText),
        createStoredTextMessage("assistant", replyText),
        createMetaMessage({
          status: "collecting",
          nextStep,
        }),
      ]);

      return {
        replyText,
        session: {
          id: existingSession?.id ?? buildZaloSessionId(params.chatId),
          createdAt: existingSession?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          lead,
          needsSupport: existingSession?.needsSupport ?? false,
        },
      };
    }

    const result = startOnboardingSession({
      existingSession,
      existingMessages,
      userText,
      displayName: params.displayName,
    });
    result.session.id = existingSession?.id ?? buildZaloSessionId(params.chatId);
    return result;
  }

  if (meta.status === "welcome") {
    const quickStartChoice = parseQuickStartChoice(userText);

    if (quickStartChoice === 1) {
      return startOnboardingSession({
        existingSession,
        existingMessages,
        userText,
        displayName: params.displayName,
      });
    }

    if (quickStartChoice && quickStartChoice >= 2) {
      const replyText = buildQuickStartReply(quickStartChoice);
      const messages = appendMessages(existingMessages, [
        createStoredTextMessage("user", userText),
        createStoredTextMessage("assistant", replyText),
        createMetaMessage({
          status: "completed",
          nextStep: null,
        }),
      ]);

      return {
        replyText,
        session: {
          id: existingSession?.id ?? buildZaloSessionId(params.chatId),
          createdAt: existingSession?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          lead: existingLead,
          needsSupport: existingSession?.needsSupport ?? false,
        },
      };
    }

    const replyText = `${buildQuickStartMenu(params.displayName)}\n\nMình chưa đọc được lựa chọn của bạn. Bạn trả lời giúp mình một số từ 1 đến 5 nhé.`;
    const messages = appendMessages(existingMessages, [
      createStoredTextMessage("user", userText),
      createStoredTextMessage("assistant", replyText),
      createMetaMessage({
        status: "welcome",
        nextStep: null,
      }),
    ]);

    return {
      replyText,
      session: {
        id: existingSession?.id ?? buildZaloSessionId(params.chatId),
        createdAt: existingSession?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages,
        lead: existingLead,
        needsSupport: existingSession?.needsSupport ?? false,
      },
    };
  }

  if (meta.status === "collecting" && meta.nextStep) {
    const update = buildUpdatedLead({
      step: meta.nextStep,
      answer: userText,
      existingLead,
    });

    if (update.invalidReply) {
      const messages = appendMessages(existingMessages, [
        createStoredTextMessage("user", userText),
        createStoredTextMessage("assistant", update.invalidReply),
        createMetaMessage({
          status: "collecting",
          nextStep: meta.nextStep,
        }),
      ]);

      return {
        replyText: update.invalidReply,
        session: {
          id: existingSession?.id ?? buildZaloSessionId(params.chatId),
          createdAt: existingSession?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          lead: existingLead,
          needsSupport: existingSession?.needsSupport ?? false,
        },
      };
    }

    const nextStep = getNextStep(meta.nextStep);

    if (!nextStep) {
      const onboardingHistory = appendMessages(existingMessages, [
        createStoredTextMessage("user", userText),
      ]);
      const lead = (update.lead ?? existingLead ?? {}) as LeadData;
      const replyText = await generateOnboardingRecommendation({
        history: onboardingHistory,
        lead,
        displayName: params.displayName,
      });
      const messages = appendMessages(onboardingHistory, [
        createStoredTextMessage("assistant", replyText),
        createMetaMessage({
          status: "completed",
          nextStep: null,
        }),
      ]);

      return {
        replyText,
        session: {
          id: existingSession?.id ?? buildZaloSessionId(params.chatId),
          createdAt: existingSession?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
          lead,
          needsSupport: existingSession?.needsSupport ?? false,
        },
      };
    }

    const replyText = getOnboardingQuestion(nextStep);
    const messages = appendMessages(existingMessages, [
      createStoredTextMessage("user", userText),
      createStoredTextMessage("assistant", replyText),
      createMetaMessage({
        status: "collecting",
        nextStep,
      }),
    ]);

    return {
      replyText,
      session: {
        id: existingSession?.id ?? buildZaloSessionId(params.chatId),
        createdAt: existingSession?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages,
        lead: update.lead,
        needsSupport: existingSession?.needsSupport ?? false,
      },
    };
  }

  const replyText = await generateZaloReply({
    history: existingMessages,
    incomingText: userText,
    displayName: params.displayName,
    lead: existingLead,
  });

  const messages = appendMessages(existingMessages, [
    createStoredTextMessage("user", userText),
    createStoredTextMessage("assistant", replyText),
  ]);

  return {
    replyText,
    session: {
      id: existingSession?.id ?? buildZaloSessionId(params.chatId),
      createdAt: existingSession?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
      lead: existingLead,
      needsSupport: existingSession?.needsSupport ?? false,
    },
  };
}

export async function saveZaloConversation(session: ChatSession): Promise<void> {
  await saveSession(session);
}

export async function sendZaloTextMessage(params: {
  chatId: string;
  text: string;
}): Promise<{ ok: boolean; result?: unknown; error_code?: number; description?: string }> {
  const token = process.env.ZALO_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing ZALO_BOT_TOKEN");
  }

  const response = await fetch(
    `https://bot-api.zaloplatforms.com/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: clampReplyText(params.text),
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  const raw = await response.text();
  let data: unknown = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (
    !response.ok ||
    !data ||
    typeof data !== "object" ||
    (data as { ok?: boolean }).ok !== true
  ) {
    throw new Error(
      `Zalo sendMessage failed (${response.status}): ${typeof data === "string" ? data : JSON.stringify(data)}`
    );
  }

  return data as {
    ok: boolean;
    result?: unknown;
    error_code?: number;
    description?: string;
  };
}
