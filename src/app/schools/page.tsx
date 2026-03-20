import type { Metadata } from "next";
import SchoolDirectory from "@/components/schools/school-directory";
import { getSchoolDirectory } from "@/lib/school-directory";

export const metadata: Metadata = {
  title: "Danh sách trường du học",
  description:
    "Danh sách trường du học được crawl từ ETEST, có thể lọc theo quốc gia, địa điểm, bậc học, học phí, học bổng, ngành học và điều kiện xét tuyển.",
};

export default async function SchoolsPage() {
  const items = await getSchoolDirectory();
  return <SchoolDirectory items={items} />;
}
