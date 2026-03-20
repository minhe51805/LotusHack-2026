import { NextResponse } from "next/server";
import { getCourses, saveCourse, type Course } from "@/lib/data";
import { randomUUID } from "crypto";

export async function GET() {
  const courses = await getCourses();
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = new Date().toISOString();
  const course: Course = { ...body, id: randomUUID(), createdAt: now, updatedAt: now };
  await saveCourse(course);
  return NextResponse.json(course, { status: 201 });
}
