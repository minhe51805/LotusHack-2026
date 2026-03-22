/**
 * seed-sessions.mjs
 * Seeds ~50 mock chat sessions across the last 2 days into Supabase.
 *
 * Run:  node scripts/seed-sessions.mjs
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

// ─── Data pools ──────────────────────────────────────────────────────────────

const GRADES = [
  "Lớp 10", "Lớp 11", "Lớp 12",
  "Năm 1 đại học", "Năm 2 đại học", "Năm 3 đại học",
];

const EXAMS = ["IELTS", "TOEFL", "SAT", "ACT", "Chưa biết"];

const COUNTRIES = ["Úc", "Mỹ", "Canada", "Anh", "Nhật", "Hàn Quốc", "Singapore"];

const ENGLISH_LEVELS = ["beginner", "basic", "intermediate", "upper-intermediate", "advanced"];

const ENGLISH_LABELS = {
  beginner: "Mới bắt đầu",
  basic: "Cơ bản",
  intermediate: "Trung cấp",
  "upper-intermediate": "Khá",
  advanced: "Chưa đánh giá",
};

const GOALS = [
  "Đại học", "Thạc sĩ", "Cao đẳng", "Du học hè", "Chương trình trao đổi",
];

const NAMES = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Cường", "Phạm Ngọc Dung",
  "Hoàng Minh Đức", "Vũ Thị Lan", "Đặng Quốc Huy", "Bùi Thị Hoa",
  "Đỗ Anh Khoa", "Ngô Thị Kim", "Trịnh Văn Long", "Lý Thị Mai",
  "Phan Đức Nam", "Đinh Thị Ngân", "Cao Văn Phong", "Tô Thị Quỳnh",
  "Hồ Minh Sang", "Lưu Thị Tâm", "Dương Văn Tuấn", "Chu Thị Uyên",
  "Võ Hoàng Việt", "Tạ Thị Xuân", "Mạc Văn Yên", "Ninh Thị Yến",
  "Trương Minh Phúc", "Giang Thị Hằng", "Kiều Văn Bảo", "Đào Thị Châu",
  "Thái Quốc Dũng", "Lã Thị Duyên", "Mai Văn Em", "Quách Thị Phương",
  "Huỳnh Minh Hải", "Trần Thị Hải", "Nguyễn Văn Hiếu", "Lê Thị Hồng",
  "Phạm Đức Khải", "Hoàng Thị Kim", "Vũ Minh Lâm", "Đặng Thị Linh",
  "Bùi Văn Lộc", "Đỗ Thị Ly", "Ngô Quốc Mạnh", "Trịnh Thị Nga",
  "Lý Văn Nghĩa", "Phan Thị Nhi", "Đinh Minh Nhật", "Cao Thị Oanh",
  "Tô Văn Phát", "Hồ Thị Phúc",
];

const PHONES = [
  "0901234567", "0912345678", "0923456789", "0934567890", "0945678901",
  "0956789012", "0967890123", "0978901234", "0989012345", "0990123456",
  "0381234567", "0392345678", "0363456789", "0374567890", "0355678901",
  "0766789012", "0777890123", "0788901234", "0799012345", "0700123456",
  "0831234567", "0842345678", "0853456789", "0864567890", "0875678901",
  "0886789012", "0897890123", "0808901234", "0819012345", "0820123456",
];

// ─── Message generators ───────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

/** Full conversation: greeting → grade → exam → english level → goal → lead capture */
function buildFullSession(name, phone, grade, exam, englishLevel, country, goal, timelineMonths) {
  const englishLabel = ENGLISH_LABELS[englishLevel];
  return [
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: "Xin chào! Mình là tư vấn viên của ETEST. Bạn hiện đang học lớp mấy hoặc năm mấy đại học ạ?" }],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: `Mình đang học ${grade}` }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [
        { type: "text", text: "Bạn đang nhắm đến kỳ thi nào để chuẩn bị du học nhỉ?" },
        {
          type: "tool-ask_user", toolCallId: makeId(), state: "output-available",
          input: { question: "Bạn muốn thi kỳ thi nào?", type: "single_select", options: ["IELTS", "TOEFL", "SAT", "ACT", "Chưa biết"] },
          output: exam,
        },
      ],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: exam }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [
        { type: "text", text: `Tốt lắm! Hiện tại trình độ tiếng Anh của bạn như thế nào?` },
        {
          type: "tool-ask_user", toolCallId: makeId(), state: "output-available",
          input: { question: "Trình độ tiếng Anh hiện tại?", type: "single_select", options: ["Mới bắt đầu", "Cơ bản", "Trung cấp", "Khá", "Chưa đánh giá"] },
          output: englishLabel,
        },
      ],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: englishLabel }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: `Mình hiểu rồi! Bạn đang nhắm đến du học ${country} với mục tiêu ${goal} đúng không? Bạn dự định đi trong khoảng bao lâu nữa?` }],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: `Mình muốn du học ${country}, khoảng ${timelineMonths} tháng nữa` }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: `Tuyệt vời! Để tư vấn viên liên hệ sắp xếp buổi tư vấn miễn phí, bạn cho mình biết tên và số điện thoại nhé?` }],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: `Mình là ${name}, SĐT ${phone}` }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [
        {
          type: "tool-save_lead", toolCallId: makeId(), state: "output-available",
          input: { full_name: name, phone, grade_or_year: grade, target_exam: exam, current_english_level: englishLevel, priority_countries: [country], study_abroad_goal: `${goal} tại ${country}`, timeline_months: timelineMonths },
          output: { success: true },
        },
        { type: "text", text: `Mình đã lưu thông tin của bạn rồi! Tư vấn viên ETEST sẽ liên hệ trong vòng 24 giờ để sắp xếp buổi tư vấn miễn phí. Chúc bạn sớm đạt được mục tiêu du học ${country}! 😊` },
      ],
    },
  ];
}

/** Mid conversation: greeting → grade → exam → drops off */
function buildMidSession(grade, exam) {
  return [
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: "Xin chào! Mình là tư vấn viên của ETEST. Bạn hiện đang học lớp mấy hoặc năm mấy đại học ạ?" }],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: `Mình học ${grade}` }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [
        { type: "text", text: "Bạn có kế hoạch thi chứng chỉ nào chưa?" },
        {
          type: "tool-ask_user", toolCallId: makeId(), state: "output-available",
          input: { question: "Kỳ thi mục tiêu?", type: "single_select", options: ["IELTS", "TOEFL", "SAT", "ACT", "Chưa biết"] },
          output: exam,
        },
      ],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: exam }],
    },
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: `Bạn có thể chia sẻ thêm về trình độ tiếng Anh hiện tại và mục tiêu du học của mình không?` }],
    },
  ];
}

/** Short session: greeting only */
function buildShortSession(grade) {
  return [
    {
      id: makeId(), role: "assistant",
      parts: [{ type: "text", text: "Xin chào! Mình là tư vấn viên của ETEST. Bạn hiện đang học lớp mấy hoặc năm mấy đại học ạ?" }],
    },
    {
      id: makeId(), role: "user",
      parts: [{ type: "text", text: grade }],
    },
  ];
}

// ─── Generate sessions ────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a timestamp within the given day (YYYY-MM-DD) at a random hour */
function randomTs(dateStr, hour) {
  const m = String(randomInt(0, 59)).padStart(2, "0");
  const s = String(randomInt(0, 59)).padStart(2, "0");
  return `${dateStr}T${String(hour).padStart(2, "0")}:${m}:${s}.000Z`;
}

const DAYS = ["2026-03-20", "2026-03-21"];

const sessions = [];

// 30 full sessions (with lead capture), 12 mid sessions, 8 short sessions = 50 total
for (let i = 0; i < 50; i++) {
  const idx = String(i + 1).padStart(3, "0");
  const id = `mock-session-${idx}`;
  const day = DAYS[i % 2]; // alternate between the 2 days
  const hour = randomInt(7, 22); // business hours + evening
  const createdAt = randomTs(day, hour);
  // session lasts 5–25 minutes
  const durationMin = randomInt(5, 25);
  const updatedAt = new Date(new Date(createdAt).getTime() + durationMin * 60000).toISOString();

  let messages;
  let lead = null;

  if (i < 30) {
    // Full session with lead
    const name = NAMES[i % NAMES.length];
    const phone = PHONES[i % PHONES.length];
    const grade = pick(GRADES);
    const exam = pick(EXAMS.filter((e) => e !== "Chưa biết")); // full sessions pick a real exam
    const englishLevel = pick(ENGLISH_LEVELS);
    const country = pick(COUNTRIES);
    const goal = pick(GOALS);
    const timelineMonths = pick([3, 6, 9, 12, 18, 24]);

    messages = buildFullSession(name, phone, grade, exam, englishLevel, country, goal, timelineMonths);
    lead = {
      full_name: name,
      phone,
      grade_or_year: grade,
      target_exam: exam,
      current_english_level: englishLevel,
      priority_countries: [country],
      study_abroad_goal: `${goal} tại ${country}`,
      timeline_months: timelineMonths,
    };
  } else if (i < 42) {
    // Mid session — no lead
    messages = buildMidSession(pick(GRADES), pick(EXAMS));
  } else {
    // Short session — no lead
    messages = buildShortSession(pick(GRADES));
  }

  sessions.push({ id, messages, lead, created_at: createdAt, updated_at: updatedAt });
}

// ─── Upsert into Supabase ─────────────────────────────────────────────────────

console.log(`Seeding ${sessions.length} mock sessions...`);

const BATCH = 25;
let inserted = 0;
let failed = 0;

for (let i = 0; i < sessions.length; i += BATCH) {
  const batch = sessions.slice(i, i + BATCH);
  const { error } = await supabase
    .from("sessions")
    .upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH) + 1} error:`, error.message);
    failed += batch.length;
  } else {
    inserted += batch.length;
    console.log(`  Batch ${Math.floor(i / BATCH) + 1}: ${batch.length} rows upserted ✓`);
  }
}

console.log(`\nDone. ${inserted} inserted/updated, ${failed} failed.`);
console.log(`Sessions span: 2026-03-20 → 2026-03-21`);
console.log(`  - 30 full sessions (with lead data)`);
console.log(`  - 12 mid sessions (no lead)`);
console.log(`  -  8 short sessions (no lead)`);
