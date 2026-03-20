import { NextResponse } from "next/server";
import { getCourse, saveCourse, deleteCourse } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await getCourse(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
  await saveCourse(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteCourse(id);
  return NextResponse.json({ ok: true });
}
