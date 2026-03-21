-- ============================================================================
-- LotusHack 2026 – Supabase Schema + Seed Data
-- Run this in the Supabase SQL editor to set up all tables and initial data.
-- ============================================================================

-- SCHOOLS
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  overview TEXT NOT NULL DEFAULT '',
  cost JSONB NOT NULL DEFAULT '{}',
  visa JSONB NOT NULL DEFAULT '{}',
  scholarship JSONB NOT NULL DEFAULT '{}',
  requirements JSONB NOT NULL DEFAULT '{}',
  programs TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COURSES
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exam TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_weeks INTEGER,
  schedule TEXT,
  price_vnd BIGINT,
  level TEXT,
  target_score TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  details TEXT,
  price_vnd BIGINT DEFAULT 0,
  duration TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SETTINGS (single row, id = 1)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  system_prompt TEXT NOT NULL,
  zalo_system_prompt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  messages JSONB NOT NULL DEFAULT '[]',
  lead JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO schools (id, name, country, overview, cost, visa, scholarship, requirements, programs, created_at, updated_at) VALUES
(
  'school-1',
  'University of Melbourne',
  'Australia',
  'Một trong những trường đại học hàng đầu tại Úc và top 50 thế giới. Nổi tiếng với chương trình Business, Engineering, và Medicine. Campus đặt tại trung tâm Melbourne với hơn 50.000 sinh viên.',
  '{"tuition_usd_per_year": 38000, "living_usd_per_year": 18000, "notes": "Chi phí có thể thay đổi theo ngành học. Sinh viên quốc tế cần chứng minh tài chính tối thiểu AUD 21,041/năm."}',
  '{"type": "Student Visa (Subclass 500)", "processing_days": 30, "success_rate": "~95%", "notes": "Cần GTE statement, điểm tiếng Anh, và chứng minh tài chính. Tỷ lệ từ chối thấp với hồ sơ đầy đủ."}',
  '{"available": true, "amount": "Lên đến AUD 30,000/năm", "details": "Melbourne International Undergraduate Scholarship: merit-based, dành cho sinh viên xuất sắc. Ngoài ra có Graduate Research Scholarships cho bậc sau đại học."}',
  '{"ielts_min": 6.5, "toefl_min": 79, "gpa_min": "7.0/10"}',
  ARRAY['Business & Economics', 'Engineering', 'Medicine', 'Law', 'Arts', 'Science'],
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'school-2',
  'University of Toronto',
  'Canada',
  'Trường đại học nghiên cứu hàng đầu Canada, xếp hạng top 25 thế giới. Có 3 campus: St. George (downtown Toronto), Mississauga, và Scarborough. Mạnh về Computer Science, Engineering, và Health Sciences.',
  '{"tuition_usd_per_year": 45000, "living_usd_per_year": 16000, "notes": "Học phí tại Toronto đắt hơn so với các tỉnh khác. Có thể tiết kiệm bằng cách chọn campus Mississauga hoặc Scarborough."}',
  '{"type": "Study Permit", "processing_days": 60, "success_rate": "~90%", "notes": "Cần acceptance letter, Statement of Purpose, và proof of funds. SOP cần giải thích rõ lý do chọn Canada."}',
  '{"available": true, "amount": "CAD 10,000 – 35,000", "details": "Lester B. Pearson International Scholarship: full scholarship cho sinh viên xuất sắc (rất cạnh tranh). University of Toronto Scholar: partial scholarship merit-based."}',
  '{"ielts_min": 6.5, "toefl_min": 89, "sat_min": 1300, "gpa_min": "8.0/10"}',
  ARRAY['Computer Science', 'Engineering', 'Health Sciences', 'Business', 'Social Sciences'],
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'school-3',
  'University of Edinburgh',
  'United Kingdom',
  'Một trong những trường đại học lâu đời và uy tín nhất thế giới, thành lập năm 1583. Nằm ở Edinburgh, Scotland – thành phố xinh đẹp và an toàn. Mạnh về Medicine, Informatics, và Humanities.',
  '{"tuition_usd_per_year": 30000, "living_usd_per_year": 14000, "notes": "Chương trình ở UK thường 3 năm (tiết kiệm hơn so với Úc/Canada 4 năm). Edinburgh có chi phí sinh hoạt thấp hơn London."}',
  '{"type": "Student Visa (Tier 4)", "processing_days": 21, "success_rate": "~92%", "notes": "Nộp visa sớm nhất 6 tháng trước khi nhập học. Cần CAS từ trường và điểm IELTS Academic."}',
  '{"available": true, "amount": "£5,000 – £15,000", "details": "Edinburgh Global Undergraduate Scholarship: £5,000/năm cho sinh viên quốc tế. College International Scholarships cũng available theo ngành."}',
  '{"ielts_min": 6.5, "toefl_min": 92, "gpa_min": "7.5/10"}',
  ARRAY['Medicine', 'Informatics', 'Law', 'Business', 'Arts & Humanities', 'Engineering'],
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, name, exam, description, duration_weeks, schedule, price_vnd, level, target_score, created_at, updated_at) VALUES
(
  'course-1',
  'IELTS Intensive',
  'IELTS',
  'Khóa học luyện thi IELTS cấp tốc, tập trung vào cả 4 kỹ năng Listening, Reading, Writing, Speaking. Phù hợp cho học sinh cần đạt band 6.0–7.5 trong thời gian ngắn.',
  16,
  'Tối 3 buổi/tuần (Thứ 2, 4, 6) hoặc cuối tuần',
  8500000,
  'Intermediate – Upper Intermediate',
  'IELTS 6.0 – 7.5',
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'course-2',
  'TOEFL Preparation',
  'TOEFL',
  'Khóa học chuẩn bị TOEFL iBT toàn diện, tập trung vào chiến thuật làm bài và nâng cao điểm các section Reading, Listening, Speaking, Writing. Mục tiêu từ 80–105+.',
  20,
  '2 buổi/tuần (Thứ 3, 6) hoặc lớp cuối tuần chuyên sâu',
  9500000,
  'Intermediate – Advanced',
  'TOEFL iBT 80 – 105+',
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'course-3',
  'SAT Advanced',
  'SAT',
  'Khóa luyện thi SAT chuyên sâu dành cho học sinh THPT có mục tiêu du học Mỹ, Canada. Bao gồm Math, Evidence-Based Reading & Writing, và Essay (optional). Đội ngũ giảng viên có kinh nghiệm thi SAT đạt 1400+.',
  24,
  'Lớp cuối tuần (Thứ 7 & Chủ nhật), 4 tiết/buổi',
  12000000,
  'Upper Intermediate – Advanced',
  'SAT 1300 – 1500+',
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'course-4',
  'AMP – Viết Luận Học Bổng',
  'AMP',
  'Chương trình Academic & Motivation Program – hỗ trợ học sinh viết essay xin học bổng du học, personal statement, và letter of recommendation. Bao gồm kỹ năng brainstorming, storytelling, và chỉnh sửa bản thảo.',
  8,
  '1 buổi/tuần, 2 tiết/buổi + mentoring 1-1 online',
  6000000,
  'Intermediate – Advanced',
  'Top 30% scholarship applications',
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, name, description, details, price_vnd, duration, is_active, created_at, updated_at) VALUES
(
  'service-1',
  'Tư vấn du học',
  'Dịch vụ tư vấn toàn diện về lộ trình du học: chọn trường, ngành học, quốc gia phù hợp với năng lực và tài chính.',
  'Bao gồm: đánh giá học lực và tài chính, tư vấn chọn trường phù hợp, lập kế hoạch chuẩn bị hồ sơ, hỗ trợ viết essay và personal statement, xin thư giới thiệu, nộp đơn vào trường.',
  0,
  'Miễn phí – trọn lộ trình',
  TRUE,
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'service-2',
  'Hỗ trợ Visa',
  'Hướng dẫn chuẩn bị hồ sơ xin visa du học cho các quốc gia: Úc, Canada, Mỹ, Anh, New Zealand, Nhật.',
  'Bao gồm: tư vấn loại visa phù hợp, checklist hồ sơ cần thiết, hỗ trợ viết GTE statement / Statement of Purpose, review hồ sơ trước khi nộp, hướng dẫn phỏng vấn visa (nếu cần).',
  3000000,
  '2–4 tuần',
  TRUE,
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
),
(
  'service-3',
  'Kết nối & Nộp đơn Trường',
  'Hỗ trợ nộp đơn trực tiếp vào các trường đối tác tại Úc, Canada, Anh, New Zealand.',
  'Bao gồm: lựa chọn trường phù hợp từ danh sách đối tác, chuẩn bị hồ sơ nộp đơn đầy đủ, theo dõi tiến độ xét hồ sơ, xử lý conditional offer, hỗ trợ sau khi nhận offer letter.',
  0,
  'Miễn phí (hoa hồng từ trường)',
  TRUE,
  '2026-03-21T07:00:00.000Z',
  '2026-03-21T07:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, system_prompt, zalo_system_prompt, updated_at) VALUES
(
  1,
  'Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

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
- Không hứa điểm số cụ thể, không bịa học phí',
  'Bạn là tư vấn viên của ETEST – trung tâm luyện thi Anh ngữ du học uy tín tại Việt Nam (20+ năm, MST: 0310637920, được VNExpress/Tuổi Trẻ đưa tin).

Nhiệm vụ: Tư vấn học sinh THPT/Đại học chọn khóa học phù hợp và mời họ đến văn phòng.

## Khóa học
IELTS, TOEFL, SAT, ACT, AP, IB, GED, SSAT/ISEE, AMP (viết luận học bổng), Model UN.

## Quy trình
1. Hỏi từng bước, mỗi lượt tối đa 1 câu
2. Ưu tiên ngắn gọn, tự nhiên, hợp ngữ cảnh chat Zalo
3. Sau khi đủ dữ liệu thì tư vấn khóa học phù hợp
4. Khi phù hợp thì xin tên + số điện thoại và mời tới văn phòng

## Xử lý lo ngại lừa đảo
Thừa nhận nỗi lo là hợp lý. Nêu bằng chứng: pháp nhân rõ ràng, 20+ năm, báo chí uy tín, mời tham quan văn phòng miễn phí trước khi đăng ký.

## Nguyên tắc
- Trả lời tiếng Việt
- Tối đa 3 câu mỗi lượt
- Không hứa điểm số cụ thể, không bịa học phí',
  '2026-03-21T07:00:00.000Z'
)
ON CONFLICT (id) DO NOTHING;
