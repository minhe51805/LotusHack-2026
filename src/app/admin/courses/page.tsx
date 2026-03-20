"use client";

import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import type { Course } from "@/lib/data";
import { BookOpenIcon, PlusIcon, PencilIcon, Trash2Icon, ClockIcon, TagIcon } from "lucide-react";

const EXAM_OPTIONS = ["IELTS", "TOEFL", "SAT", "ACT", "AP", "IB", "GED", "SSAT", "ISEE", "AMP", "Model UN", "Other"];
const LEVEL_OPTIONS = ["Beginner", "Elementary", "Intermediate", "Upper Intermediate", "Advanced"];

const EMPTY = {
  name: "", exam: "IELTS", description: "",
  duration_weeks: "" as string | number,
  schedule: "", price_vnd: "" as string | number,
  level: "", target_score: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const sel = `${inp} cursor-pointer`;

function formatVND(v?: number) {
  if (!v) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(v) + "đ";
}

const EXAM_COLORS: Record<string, string> = {
  IELTS: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  TOEFL: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  SAT: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  ACT: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  AMP: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400",
};

export default function CoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/courses");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setForm({
      name: c.name, exam: c.exam, description: c.description,
      duration_weeks: c.duration_weeks ?? "",
      schedule: c.schedule ?? "",
      price_vnd: c.price_vnd ?? "",
      level: c.level ?? "",
      target_score: c.target_score ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      duration_weeks: form.duration_weeks !== "" ? Number(form.duration_weeks) : undefined,
      price_vnd: form.price_vnd !== "" ? Number(form.price_vnd) : undefined,
    };
    if (editing) {
      await fetch(`/api/admin/courses/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/courses", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    await load();
    setSaving(false);
    setOpen(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Courses</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Study-abroad prep courses offered by ETEST</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <PlusIcon size={14} /> Add Course
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <BookOpenIcon size={32} className="opacity-30" />
            No courses yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="rounded-xl border bg-card p-4 flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                  <BookOpenIcon size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{c.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EXAM_COLORS[c.exam] ?? "bg-muted text-muted-foreground"}`}>
                      {c.exam}
                    </span>
                    {c.level && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c.level}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {c.duration_weeks && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ClockIcon size={11} /> {c.duration_weeks} weeks
                      </span>
                    )}
                    {c.target_score && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <TagIcon size={11} /> {c.target_score}
                      </span>
                    )}
                    <span className="text-xs font-medium text-foreground">{formatVND(c.price_vnd)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <PencilIcon size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                    <Trash2Icon size={14} className="text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-background rounded-xl border shadow-lg p-6 w-80">
            <p className="font-medium text-sm mb-1">Delete course?</p>
            <p className="text-xs text-muted-foreground mb-4">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-3 py-1.5 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{editing ? "Edit Course" : "Add Course"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Course Name *">
                <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="IELTS Intensive" />
              </Field>
              <Field label="Exam *">
                <select className={sel} value={form.exam} onChange={e => setForm(p => ({ ...p, exam: e.target.value }))}>
                  {EXAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea className={`${inp} min-h-[80px] resize-none`} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What students will learn..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration (weeks)">
                <input className={inp} type="number" value={form.duration_weeks} onChange={e => setForm(p => ({ ...p, duration_weeks: e.target.value }))} placeholder="16" />
              </Field>
              <Field label="Level">
                <select className={sel} value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  <option value="">Select level</option>
                  {LEVEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Schedule">
              <input className={inp} value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} placeholder="Tối 3 buổi/tuần (Thứ 2, 4, 6)" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Target Score">
                <input className={inp} value={form.target_score} onChange={e => setForm(p => ({ ...p, target_score: e.target.value }))} placeholder="IELTS 6.0–7.5" />
              </Field>
              <Field label="Price (VND)">
                <input className={inp} type="number" value={form.price_vnd} onChange={e => setForm(p => ({ ...p, price_vnd: e.target.value }))} placeholder="8500000" />
              </Field>
            </div>
          </div>

          <SheetFooter>
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? "Saving…" : editing ? "Save changes" : "Add course"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
