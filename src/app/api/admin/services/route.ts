import { NextResponse } from "next/server";
import { getServices, saveService, type Service } from "@/lib/data";
import { randomUUID } from "crypto";

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const body = await req.json();
  const now = new Date().toISOString();
  const service: Service = { ...body, id: randomUUID(), createdAt: now, updatedAt: now };
  await saveService(service);
  return NextResponse.json(service, { status: 201 });
}
