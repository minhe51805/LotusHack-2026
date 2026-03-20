import { getSchools } from "./data";
export { DEFAULT_USER_PROMPT } from "./prompt-defaults";

/**
 * The fixed portion of the system prompt — always appended after the
 * user-configurable tone/flow section. Includes tool usage rules and
 * live school data fetched from Supabase.
 */
export async function buildSystemPrompt(userPrompt: string): Promise<string> {
  const schools = await getSchools();

  const schoolBlock =
    schools.length === 0
      ? "Hiện chưa có dữ liệu trường trong hệ thống."
      : schools
          .map((s) => {
            const r = s.requirements;
            const scoreReqs = [
              r.ielts_min != null ? `IELTS ≥ ${r.ielts_min}` : null,
              r.toefl_min != null ? `TOEFL ≥ ${r.toefl_min}` : null,
              r.sat_min != null ? `SAT ≥ ${r.sat_min}` : null,
              r.gpa_min ? `GPA ≥ ${r.gpa_min}` : null,
            ]
              .filter(Boolean)
              .join(", ");

            return [
              `**${s.name}** (${s.country})`,
              `  Giới thiệu: ${s.overview}`,
              `  Yêu cầu: ${scoreReqs || "Liên hệ trường"}`,
              `  Học phí: $${(s.cost.tuition_usd_per_year ?? 0).toLocaleString()}/năm · Sinh hoạt: $${(s.cost.living_usd_per_year ?? 0).toLocaleString()}/năm`,
              s.cost.notes ? `  Chi phí ghi chú: ${s.cost.notes}` : null,
              `  Visa: ${s.visa.type ?? "N/A"} — xử lý ~${s.visa.processing_days ?? "?"} ngày (${s.visa.success_rate ?? "?"})`,
              s.visa.notes ? `  Visa ghi chú: ${s.visa.notes}` : null,
              `  Học bổng: ${s.scholarship.available ? `${s.scholarship.amount} — ${s.scholarship.details}` : "Không có"}`,
              s.programs?.length
                ? `  Ngành: ${s.programs.join(", ")}`
                : null,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n\n");

  const fixed = `
## Công cụ (bắt buộc — không được bỏ qua)
Luôn ưu tiên dùng công cụ thay vì liệt kê options trong plain text.

- **ask_user**: Dùng cho MỌI câu hỏi có lựa chọn cố định (kỳ thi, trình độ, timeline, lý do du học, v.v.). Không được viết options ra text.
- **search_schools**: Dùng khi học sinh hỏi về yêu cầu đầu vào, học phí, visa, học bổng của một trường hoặc quốc gia cụ thể. Hệ thống sẽ trả về dữ liệu thực từ danh sách trường đối tác.
- **save_lead**: Gọi ngay khi thu thập đủ tên + số điện thoại, hoặc khi kết thúc hội thoại dù thiếu thông tin.

## Dữ liệu trường đối tác (cập nhật tự động từ hệ thống)
${schoolBlock}`;

  return `${userPrompt.trim()}\n${fixed}`;
}

/**
 * The default user-configurable prompt (tone & flow only).
 * Tool instructions are NOT included here — they are appended by buildSystemPrompt.
 */
export const DEFAULT_USER_PROMPT = `Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

Nhiệm vụ: Tư vấn học sinh THPT/Đại học chọn khóa học phù hợp và mời họ đến văn phòng tư vấn trực tiếp.

## Khóa học ETEST
IELTS, TOEFL, SAT, ACT, AP, IB, GED, SSAT/ISEE, AMP (viết luận học bổng), Model UN.

## Quy trình tư vấn (tuần tự, mỗi lượt hỏi tối đa 1 câu)
1. Chào hỏi thân thiện, hỏi lớp/năm học
2. Hỏi kỳ thi mục tiêu → dùng ask_user (single_select)
3. Hỏi trình độ tiếng Anh hiện tại → dùng ask_user (single_select)
4. Hỏi timeline và mục tiêu du học
5. Tư vấn khóa học phù hợp, xử lý phản đối
6. Thu thập tên + SĐT, gọi save_lead, chốt lịch hẹn tư vấn

## Xử lý lo ngại lừa đảo
Thừa nhận nỗi lo là hoàn toàn hợp lý. Nêu bằng chứng: pháp nhân rõ ràng, 20+ năm hoạt động, được VNExpress/Tuổi Trẻ đưa tin, mời tham quan văn phòng miễn phí trước khi đăng ký.

## Phong cách
- Trả lời tiếng Việt (trừ khi học sinh dùng tiếng Anh)
- Thân thiện, ngắn gọn — không quá 3 câu mỗi lượt
- Không hứa điểm số cụ thể, không bịa học phí`;
