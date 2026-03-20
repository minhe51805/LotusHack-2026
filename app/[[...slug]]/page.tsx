import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage, type HomeArticle } from "@/components/home-page";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { SourceHtml } from "@/components/source-html";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllRoutes,
  getRouteByPath,
  getStaticRouteParams,
  hasImportedRoutes,
  normalizeContentPath,
} from "@/lib/source-site";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateStaticParams() {
  return getStaticRouteParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteByPath(normalizeContentPath(slug));

  if (!route) {
    return {
      title: "Page Not Found",
    };
  }

  const description =
    route.description ||
    route.excerpt ||
    (route.kind === "home"
      ? "Anh Ngữ Du Học ETEST với các chương trình IELTS, Digital SAT, AMP và tư vấn du học được triển khai lại bằng giao diện Tailwind CSS."
      : undefined);

  return {
    title: route.kind === "home" ? "Trung tâm Anh Ngữ Du Học ETEST" : route.title,
    description,
    alternates: {
      canonical: route.path,
    },
    openGraph: {
      title: route.kind === "home" ? "Trung tâm Anh Ngữ Du Học ETEST" : route.title,
      description,
      url: route.path,
      type: route.kind === "post" ? "article" : "website",
      images: route.featuredImage ? [{ url: route.featuredImage }] : undefined,
    },
    twitter: {
      card: route.featuredImage ? "summary_large_image" : "summary",
      title: route.kind === "home" ? "Trung tâm Anh Ngữ Du Học ETEST" : route.title,
      description,
      images: route.featuredImage ? [route.featuredImage] : undefined,
    },
  };
}

function EmptyImportState() {
  return (
    <div className="mx-auto flex w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border border-primary/10 bg-white/90 shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle>No imported ETEST content yet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The Next.js shell is ready, but the local dataset has not been generated yet.
          </p>
          <p>
            Run <code className="rounded bg-muted px-1.5 py-0.5">npm run import:etest</code> to fetch
            the homepage, pages, posts, courses, shared header/footer, and source stylesheet manifest.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function getLatestPostsForHomepage(): Promise<HomeArticle[]> {
  const routes = await getAllRoutes();

  return routes
    .filter((route) => route.kind === "post")
    .sort(
      (left, right) =>
        new Date(right.updatedAt || right.publishedAt || 0).getTime() -
        new Date(left.updatedAt || left.publishedAt || 0).getTime(),
    )
    .slice(0, 4)
    .map((route) => ({
      title: route.title,
      path: route.path,
      description: route.description || route.excerpt || "Khám phá thêm nội dung mới từ ETEST.",
      featuredImage: route.featuredImage,
      updatedAt: route.updatedAt || route.publishedAt,
    }));
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const pathname = normalizeContentPath(slug);
  const route = await getRouteByPath(pathname);

  if (!route) {
    if (pathname === "/" && !(await hasImportedRoutes())) {
      return <EmptyImportState />;
    }

    notFound();
  }

  if (route.kind === "home") {
    const latestPosts = await getLatestPostsForHomepage();

    return <HomePage latestPosts={latestPosts} />;
  }

  return (
    <div className="etest-page">
      <section className="etest-page-frame">
        <div className="etest-page-surface">
          <SourceHtml
            html={route.html}
            className="etest-imported-page"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <LeadCaptureForm
          pagePath={pathname}
          title={`Cần tư vấn thêm sau khi xem ${route.title}?`}
          description="Form này đang nối trực tiếp với API nội bộ của dự án, có thể lưu local hoặc chuyển sang Supabase và Resend khi cấu hình env."
        />
      </section>
    </div>
  );
}
