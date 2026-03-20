/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

import type { SiteChrome } from "../lib/source-site";

type SiteHeaderProps = {
  chrome: SiteChrome;
};

type HeaderNavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

const HOME_LOGO = "https://etest.edu.vn/wp-content/uploads/2025/03/etest-logo.jpg";
const LANGUAGE_FLAG =
  "https://etest.edu.vn/wp-content/plugins/translatepress-multilingual/assets/images/flags/vi.png";

const headerNavigation: HeaderNavItem[] = [
  {
    label: "VỀ ETEST",
    href: "/ve-etest/",
    children: [
      { label: "ĐỘI NGŨ GIÁO VIÊN", href: "/doi-ngu-giao-vien/" },
      { label: "THƯ VIỆN ẢNH ETEST", href: "/thu-vien-anh-etest/" },
    ],
  },
  { label: "THÀNH TÍCH HỌC VIÊN", href: "/thanh-tich/" },
  {
    label: "KHÓA HỌC",
    href: "/khoa-hoc/",
    children: [
      { label: "KHÓA HỌC IELTS", href: "/khoa-hoc/luyen-thi-ielts/" },
      { label: "IELTS 1 KÈM 1", href: "/khoa-hoc/luyen-thi-ielts-1-kem-1/" },
      { label: "LUYỆN THI IELTS CẤP TỐC", href: "/khoa-hoc/luyen-thi-ielts-cap-toc/" },
      { label: "LUYỆN THI SAT", href: "/khoa-hoc/luyen-thi-sat/" },
      { label: "LUYỆN THI TOEFL", href: "/khoa-hoc/luyen-thi-toefl/" },
      { label: "LUYỆN THI ACT", href: "/khoa-hoc/luyen-thi-act/" },
      { label: "CHƯƠNG TRÌNH AMP", href: "/khoa-hoc/chuong-trinh-amp/" },
      { label: "LUYỆN THI IELTS JUNIORS", href: "/khoa-hoc/luyen-thi-ielts-juniors/" },
      {
        label: "LUYỆN THI CAMBRIDGE CHECKPOINT",
        href: "/khoa-hoc/luyen-thi-cambridge-checkpoint/",
      },
      { label: "LUYỆN THI AP", href: "/khoa-hoc/luyen-thi-ap/" },
      { label: "LUYỆN THI GED", href: "/khoa-hoc/luyen-thi-ged/" },
      { label: "LUYỆN THI IB", href: "/khoa-hoc/luyen-thi-ib/" },
      { label: "LUYỆN THI SSAT", href: "/khoa-hoc/luyen-thi-ssat/" },
      { label: "LUYỆN THI ISEE", href: "/khoa-hoc/luyen-thi-isee/" },
    ],
  },
  {
    label: "TƯ VẤN DU HỌC",
    href: "https://duhoc-etest.edu.vn/",
    external: true,
  },
  {
    label: "IELTS/DIGITAL SAT",
    href: "https://sat.etest.edu.vn/",
    external: true,
    children: [
      {
        label: "IELTS VOCABULARY",
        href: "https://vocab.etest.edu.vn/vi_VN/",
        external: true,
      },
      {
        label: "DIGITAL SAT",
        href: "https://sat.etest.edu.vn/",
        external: true,
      },
      {
        label: "IELTS ONLINE TEST",
        href: "https://e.testcenter.vn/e-test/",
        external: true,
      },
    ],
  },
  {
    label: "DU HỌC HÈ",
    href: "https://duhoche.duhoc-etest.edu.vn/?utm_source=google&utm_medium=etest_duhoche",
    external: true,
  },
  {
    label: "KIẾN THỨC",
    href: "/tin-tuc/",
    children: [
      { label: "TỔNG QUAN VỀ IELTS", href: "/tong-quan-ve-ielts/" },
      { label: "IELTS WRITING", href: "/ielts-writing/" },
      { label: "IELTS READING", href: "/ielts-reading/" },
      { label: "IELTS SPEAKING", href: "/ielts-speaking/" },
      { label: "IELTS LISTENING", href: "/ielts-listening/" },
      { label: "LỘ TRÌNH HỌC IELTS", href: "/lo-trinh-hoc-ielts/" },
      { label: "KINH NGHIỆM LUYỆN THI IELTS", href: "/kinh-nghiem-luyen-thi-ielts/" },
      { label: "NGỮ PHÁP IELTS", href: "/ngu-phap-ielts-grammar/" },
      { label: "TỪ VỰNG IELTS", href: "/tu-vung-ielts-vocabulary/" },
      { label: "TÀI LIỆU IELTS", href: "/tai-lieu-ielts/" },
      { label: "SAT", href: "/sat/" },
    ],
  },
  {
    label: "TUYỂN DỤNG",
    href: "/tuyen-dung/",
    children: [
      { label: "GIÁO VIÊN IELTS & SAT", href: "/giao-vien-ielts-va-digital-sat/" },
      {
        label: "CHUYÊN VIÊN TƯ VẤN TUYỂN SINH",
        href: "/chuyen-vien-tu-van-tuyen-sinh/",
      },
      { label: "TUTOR/TRỢ GIẢNG", href: "/tutor-tro-giang/" },
    ],
  },
  { label: "LIÊN HỆ", href: "/lien-he/" },
];

function HeaderNavLink({ item }: { item: HeaderNavItem }) {
  return (
    <div className="group relative">
      <Link
        href={item.href}
        className="relative flex h-10 items-center justify-center gap-1 whitespace-nowrap border-b-[3px] border-transparent px-1 text-[12.5px] font-bold leading-none uppercase tracking-[0] text-black transition-colors hover:border-[#9c1619] hover:text-[#9c1619] group-hover:border-[#9c1619] group-hover:text-[#9c1619]"
        rel={item.external ? "noreferrer" : undefined}
        target={item.external ? "_blank" : undefined}
      >
        <span>{item.label}</span>
        {item.children ? (
          <ChevronDown className="size-[13px] text-[#7b7b7b] transition-colors group-hover:text-[#9c1619]" />
        ) : null}
      </Link>

      {item.children ? (
        <div className="pointer-events-none absolute left-0 top-full z-30 pt-[2px] opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="min-w-[260px] overflow-hidden rounded-[12px] border border-[#d9dde3] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.14)]">
            <ul className="m-0 list-none p-0 py-3" style={{ listStyle: "none" }}>
            {item.children.map((child) => (
              <li key={`${child.label}-${child.href}`}>
                <Link
                  href={child.href}
                  className="block px-5 py-[9px] text-[15px] font-bold uppercase leading-[1.35] text-[#7f8897] transition-colors hover:bg-[#fafafa] hover:text-[#9c1619]"
                  rel={child.external ? "noreferrer" : undefined}
                  target={child.external ? "_blank" : undefined}
                >
                  {child.label}
                </Link>
              </li>
            ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({ chrome }: SiteHeaderProps) {
  const brandName = chrome.brandName || "Anh Ngữ Du Học ETEST";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white shadow-[0_3px_12px_rgba(0,0,0,0.05)]"
      style={{ fontFamily: 'var(--font-sans), "Open Sans", sans-serif' }}
    >
      <div className="mx-auto flex h-[120px] w-full max-w-[1600px] items-center px-8">
        <Link href="/" aria-label={brandName} className="mr-8 flex shrink-0 items-center">
          <img
            src={HOME_LOGO}
            alt={brandName}
            width={120}
            height={120}
            className="!h-[120px] w-auto object-contain"
          />
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-6 pt-8">
          <nav className="flex min-w-0 items-center self-center overflow-visible">
            <ul
              className="m-0 flex list-none flex-nowrap items-center gap-6 p-0 xl:gap-6 2xl:gap-6"
              style={{ listStyle: "none" }}
            >
              {headerNavigation.map((item) => (
                <li
                  key={`${item.label}-${item.href}`}
                  className="m-0 list-none shrink-0 p-0"
                  style={{ listStyle: "none" }}
                >
                  <HeaderNavLink item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex h-10 shrink-0 items-center gap-4 p self-center">
            <Link
              href="/en/"
              className="inline-flex h-10 min-w-[94px] items-center justify-center gap-2 border border-[#d9d9d9] bg-white px-4 text-[14px] font-semibold text-[#222] transition hover:bg-[#fafafa]"
            >
              <img src={LANGUAGE_FLAG} alt="VI" className="h-3 w-[18px]" />
              <span>VI</span>
              <ChevronDown className="size-[13px] text-[#5f5f5f]" />
            </Link>

            <a
              href="#search"
              aria-label="Tìm kiếm"
              className="inline-flex size-[34px] items-center justify-center self-center rounded-full text-white transition hover:bg-[#7f1215]"
              style={{ backgroundColor: "#9c1619" }}
            >
              <Search className="size-[16px]" strokeWidth={2.6} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
