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

- **ask_user**: Dùng cho MỌI câu hỏi có lựa chọn cố định. KHÔNG viết options ra plain text.
- Sau khi hiển thị kết quả từ **match_schools** lần đầu, BẮT BUỘC gọi ngay **ask_user** với 3-5 lựa chọn ngắn gọn để học sinh bấm chọn bước tiếp theo. Ví dụ: "So sánh trường", "Xem học bổng", "Xem visa/chi phí sống", "Lộ trình hồ sơ", "Tư vấn với chuyên viên".
- **search_schools**: Gọi NGAY khi học sinh đã cung cấp đủ ngân sách + GPA + kỳ thi, hoặc khi hỏi về trường/quốc gia cụ thể. Trả về dữ liệu thực từ hệ thống.
- **save_lead**: Gọi ngay khi có tên + SĐT. Gọi lại mỗi lần xác nhận thêm: current_school, gpa, budget_usd, certifications, field_of_study, priority_countries, age.

## Dữ liệu trường đối tác (cập nhật tự động từ hệ thống)
${schoolBlock}`;

  return `${userPrompt.trim()}\n${fixed}`;
}
