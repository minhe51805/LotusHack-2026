import { getSupabaseClient } from "./supabase";
import { DEFAULT_USER_PROMPT } from "./prompt-defaults";

export interface LeadData {
  full_name?: string;
  phone?: string;
  email?: string;
  grade_or_year?: string;
  target_exam?: string;
  target_score?: string;
  timeline_months?: number;
  study_abroad_goal?: string;
  current_english_level?: string;
  prior_experience?: string;
  main_concern?: string;
  preferred_meeting_time?: string;
  notes?: string;
}

export interface StoredMessage {
  id: string;
  role: string;
  parts: unknown[];
  createdAt?: string;
}

export interface ChatSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  lead?: LeadData | null;
}

export interface AdminSettings {
  systemPrompt: string;
}

export interface SchoolRequirements {
  ielts_min?: number;
  toefl_min?: number;
  sat_min?: number;
  gpa_min?: string;
}

export interface SchoolCost {
  tuition_usd_per_year?: number;
  living_usd_per_year?: number;
  notes?: string;
}

export interface SchoolVisa {
  type?: string;
  processing_days?: number;
  success_rate?: string;
  notes?: string;
}

export interface SchoolScholarship {
  available: boolean;
  amount?: string;
  details?: string;
}

export interface School {
  id: string;
  name: string;
  country: string;
  overview: string;
  cost: SchoolCost;
  visa: SchoolVisa;
  scholarship: SchoolScholarship;
  requirements: SchoolRequirements;
  programs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  exam: string;
  description: string;
  duration_weeks?: number;
  schedule?: string;
  price_vnd?: number;
  level?: string;
  target_score?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  details?: string;
  price_vnd?: number;
  duration?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MAPPING HELPERS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSchool(row: any): School {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    overview: row.overview ?? "",
    cost: row.cost ?? {},
    visa: row.visa ?? {},
    scholarship: row.scholarship ?? {},
    requirements: row.requirements ?? {},
    programs: row.programs ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function schoolToRow(school: School) {
  return {
    id: school.id,
    name: school.name,
    country: school.country,
    overview: school.overview,
    cost: school.cost,
    visa: school.visa,
    scholarship: school.scholarship,
    requirements: school.requirements,
    programs: school.programs ?? [],
    updated_at: school.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCourse(row: any): Course {
  return {
    id: row.id,
    name: row.name,
    exam: row.exam,
    description: row.description ?? "",
    duration_weeks: row.duration_weeks ?? undefined,
    schedule: row.schedule ?? undefined,
    price_vnd: row.price_vnd ?? undefined,
    level: row.level ?? undefined,
    target_score: row.target_score ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function courseToRow(course: Course) {
  return {
    id: course.id,
    name: course.name,
    exam: course.exam,
    description: course.description,
    duration_weeks: course.duration_weeks ?? null,
    schedule: course.schedule ?? null,
    price_vnd: course.price_vnd ?? null,
    level: course.level ?? null,
    target_score: course.target_score ?? null,
    updated_at: course.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToService(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    details: row.details ?? undefined,
    price_vnd: row.price_vnd ?? undefined,
    duration: row.duration ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function serviceToRow(service: Service) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    details: service.details ?? null,
    price_vnd: service.price_vnd ?? null,
    duration: service.duration ?? null,
    is_active: service.isActive,
    updated_at: service.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSession(row: any): ChatSession {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: row.messages ?? [],
    lead: row.lead ?? null,
  };
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function getSessions(): Promise<ChatSession[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToSession);
}

export async function getSession(id: string): Promise<ChatSession | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToSession(data);
}

export async function saveSession(session: ChatSession): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("sessions").upsert({
    id: session.id,
    messages: session.messages,
    lead: session.lead ?? null,
    updated_at: session.updatedAt,
  });
  if (error) throw error;
}

// ============================================================================
// SETTINGS
// ============================================================================

const DEFAULT_PROMPT = DEFAULT_USER_PROMPT;

export async function getSettings(): Promise<AdminSettings> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("settings")
    .select("system_prompt")
    .eq("id", 1)
    .single();
  if (error || !data) return { systemPrompt: DEFAULT_PROMPT };
  return { systemPrompt: data.system_prompt };
}

export async function saveSettings(settings: AdminSettings): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("settings").upsert({
    id: 1,
    system_prompt: settings.systemPrompt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ============================================================================
// SCHOOLS
// ============================================================================

export async function getSchools(): Promise<School[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToSchool);
}

export async function getSchool(id: string): Promise<School | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToSchool(data);
}

export async function saveSchool(school: School): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("schools").upsert(schoolToRow(school));
  if (error) throw error;
}

export async function deleteSchool(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("schools").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// COURSES
// ============================================================================

export async function getCourses(): Promise<Course[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToCourse);
}

export async function getCourse(id: string): Promise<Course | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToCourse(data);
}

export async function saveCourse(course: Course): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("courses").upsert(courseToRow(course));
  if (error) throw error;
}

export async function deleteCourse(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// SERVICES
// ============================================================================

export async function getServices(): Promise<Service[]> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToService);
}

export async function getService(id: string): Promise<Service | null> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return rowToService(data);
}

export async function saveService(service: Service): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase
    .from("services")
    .upsert(serviceToRow(service));
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// UTILITIES
// ============================================================================

/** Extract lead data from UIMessage parts */
export function extractLead(messages: StoredMessage[]): LeadData | null {
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      const p = part as Record<string, unknown>;
      if (
        p.type === "tool-save_lead" &&
        p.state === "output-available" &&
        p.input
      ) {
        return p.input as LeadData;
      }
    }
  }
  return null;
}
