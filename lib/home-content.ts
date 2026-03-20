export type HomeNavigationItem = {
  label: string;
  href: string;
  external?: boolean;
  hasDropdown?: boolean;
};

export type HeroSlide = {
  badge: string;
  title: string;
  description: string;
  href: string;
  image: string;
  external?: boolean;
};

export type HomeMetric = {
  value: string;
  label: string;
  detail: string;
};

export type ProgramCard = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image: string;
  external?: boolean;
};

export type ProofPoint = {
  title: string;
  description: string;
};

export type ResultStory = {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  href: string;
};

export type MentorCard = {
  name: string;
  role: string;
  description: string;
};

export type TestimonialCard = {
  quote: string;
  author: string;
  role: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type PartnerLogo = {
  name: string;
  src: string;
};

export type CampusContact = {
  campus: string;
  address: string;
  phone: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

export const homeNavigation: HomeNavigationItem[] = [
  { label: "VỀ ETEST", href: "/ve-etest/", hasDropdown: true },
  { label: "THÀNH TÍCH HỌC VIÊN", href: "/thanh-tich/" },
  { label: "KHÓA HỌC", href: "/khoa-hoc/", hasDropdown: true },
  {
    label: "TƯ VẤN DU HỌC",
    href: "https://duhoc-etest.edu.vn/",
    external: true,
  },
  {
    label: "IELTS/DIGITAL SAT",
    href: "https://sat.etest.edu.vn/",
    external: true,
    hasDropdown: true,
  },
  {
    label: "DU HỌC HÈ",
    href: "https://duhoche.duhoc-etest.edu.vn/?utm_source=google&utm_medium=etest_duhoche",
    external: true,
  },
  { label: "KIẾN THỨC", href: "/tin-tuc/", hasDropdown: true },
  { label: "TUYỂN DỤNG", href: "/tuyen-dung/", hasDropdown: true },
  { label: "LIÊN HỆ", href: "/lien-he/" },
];

export const heroSlides: HeroSlide[] = [
  {
    badge: "Workshop học bổng",
    title: "Săn học bổng Mỹ với lộ trình học thuật và hồ sơ cá nhân hóa",
    description:
      "Kết hợp IELTS, SAT và chiến lược hồ sơ để học sinh tự tin bước vào các trường đại học quốc tế.",
    href: "https://event.etest.edu.vn/workshopharvard2103?utm_source=Web&utm_medium=HocbongMy&utm_campaign=Harvard",
    image:
      "https://etest.edu.vn/wp-content/uploads/2026/03/z7605229911687_54553423844166fa3e9a3b4be6caa2b6-1400x635.jpg",
    external: true,
  },
  {
    badge: "Digital SAT",
    title: "Bứt tốc SAT với chiến thuật làm bài, phản hồi sát sao và mock test định kỳ",
    description:
      "Phù hợp cho học sinh THPT cần một lộ trình tăng tốc rõ ràng, có mentor theo sát từng giai đoạn.",
    href: "https://digitalsat.etest.edu.vn/?utm_source=Website&utm_medium=PC",
    image: "https://etest.edu.vn/wp-content/uploads/2026/01/khanh-nam-website-1400x635.jpg",
    external: true,
  },
  {
    badge: "IELTS academic",
    title: "Nâng band IELTS bằng chương trình học theo mục tiêu đầu ra",
    description:
      "Từ nền tảng đến nâng cao, học viên được định hướng kỹ năng, chiến lược và nhịp học phù hợp.",
    href: "/khoa-hoc/luyen-thi-ielts/",
    image: "https://etest.edu.vn/wp-content/uploads/2019/12/testprep_new-1400x635.jpg",
  },
  {
    badge: "AMP",
    title: "Xây hồ sơ du học mạnh với chiến lược AMP 1:1",
    description:
      "Tập trung vào viết luận, hoạt động ngoại khóa và tư duy kể chuyện để hồ sơ có bản sắc riêng.",
    href: "/khoa-hoc/chuong-trinh-amp/",
    image: "https://etest.edu.vn/wp-content/uploads/2019/12/AMP_new-1400x635.jpg",
  },
];

export const homeMetrics: HomeMetric[] = [
  {
    value: "20+",
    label: "năm kinh nghiệm",
    detail: "Đồng hành cùng học sinh theo đuổi mục tiêu học thuật và du học.",
  },
  {
    value: "3",
    label: "cơ sở tư vấn",
    detail: "TP.HCM Quận 3, TP.HCM Quận 7 và Đà Nẵng.",
  },
  {
    value: "6",
    label: "chương trình chủ lực",
    detail: "Từ IELTS, SAT đến AMP và các lớp nền tảng học thuật.",
  },
  {
    value: "1:1",
    label: "lộ trình cá nhân hóa",
    detail: "Thiết kế theo mục tiêu, năng lực hiện tại và mốc thời gian của từng học viên.",
  },
];

export const programCards: ProgramCard[] = [
  {
    title: "Luyện thi IELTS",
    subtitle: "15+ tuổi",
    description: "Lộ trình học thuật toàn diện cho mục tiêu band score, xét tuyển và du học.",
    href: "/khoa-hoc/luyen-thi-ielts/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/IELTS-BANNER.jpg",
  },
  {
    title: "Digital SAT",
    subtitle: "THPT",
    description: "Xây tư duy làm bài, tăng tốc điểm số và luyện đề sát cấu trúc bài thi mới.",
    href: "/khoa-hoc/luyen-thi-sat/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/SAT-03.jpg",
  },
  {
    title: "IELTS Juniors",
    subtitle: "9 - 14 tuổi",
    description: "Luyện KET, PET, FCE và nền tảng học thuật sớm cho học sinh trung học.",
    href: "/khoa-hoc/luyen-thi-ielts-juniors/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/IELTS-JUNIORS.jpg",
  },
  {
    title: "Săn học bổng AMP",
    subtitle: "16 - 18 tuổi",
    description: "Huấn luyện viết luận, định vị hồ sơ và kế hoạch hoạt động ngoại khóa nổi bật.",
    href: "/khoa-hoc/chuong-trinh-amp/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/amp.jpg",
  },
  {
    title: "Luyện thi AP",
    subtitle: "16+ tuổi",
    description: "Củng cố kiến thức môn học, luyện bài bản để sẵn sàng cho chương trình AP.",
    href: "/khoa-hoc/luyen-thi-ap/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/ap.jpg",
  },
  {
    title: "Tư vấn du học",
    subtitle: "Dài hạn và hè",
    description: "Định hướng quốc gia, trường phù hợp và hoàn thiện bộ hồ sơ du học trọn gói.",
    href: "https://duhoc-etest.edu.vn/",
    image: "https://etest.edu.vn/wp-content/uploads/2022/06/ib.jpg",
    external: true,
  },
];

export const proofPoints: ProofPoint[] = [
  {
    title: "Định vị mục tiêu rõ trước khi học",
    description: "Mỗi học viên bắt đầu bằng việc đo năng lực hiện tại và xác định đích đến cụ thể.",
  },
  {
    title: "Theo sát tiến độ bằng phản hồi liên tục",
    description: "Bài tập, mock test và tư vấn định kỳ giúp học viên không bị chệch nhịp trong lộ trình.",
  },
  {
    title: "Kết nối học thuật với chiến lược hồ sơ",
    description: "Không chỉ nâng điểm, chương trình còn hướng tới bức tranh du học và phát triển dài hạn.",
  },
];

export const resultStories: ResultStory[] = [
  {
    title: "Hồ Ngọc Thúc Bình",
    subtitle: "Học viên tiêu biểu trong lộ trình học thuật và hồ sơ du học",
    description:
      "Kết hợp luyện thi chuẩn hóa, tối ưu hoạt động học thuật và xây dựng bộ hồ sơ cá nhân có chiều sâu.",
    highlights: ["Lộ trình cá nhân hóa", "Cố vấn sát sao", "Tối ưu hồ sơ học thuật"],
    href: "/thanh-tich/",
  },
  {
    title: "IELTS theo mục tiêu đầu ra",
    subtitle: "Tăng tốc từng kỹ năng thay vì học dàn trải",
    description:
      "Phân tích điểm yếu theo từng kỹ năng để ưu tiên đúng trọng tâm và rút ngắn thời gian cải thiện.",
    highlights: ["Speaking feedback", "Writing strategy", "Mock test định kỳ"],
    href: "/khoa-hoc/luyen-thi-ielts/",
  },
  {
    title: "SAT cho học sinh THPT",
    subtitle: "Rèn tư duy và chiến lược quản lý thời gian",
    description:
      "Học viên được luyện theo cấu trúc số hóa, kết hợp kỹ năng làm bài và phân tích lỗi cá nhân.",
    highlights: ["Math accuracy", "Reading logic", "Digital practice"],
    href: "/khoa-hoc/luyen-thi-sat/",
  },
];

export const mentorCards: MentorCard[] = [
  {
    name: "Nguyễn Phượng Hoàng Lam",
    role: "Tổng giám đốc và cố vấn chiến lược học thuật",
    description:
      "Định hướng chiến lược đào tạo, săn học bổng và tư vấn du học với góc nhìn dài hạn cho từng học viên.",
  },
  {
    name: "Nguyễn Bùi Minh Cường",
    role: "Giảng viên học thuật",
    description:
      "Đồng hành cùng học viên trong việc xây nền kiến thức, chiến lược học và kỷ luật ôn luyện bền vững.",
  },
  {
    name: "Lộ Nhật Trường",
    role: "Giảng viên Digital SAT",
    description:
      "Tập trung vào tư duy giải quyết vấn đề, kỹ thuật làm bài và khả năng tối ưu điểm số trong thời gian giới hạn.",
  },
  {
    name: "Craig Steven Berry",
    role: "Giảng viên IELTS",
    description:
      "Củng cố năng lực tiếng Anh học thuật với phản hồi trực tiếp, chú trọng vào sự tự tin và độ chính xác.",
  },
];

export const testimonials: TestimonialCard[] = [
  {
    quote:
      "Điều phụ huynh yên tâm nhất là lộ trình học rõ ràng, có người theo sát tiến độ và luôn giải thích vì sao con cần từng bước như vậy.",
    author: "Phụ huynh học viên IELTS",
    role: "Nhóm phụ huynh đồng hành dài hạn",
  },
  {
    quote:
      "Không khí học nghiêm túc nhưng không áp lực. Mình được hướng dẫn cách học đúng thay vì chỉ làm thêm thật nhiều bài tập.",
    author: "Học viên Digital SAT",
    role: "Nhóm học sinh THPT",
  },
  {
    quote:
      "Điểm mình thích nhất là mọi mục tiêu đều gắn với một kế hoạch cụ thể: band score, hoạt động, bài luận và timeline nộp hồ sơ.",
    author: "Học viên AMP",
    role: "Nhóm học sinh săn học bổng",
  },
];

export const galleryImages: GalleryImage[] = [
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/07/IMG_4270-2-1200x800.jpg",
    alt: "Học viên tham gia hoạt động học thuật tại ETEST",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/07/IMG_4288-1244x800.jpg",
    alt: "Buổi workshop tại trung tâm ETEST",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/08/IMG_0213-01-1200x800.jpeg",
    alt: "Hoạt động kết nối học viên và phụ huynh",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/08/IMG_0201-01-1200x800.jpeg",
    alt: "Không gian sự kiện học viên ETEST",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/08/IMG_0305-1200x800.jpg",
    alt: "Hình ảnh lớp học và hoạt động nổi bật",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/08/IMG_0406-1200x800.jpg",
    alt: "Khoảnh khắc vinh danh học viên",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2019/07/IMG_4295_new-1200x800.jpg",
    alt: "Buổi tổng kết và giao lưu học viên",
  },
  {
    src: "https://etest.edu.vn/wp-content/uploads/2024/01/anh_Viber_2024-01-05_15-59-35-000.jpg",
    alt: "Hội thảo du học và trải nghiệm cộng đồng",
  },
];

export const partnerLogos: PartnerLogo[] = [
  {
    name: "American University",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/American-University-780x800.png",
  },
  {
    name: "Baylor",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/Baylor.png",
  },
  {
    name: "New York University",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/nyu_n-800x800.jpg",
  },
  {
    name: "Case Western Reserve University",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/case-western-reserve-university-801x800.png",
  },
  {
    name: "Stevens Institute of Technology",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/Stevens-Institute-of-Technology-800x800.png",
  },
  {
    name: "MCPHS University",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/MCPHS_University-01-800x800.png",
  },
  {
    name: "Florida Institute of Technology",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/Florida-Institute-of-Tech-800x800.png",
  },
  {
    name: "Michigan State University",
    src: "https://etest.edu.vn/wp-content/uploads/2022/05/Michigan-State-Uni-798x800.png",
  },
  {
    name: "Purdue University",
    src: "https://etest.edu.vn/wp-content/uploads/2025/03/purdue-university-04.png",
  },
  {
    name: "Matignon High School",
    src: "https://etest.edu.vn/wp-content/uploads/2025/03/Matignon-High-School-logo-800x800.jpg",
  },
  {
    name: "University of Massachusetts Dartmouth",
    src: "https://etest.edu.vn/wp-content/uploads/2025/03/University_of_Massachusetts_Dartmouth_seal.svg-800x800.png",
  },
];

export const campusContacts: CampusContact[] = [
  {
    campus: "Cơ sở Quận 3",
    address: "Lầu 3, 215 Nam Kỳ Khởi Nghĩa, Anh Dang Building, Phường Xuân Hòa, TP.HCM",
    phone: "093 380 6699",
    href: "https://g.co/kgs/SDnGPkP",
  },
  {
    campus: "Cơ sở Quận 7",
    address: "Lầu 6, 79-81-83 Hoàng Văn Thái, Sai Gon Bank Building, Phường Tân Mỹ, TP.HCM",
    phone: "093 780 6699",
    href: "https://g.co/kgs/dg3SZLf",
  },
  {
    campus: "Cơ sở Đà Nẵng",
    address: "Số 9, Đường C2, Khu Đô Thị Quốc tế Đa Phước, Phường Hải Châu, TP. Đà Nẵng",
    phone: "093 617 7699",
    href: "/lien-he/",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    title: "Thông tin công ty",
    links: [
      { label: "Về ETEST", href: "/ve-etest/" },
      { label: "Liên hệ", href: "/lien-he/" },
      { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat/" },
      { label: "Thành tích học viên", href: "/thanh-tich/" },
    ],
  },
  {
    title: "Khóa học nổi bật",
    links: [
      { label: "Luyện thi IELTS", href: "/khoa-hoc/luyen-thi-ielts/" },
      { label: "Digital SAT", href: "/khoa-hoc/luyen-thi-sat/" },
      { label: "IELTS Juniors", href: "/khoa-hoc/luyen-thi-ielts-juniors/" },
      { label: "Chương trình AMP", href: "/khoa-hoc/chuong-trinh-amp/" },
    ],
  },
  {
    title: "Kết nối",
    links: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/Etestvietnam/",
        external: true,
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/etest_vietnam/",
        external: true,
      },
      {
        label: "YouTube",
        href: "https://www.youtube.com/c/ETESTVIETNAM",
        external: true,
      },
      {
        label: "Tư vấn du học",
        href: "https://duhoc-etest.edu.vn/",
        external: true,
      },
    ],
  },
];
