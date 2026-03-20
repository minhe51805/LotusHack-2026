import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

import "server-only";

const optionalText = z
  .union([z.string().trim(), z.undefined()])
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEmail = z
  .union([z.string().trim().email(), z.literal(""), z.undefined()])
  .transform((value) => (value ? value : undefined));

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter a valid full name."),
  phone: z.string().trim().min(8, "Please enter a valid phone number."),
  email: optionalEmail,
  interest: z.string().trim().min(2, "Please choose an interested program."),
  note: optionalText,
  pagePath: z.string().trim().min(1).default("/"),
});

export type LeadInput = z.infer<typeof leadSchema>;

type StorageMode = "supabase" | "local";

async function persistLeadLocally(lead: LeadInput) {
  const runtimeDir = path.join(process.cwd(), ".runtime");
  const localFile = path.join(runtimeDir, "leads.ndjson");

  await fs.mkdir(runtimeDir, { recursive: true });
  await fs.appendFile(
    localFile,
    `${JSON.stringify({
      ...lead,
      submittedAt: new Date().toISOString(),
    })}\n`,
    "utf8",
  );

  return "local" as StorageMode;
}

async function persistLeadInSupabase(lead: LeadInput) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return persistLeadLocally(lead);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from(process.env.SUPABASE_LEADS_TABLE || "lead_submissions").insert({
    full_name: lead.fullName,
    phone: lead.phone,
    email: lead.email ?? null,
    interest: lead.interest,
    note: lead.note ?? null,
    page_path: lead.pagePath,
    source: "next-etest-clone",
  });

  if (error) {
    throw error;
  }

  return "supabase" as StorageMode;
}

async function notifyLeadByEmail(lead: LeadInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.LEADS_NOTIFY_EMAIL;
  const fromEmail = process.env.LEADS_FROM_EMAIL;

  if (!resendApiKey || !notifyEmail || !fromEmail) {
    return false;
  }

  const resend = new Resend(resendApiKey);

  await resend.emails.send({
    from: fromEmail,
    to: [notifyEmail],
    replyTo: lead.email ? [lead.email] : undefined,
    subject: `[ETEST clone] New lead from ${lead.fullName}`,
    html: `
      <h1>New ETEST clone lead</h1>
      <p><strong>Name:</strong> ${lead.fullName}</p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <p><strong>Email:</strong> ${lead.email ?? "N/A"}</p>
      <p><strong>Interest:</strong> ${lead.interest}</p>
      <p><strong>Path:</strong> ${lead.pagePath}</p>
      <p><strong>Notes:</strong> ${lead.note ?? "N/A"}</p>
    `,
  });

  return true;
}

export async function storeLead(input: unknown) {
  const lead = leadSchema.parse(input);
  const storage = await persistLeadInSupabase(lead);

  let emailed = false;
  try {
    emailed = await notifyLeadByEmail(lead);
  } catch (error) {
    console.error("Lead email notification failed", error);
  }

  return {
    lead,
    storage,
    emailed,
  };
}
