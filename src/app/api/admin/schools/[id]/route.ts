import { NextResponse } from "next/server";
import { getSchool, saveSchool, deleteSchool } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(school);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await getSchool(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
  await saveSchool(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteSchool(id);
  return NextResponse.json({ ok: true });
}
