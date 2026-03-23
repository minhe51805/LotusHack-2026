import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronRight,
  DatabaseZap,
  GraduationCap,
  HandCoins,
  Headset,
  Orbit,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Lotus Counsel",
  description:
    "Giao diện tư vấn du học mới: AI nói dựa trên dữ liệu thật, school directory có thể lọc sâu, và admin workspace cho đội tuyển sinh.",
};

const navItems = [
  { label: "Mô hình vận hành", href: "#operating-model" },
  { label: "Trải nghiệm học sinh", href: "#student-flow" },
  { label: "School directory", href: "/schools" },
  { label: "Admin workspace", href: "/admin" },
];

const metrics = [
  {
    value: "24/7",
    label: "tiếp nhận đầu vào",
    detail: "Luôn mở, không chờ giờ làm việc của tư vấn viên.",
  },
  {
    value: "132",
    label: "trường đã chuẩn hóa",
    detail: "Học phí, học bổng, điều kiện và link nguồn ở cùng một dòng dữ liệu.",
  },
  {
    value: "0",
    label: "phát ngôn bịa số liệu",
    detail: "Không có tool call, không có câu trả lời về trường.",
  },
];

const operatingPrinciples = [
  {
    icon: ShieldCheck,
    title: "AI chỉ được phép nói sau khi kéo dữ liệu",
    description:
      "Các câu hỏi về trường, học phí, học bổng, visa và điều kiện đầu vào đều phải đi qua lớp dữ liệu trước khi tạo câu trả lời.",
  },
  {
    icon: Orbit,
    title: "Lead được dựng tự nhiên trong cuộc trò chuyện",
    description:
      "Tên, ngân sách, GPA, quốc gia ưu tiên và mục tiêu thi được gom dần, không ép người dùng điền một form dài ngay từ đầu.",
  },
  {
    icon: Headset,
    title: "Con người chỉ bước vào đúng lúc",
    description:
      "Khi nhu cầu đã rõ hoặc học sinh yêu cầu hỗ trợ sâu, admin nhận được session đầy đủ cùng hồ sơ tóm tắt.",
  },
];

const systemBoard = [
  {
    step: "01",
    title: "Mở đầu mềm",
    description:
      "Form đầu vào ngắn, thân thiện với mobile, chỉ hỏi những gì giúp AI tư vấn chính xác hơn.",
  },
  {
    step: "02",
    title: "Hội thoại có chủ đích",
    description:
      "Chat bubble, tool modal và school match cards giúp cuộc trò chuyện rõ nhịp, tránh cảm giác chatbot trôi nổi.",
  },
  {
    step: "03",
    title: "Admin nhìn được toàn cảnh",
    description:
      "Dashboard đọc được chất lượng lead, phiên nào đang nóng, prompt nào đang vận hành và dữ liệu trường nào cần cập nhật.",
  },
];

const trustNotes = [
  "Mỗi câu trả lời có nền dữ liệu đứng phía sau, không phải lời hứa kiểu marketing.",
  "Directory công khai cho phép phụ huynh tự kiểm tra thay vì phải tin mù quáng.",
  "Giao diện admin ưu tiên những phiên cần follow-up thật sự, không chìm trong noise.",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <header className="page-wrap py-6">
        <div className="saas-card flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
              <BotMessageSquare className="size-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                Lotus Counsel
              </p>
              <p className="text-sm text-foreground">
                AI tư vấn du học có dữ liệu thật và bàn điều phối cho đội tuyển sinh.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 transition hover:bg-secondary/70 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/schools">Mở directory</Link>
              </Button>
              <Button asChild className="gradient-btn border-0">
                <Link href="/chat">
                  Trải nghiệm chat
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="page-wrap pb-8 pt-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-center">
          <div className="relative space-y-8">
            <div className="pointer-events-none absolute -left-10 top-2 size-40 rounded-full bg-[oklch(0.76_0.145_73/0.16)] blur-3xl glow-orb" />
            <div className="space-y-5">
              <Badge variant="outline" className="w-fit">
                LotusHack 2026 rebuild
              </Badge>
              <div className="space-y-4">
                <h1 className="section-heading max-w-4xl text-foreground">
                  Một lớp giao diện mới cho{" "}
                  <span className="gradient-text">tư vấn du học đáng tin</span>,
                  nơi AI không được nói bừa.
                </h1>
                <p className="section-copy max-w-2xl">
                  Lotus Counsel ghép ba thứ vào cùng một hệ thống: chat cho học sinh,
                  school directory công khai để tự kiểm chứng, và admin workspace để
                  đội tuyển sinh xử lý lead với đầy đủ ngữ cảnh.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gradient-btn border-0">
                <Link href="/chat">
                  Bắt đầu hội thoại
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/admin">
                  Xem admin workspace
                  <ChevronRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((item) => (
                <div key={item.label} className="metric-pill card-lift space-y-2">
                  <p className="text-3xl leading-none font-semibold tracking-[-0.05em] text-foreground">
                    {item.value}
                  </p>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -right-6 top-10 size-44 rounded-full bg-[oklch(0.67_0.104_164/0.16)] blur-3xl glow-orb" />
            <div className="saas-panel tone-grid relative overflow-hidden p-4 sm:p-5">
              <div className="grid gap-4">
                <Card className="border-0 bg-[linear-gradient(135deg,oklch(0.34_0.06_218),oklch(0.43_0.072_213))] text-primary-foreground shadow-none">
                  <CardHeader className="gap-3">
                    <Badge className="w-fit bg-white/12 text-white">Control brief</Badge>
                    <CardTitle className="max-w-sm text-3xl leading-tight text-white">
                      “Trả lời được là vì đã kiểm tra dữ liệu, không phải vì model đoán.”
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm text-white/80 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/60">
                        Input
                      </p>
                      <p className="mt-2 leading-6">
                        Học sinh hỏi về ngành, ngân sách, quốc gia ưu tiên, học bổng.
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/60">
                        Output
                      </p>
                      <p className="mt-2 leading-6">
                        Session được lưu, lead được trích, counselor chỉ xử lý khi đã có lý do.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="saas-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                          Trust ledger
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                          Ba lớp kiểm soát trước khi có lead.
                        </p>
                      </div>
                      <ShieldCheck className="size-5 text-primary" />
                    </div>
                    <div className="mt-4 space-y-3">
                      {trustNotes.map((item) => (
                        <div
                          key={item}
                          className="rounded-[1.15rem] border border-border/70 bg-secondary/55 p-4 text-sm leading-6 text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="saas-card flex flex-col justify-between p-5">
                    <div className="space-y-3">
                      <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                        Visible surfaces
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-[1.15rem] border border-border/70 bg-background/85 p-4">
                          <Sparkles className="size-4 text-primary" />
                          <span className="text-sm text-foreground">Chat guide cho học sinh</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-[1.15rem] border border-border/70 bg-background/85 p-4">
                          <GraduationCap className="size-4 text-primary" />
                          <span className="text-sm text-foreground">Directory để kiểm chứng công khai</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-[1.15rem] border border-border/70 bg-background/85 p-4">
                          <ChartNoAxesCombined className="size-4 text-primary" />
                          <span className="text-sm text-foreground">Admin board cho đội vận hành</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 rounded-[1.1rem] bg-secondary/70 p-4 text-sm leading-6 text-muted-foreground">
                      Một hệ thống nhưng ba điểm chạm, mỗi điểm chạm giải quyết một vấn đề
                      tin tưởng khác nhau.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="operating-model" className="page-wrap py-14">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-4">
            <div className="section-kicker">Operating model</div>
            <h2 className="section-heading text-foreground">
              Không “thêm AI” lên quy trình cũ. Viết lại quy trình để AI có trách nhiệm.
            </h2>
            <p className="section-copy">
              UI mới ưu tiên nhịp rõ ràng: nơi nào để hỏi, nơi nào để xác thực, nơi nào
              để bàn giao. Người dùng không cần hiểu kiến trúc phía sau, nhưng họ cảm
              nhận được độ tin cậy trong từng bề mặt.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {operatingPrinciples.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="saas-card card-lift p-5">
                  <div className="mb-5 flex size-12 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="student-flow" className="page-wrap py-14">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="saas-card p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="section-kicker">Experience stack</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                  Từ góc nhìn học sinh đến góc nhìn counselor.
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/chat">
                  Mở luồng chat
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid gap-4">
              {systemBoard.map((item) => (
                <div
                  key={item.step}
                  className="grid gap-4 rounded-[1.5rem] border border-border/80 bg-background/85 p-4 md:grid-cols-[auto_1fr]"
                >
                  <div className="flex size-12 items-center justify-center rounded-full border border-border/80 bg-secondary/70 text-sm font-semibold text-foreground">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="saas-card card-lift p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                  <DatabaseZap className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    School layer
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Directory không chỉ để trưng bày.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Người dùng có thể lọc trường theo quốc gia, location, bậc học, học phí,
                điều kiện xét tuyển và học bổng ngay trên web public.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/schools">Xem school directory</Link>
              </Button>
            </div>

            <div className="saas-card card-lift p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                  <BriefcaseBusiness className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    Ops layer
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Admin workspace đặt ưu tiên lên đúng phiên.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Sidebar hiển thị phiên mới, flag cần hỗ trợ, điều hướng vào settings,
                trường, khóa học và dịch vụ trong cùng một shell vận hành.
              </p>
              <Button asChild className="gradient-btn mt-5 border-0">
                <Link href="/admin">Mở admin</Link>
              </Button>
            </div>

            <div className="saas-card card-lift p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
                  <Target className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                    Business intent
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Không chase mọi lead. Chase lead đúng thời điểm.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                UI mới được viết để giảm ma sát, tăng chất lượng đầu vào và giúp counselor
                có đủ bối cảnh trước khi nhấc máy.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-wrap pb-20 pt-10">
        <div className="saas-card overflow-hidden p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                Final call
              </Badge>
              <h2 className="section-heading max-w-4xl text-foreground">
                Nếu học sinh còn nghi ngờ, hãy cho họ một giao diện để tự kiểm chứng.
              </h2>
              <p className="section-copy max-w-2xl">
                Chat để hỏi, directory để lọc, admin để điều phối. Toàn bộ UI đã được
                viết lại theo một hệ thống mới, rõ nhịp hơn, đậm chất sản phẩm hơn và
                bớt cảm giác “template AI”.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gradient-btn border-0">
                <Link href="/chat">
                  Dùng ngay
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/admin">Vào workspace</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <HandCoins className="size-4 text-primary" />
              Lotus Counsel giúp quy trình tuyển sinh nói chuyện như một sản phẩm thực thụ.
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Data-first, trust-first, operator-friendly.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
