import { NextResponse } from "next/server";
import { getSchools, saveSchool, type School } from "@/lib/data";
import { randomUUID } from "crypto";

export async function GET() {
  const schools = await getSchools();
  return NextResponse.json(schools);
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = new Date().toISOString();
  const school: School = { ...body, id: randomUUID(), createdAt: now, updatedAt: now };
  await saveSchool(school);
  return NextResponse.json(school, { status: 201 });
}
