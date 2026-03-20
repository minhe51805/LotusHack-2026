import { NextResponse } from "next/server";
import { getService, saveService, deleteService } from "@/lib/data";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await getService(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  const updated = { ...existing, ...body, id, updatedAt: new Date().toISOString() };
  await saveService(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await deleteService(id);
  return NextResponse.json({ ok: true });
}
