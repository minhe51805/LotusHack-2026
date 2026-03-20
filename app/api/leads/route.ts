import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { storeLead } from "@/lib/lead";

export const runtime = "nodejs";

async function parseLeadRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  return {};
}

export async function POST(request: Request) {
  try {
    const payload = await parseLeadRequest(request);
    const result = await storeLead(payload);

    return NextResponse.json({
      ok: true,
      message: "Lead captured successfully.",
      storage: result.storage,
      emailed: result.emailed,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please check the required form fields.",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    console.error("Failed to store lead submission", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to save your request right now.",
      },
      { status: 500 },
    );
  }
}
