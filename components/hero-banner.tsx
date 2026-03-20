import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { EtestRouteRecord } from "../lib/source-site";

type Slide = {
  badge: string;
  title: string;
  description: string;
  href: string;
  image: string;
  external?: boolean;
};

interface HeroBannerProps {
  latestPosts: EtestRouteRecord[];
}

export function HeroBanner({ latestPosts }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const carouselSlides: Slide[] = [
    {
      badge: "Sự kiện",
      title: "Hội thảo: Lộ trình săn học bổng Mỹ cùng chuyên gia",
      description:
        "Cùng ETEST khám phá các chiến lược săn học bổng hàng đầu từ các trường đại học Mỹ danh tiếng.",
      href: "https://event.etest.edu.vn/workshopharvard2103?utm_source=Web&utm_medium=HocbongMy&utm_campaign=Harvard",
      image: "https://etest.edu.vn/wp-content/uploads/2026/03/z7605229911687_54553423844166fa3e9a3b4be6caa2b6.jpg",
      external: true,
    },
    {
      badge: "Tin tức",
      title: "Digital SAT: Cập nhật cấu trúc đề thi mới nhất 2024",
      description: "Tìm hiểu những thay đổi quan trọng và cách ôn luyện hiệu quả cho kỳ thi Digital SAT.",
      href: "https://digitalsat.etest.edu.vn/?utm_source=Website&utm_medium=PC",
      image: "https://etest.edu.vn/wp-content/uploads/2026/01/khanh-nam-website-2048x930.jpg",
      external: true,
    },
    {
      badge: "Khóa học",
      title: "Đăng ký học IELTS cùng chuyên gia",
      description:
        "Chương trình luyện thi IELTS chuyên sâu, cam kết đầu ra, giảng viên giàu kinh nghiệm.",
      href: "/khoa-hoc/luyen-thi-ielts/",
      image: "https://etest.edu.vn/wp-content/uploads/2019/12/testprep_new.jpg",
    },
  ];

  if (latestPosts && latestPosts.length > 0) {
    const post = latestPosts[0];
    carouselSlides.push({
      badge: "Bài viết mới",
      title: post.title,
      description: post.excerpt || post.description || "",
      href: post.path,
      image: post.featuredImage || "https://etest.edu.vn/wp-content/uploads/2025/05/z6571005364232_91e6d324cd80d2a324f90cb0dfc710ee.jpg",
    });
  } else {
    carouselSlides.push({
      badge: "Workshop ETEST",
      title: "Sẵn sàng cho hành trình IELTS, SAT và săn học bổng cùng ETEST",
      description:
        "Giao diện mới giữ đúng tinh thần thương hiệu: sáng, rõ, tập trung vào những khối nội dung quan trọng nhất.",
      href: "/thanh-tich/",
      image: "https://etest.edu.vn/wp-content/uploads/2025/05/z6571005364232_91e6d324cd80d2a324f90cb0dfc710ee.jpg",
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselSlides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [carouselSlides.length]);

  return (
    <section className="bg-white">
      <div className="relative isolate h-[700px] overflow-hidden bg-white sm:h-[800px] lg:h-[900px] mt-[100px]">
        {carouselSlides.map((slide, index) => (
          <div
            key={`${slide.title}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-2 z-20">
          {carouselSlides.map((slide, index) => (
            <button
              key={`${slide.title}-dot-${index}`}
              type="button"
              aria-label={`Chuyển tới slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === activeSlide ? "w-10 bg-black/60" : "w-2.5 bg-black/20"
              }`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Slide trước"
          className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-black/50 hover:text-black transition z-20 sm:left-8"
          onClick={() =>
            setActiveSlide((current) =>
              current === 0 ? carouselSlides.length - 1 : current - 1,
            )
          }
        >
          <ChevronLeft className="size-10" />
        </button>
        <button
          type="button"
          aria-label="Slide kế tiếp"
          className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-black/50 hover:text-black transition z-20 sm:right-8"
          onClick={() => setActiveSlide((current) => (current + 1) % carouselSlides.length)}
        >
          <ChevronRight className="size-10" />
        </button>
      </div>
    </section>
  );
}
