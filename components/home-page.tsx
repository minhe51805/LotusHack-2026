/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { EtestRouteRecord } from "../lib/source-site";
import { HeroBanner } from "./hero-banner";

import { LeadCaptureForm } from "../components/lead-capture-form";
import {
  campusContacts,
  galleryImages,
  heroSlides,
  homeMetrics,
  partnerLogos,
  programCards,
  resultStories,
} from "../lib/home-content";

type ProgramShowcaseCard = {
  title: string;
  description: string;
  href: string;
  image: string;
  external?: boolean;
};

export type HomeArticle = {
  title: string;
  path: string;
  description: string;
  excerpt?: string;
  featuredImage?: string;
  updatedAt?: string;
};

interface HomePageProps {
  latestPosts: HomeArticle[];
  programCards?: ProgramShowcaseCard[];
}

function formatDate(dateString?: string) {
  if (!dateString) {
    return "Cập nhật gần đây";
  }

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "Cập nhật gần đây";
  }
}

function SectionHeading({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description?: string;
}) {
  return (
    <div id={id} className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center">
      <h2 className="max-w-5xl text-balance text-3xl font-extrabold uppercase leading-[1.15] tracking-[0.01em] text-[#9c1619] sm:text-4xl lg:text-[3.1rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-3xl text-base leading-8 text-[#28354f]/82 sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}

export function HomePage({ latestPosts }: HomePageProps) {
  const featuredPrograms = useMemo<ProgramShowcaseCard[]>(
    () => [
      {
        title: "LUYỆN THI IELTS",
        description: "Dành cho học viên từ 15 tuổi trở lên",
        href: programCards[0]?.href ?? "/khoa-hoc/luyen-thi-ielts/",
        image:
          programCards[0]?.image ??
          "https://etest.edu.vn/wp-content/uploads/2022/06/IELTS-BANNER.jpg",
        external: programCards[0]?.external,
      },
      {
        title: "LUYỆN THI DIGITAL SAT",
        description: "Dành cho học viên trên 15 tuổi",
        href: programCards[1]?.href ?? "/khoa-hoc/luyen-thi-sat/",
        image:
          programCards[1]?.image ?? "https://etest.edu.vn/wp-content/uploads/2022/06/SAT-03.jpg",
        external: programCards[1]?.external,
      },
      {
        title: "IELTS JUNIORS",
        description: "Luyện thi KET, PET, FCE, IELTS dành cho học viên từ 9 - 14 tuổi",
        href: programCards[2]?.href ?? "/khoa-hoc/luyen-thi-ielts-juniors/",
        image:
          programCards[2]?.image ??
          "https://etest.edu.vn/wp-content/uploads/2022/06/IELTS-JUNIORS.jpg",
        external: programCards[2]?.external,
      },
      {
        title: "SĂN HỌC BỔNG AMP",
        description: "Định vị hồ sơ và chiến lược săn học bổng cho học sinh 16 - 18 tuổi",
        href: programCards[3]?.href ?? "/khoa-hoc/chuong-trinh-amp/",
        image: programCards[3]?.image ?? "https://etest.edu.vn/wp-content/uploads/2022/06/amp.jpg",
        external: programCards[3]?.external,
      },
      {
        title: "LUYỆN THI AP",
        description: "Bồi dưỡng năng lực học thuật chuyên sâu và học trước chương trình AP",
        href: programCards[4]?.href ?? "/khoa-hoc/luyen-thi-ap/",
        image: programCards[4]?.image ?? "https://etest.edu.vn/wp-content/uploads/2022/06/ap.jpg",
        external: programCards[4]?.external,
      },
      {
        title: "TƯ VẤN DU HỌC",
        description: "Đồng hành chọn trường, hoàn thiện hồ sơ và chiến lược nộp đơn",
        href: programCards[5]?.href ?? "https://duhoc-etest.edu.vn/",
        image: programCards[5]?.image ?? "https://etest.edu.vn/wp-content/uploads/2022/06/ib.jpg",
        external: programCards[5]?.external,
      },
    ],
    [],
  );

  return (
    <div id="top" className="bg-white text-[#1d2740]">
      <HeroBanner latestPosts={latestPosts} />

      <section className="px-6 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold uppercase text-[#9c1619] sm:text-3xl lg:text-4xl mb-12">
            TRUNG TÂM ANH NGỮ DU HỌC ETEST
          </h2>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6 text-base leading-relaxed text-gray-700">
              <p>
                Với khát vọng đưa thế hệ trẻ Việt Nam đến nền giáo dục tiên tiến của thế
                giới, Anh Ngữ Du Học ETEST luôn đặt sứ mệnh xây dựng và phát triển lộ
                trình cá nhân hóa cho từng học viên phát huy hết khả năng của mình.
              </p>
              <p>
                ETEST đứng đầu trong lĩnh vực đào tạo tiếng Anh chuyên sâu và tư vấn du
                học tại thành phố Hồ Chí Minh, Đà Nẵng, Úc... ETEST cam kết cung cấp cho
                học viên chương trình toàn diện, chú trọng vào quá trình phát triển và
                thành công của từng học viên. Các khóa học được đảm nhiệm bởi các giảng
                viên có kinh nghiệm lâu năm trong lĩnh vực giáo dục trực tiếp giảng dạy và
                cố vấn. Tại ETEST, chúng tôi hướng đến đào tạo mỗi cá nhân thành một tài
                năng.
              </p>
              <div className="pt-2">
                <Link
                  href="/ve-etest/"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#9c1619] px-8 text-sm font-bold text-white transition hover:bg-[#801215]"
                >
                  TÌM HIỂU THÊM
                </Link>
              </div>
            </div>

            <div className="aspect-[4/3] w-full rounded-2xl bg-[#dca450] shadow-sm"></div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold uppercase text-[#9c1619] sm:text-3xl lg:text-4xl mb-12">
            CHƯƠNG TRÌNH ĐÀO TẠO TẠI TRUNG TÂM ANH NGỮ DU HỌC ETEST
          </h2>

          <div className="grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {featuredPrograms.map((program) => (
              <div key={program.title} className="flex flex-col relative">
                <div className="h-72 w-full rounded-3xl bg-[#f8f8f8]"></div>
                <div className="relative z-10 -mt-24 flex flex-col items-center justify-center rounded-3xl bg-[#9c1619] p-8 text-center shadow-md">
                  <h3 className="text-lg font-bold uppercase text-[#dca450]">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-sm text-white/90 min-h-[40px]">
                    {program.description}
                  </p>
                  <Link
                    href={program.href}
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-white/80 px-8 text-sm font-medium text-white transition hover:bg-white/10"
                    rel={program.external ? "noreferrer" : undefined}
                    target={program.external ? "_blank" : undefined}
                  >
                    KHÁM PHÁ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-[4.5rem] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="results"
            title="THÀNH TÍCH HỌC VIÊN ETEST"
            description="ETEST tập trung vào kết quả học thuật, hành trình phát triển và chiến lược hồ sơ toàn diện thay vì chỉ nhấn vào một cột mốc điểm số."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {homeMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[24px] border border-[#efe8e1] bg-white px-7 py-8 shadow-[0_24px_60px_-52px_rgba(17,24,39,0.45)]"
              >
                <p className="text-5xl font-extrabold text-[#9c1619]">{metric.value}</p>
                <p className="mt-4 text-lg font-bold uppercase tracking-[0.03em] text-[#9c1619]">
                  {metric.label}
                </p>
                <p className="mt-4 text-base leading-8 text-[#26334e]/78">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {resultStories.map((story) => (
              <Link
                key={story.title}
                href={story.href}
                className="group rounded-[24px] border border-[#efe8e1] bg-white p-7 shadow-[0_24px_60px_-52px_rgba(17,24,39,0.45)]"
              >
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#dbb26a]">
                  {story.subtitle}
                </p>
                <h3 className="mt-4 text-2xl font-extrabold uppercase leading-[1.2] text-[#9c1619]">
                  {story.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-[#26334e]/80">{story.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {story.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full bg-[#f8f4ee] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9c1619]"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.04em] text-[#9c1619]">
                  Xem thêm
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] px-6 py-[4.5rem] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="news"
            title="KIẾN THỨC MỚI NHẤT"
            description="Những bài viết nổi bật từ ETEST được đưa vào layout mới để trang chủ vẫn cập nhật đều mà không mất ngôn ngữ giao diện đồng nhất."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {latestPosts.slice(0, 4).map((post) => (
              <Link
                key={post.path}
                href={post.path}
                className="group overflow-hidden rounded-[24px] border border-[#efe8e1] bg-white shadow-[0_24px_60px_-52px_rgba(17,24,39,0.45)]"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[#f4efe8]">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f8f4ee] text-[#9c1619]">
                      <span className="text-sm font-bold uppercase tracking-[0.24em]">ETEST</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9c1619]">
                    <CalendarDays className="size-4" />
                    {formatDate(post.updatedAt)}
                  </div>
                  <h3 className="mt-4 line-clamp-3 text-xl font-extrabold uppercase leading-[1.35] text-[#9c1619]">
                    {post.title}
                  </h3>
                  <p className="mt-4 line-clamp-4 text-base leading-8 text-[#26334e]/78">
                    {post.description}
                  </p>
                  <span className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-[#9c1619] px-7 text-sm font-bold uppercase tracking-[0.03em] text-[#9c1619] transition group-hover:bg-[#9c1619]/5">
                    Đọc bài viết
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-[4.5rem] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="HÌNH ẢNH HOẠT ĐỘNG"
            description="Không gian workshop, lớp học và các hoạt động đồng hành được giữ lại để trang chủ vẫn mang cảm giác cộng đồng và học thuật như website gốc."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {galleryImages.slice(0, 8).map((image) => (
              <div
                key={image.src}
                className="overflow-hidden rounded-[24px] bg-[#f5efe8] shadow-[0_24px_60px_-52px_rgba(17,24,39,0.45)]"
              >
                <img src={image.src} alt={image.alt} className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] px-6 py-[4.5rem] sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            title="ĐỐI TÁC CỦA CHÚNG TÔI"
            description="Danh sách đối tác học thuật và trường đại học được trình bày gọn hơn nhưng vẫn giữ cảm giác sang, sáng và đúng tông nhận diện ETEST."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {partnerLogos.slice(0, 12).map((logo) => (
              <div
                key={logo.name}
                className="flex min-h-40 items-center justify-center rounded-[24px] border border-[#efe8e1] bg-white p-6 shadow-[0_24px_60px_-52px_rgba(17,24,39,0.45)]"
              >
                <img src={logo.src} alt={logo.name} className="max-h-24 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-[4.5rem] sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[32px] bg-[#9c1619] p-8 text-white shadow-[0_30px_80px_-48px_rgba(156,22,25,0.55)] sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#f3dc80]">
              Đăng kí tư vấn
            </p>
            <h2 className="mt-5 text-balance text-3xl font-extrabold uppercase leading-[1.18] sm:text-4xl">
              Nhận thông tin mới nhất và lộ trình học phù hợp từ ETEST
            </h2>
            <p className="mt-5 text-base leading-8 text-white/85">
              Vui lòng để lại thông tin để đội ngũ ETEST có thể tư vấn rõ hơn chương trình
              học phù hợp với mục tiêu IELTS, Digital SAT, săn học bổng hoặc du học của bạn.
            </p>

            <div className="mt-8 space-y-4">
              {campusContacts.map((campus) => (
                <div
                  key={campus.campus}
                  className="rounded-[22px] border border-white/14 bg-white/8 px-5 py-5 backdrop-blur"
                >
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f3dc80]">
                    {campus.campus}
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/84">{campus.address}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                    <a href={`tel:${campus.phone.replace(/\s+/g, "")}`}>{campus.phone}</a>
                    <a
                      href={campus.href}
                      rel={campus.href.startsWith("http") ? "noreferrer" : undefined}
                      target={campus.href.startsWith("http") ? "_blank" : undefined}
                    >
                      Xem bản đồ
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <LeadCaptureForm
            pagePath="/"
            title="Đăng ký nhận tư vấn"
            description="Điền nhanh thông tin liên hệ và chương trình quan tâm, ETEST sẽ kết nối lại để hỗ trợ bạn trong thời gian sớm nhất."
            className="rounded-[32px] border border-[#efe8e1] shadow-[0_30px_80px_-54px_rgba(17,24,39,0.45)]"
          />
        </div>
      </section>
    </div>
  );
}
