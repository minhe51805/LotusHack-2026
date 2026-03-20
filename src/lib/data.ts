import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_DIR = path.join(DATA_DIR, "sessions");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export interface LeadData {
  full_name?: string;
  phone?: string;
  email?: string;
  grade_or_year?: string;
  target_exam?: string;
  target_score?: string;
  timeline_months?: number;
  study_abroad_goal?: string;
  current_english_level?: string;
  prior_experience?: string;
  main_concern?: string;
  preferred_meeting_time?: string;
  notes?: string;
}

export interface StoredMessage {
  id: string;
  role: string;
  parts: unknown[];
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  lead?: LeadData | null;
}

export interface AdminSettings {
  systemPrompt: string;
}

const DEFAULT_PROMPT = `Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

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
- Không hứa điểm số cụ thể, không bịa học phí`.trim();

export async function getSessions(): Promise<ChatSession[]> {
  await ensureDir(SESSIONS_DIR);
  let files: string[];
  try {
    files = await fs.readdir(SESSIONS_DIR);
  } catch {
    return [];
  }
  const sessions: ChatSession[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    try {
      const content = await fs.readFile(
        path.join(SESSIONS_DIR, file),
        "utf-8"
      );
      sessions.push(JSON.parse(content));
    } catch {
      // skip malformed files
    }
  }
  return sessions.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getSession(id: string): Promise<ChatSession | null> {
  try {
    const content = await fs.readFile(
      path.join(SESSIONS_DIR, `${id}.json`),
      "utf-8"
    );
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveSession(session: ChatSession): Promise<void> {
  await ensureDir(SESSIONS_DIR);
  await fs.writeFile(
    path.join(SESSIONS_DIR, `${session.id}.json`),
    JSON.stringify(session, null, 2)
  );
}

export async function getSettings(): Promise<AdminSettings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return { systemPrompt: DEFAULT_PROMPT };
  }
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  await ensureDir(DATA_DIR);
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

/** Extract lead data from UIMessage parts */
export function extractLead(messages: StoredMessage[]): LeadData | null {
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      const p = part as Record<string, unknown>;
      if (
        p.type === "tool-save_lead" &&
        p.state === "output-available" &&
        p.input
      ) {
        return p.input as LeadData;
      }
    }
  }
  return null;
}
