import { NextResponse } from "next/server";
import { getSchoolDirectory } from "@/lib/school-directory";

export async function GET() {
  const schools = await getSchoolDirectory();
  return NextResponse.json(schools);
}
