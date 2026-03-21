"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSchoolDirectory from "@/components/schools/admin-school-directory";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { School } from "@/lib/data";
import type { SchoolDirectoryEntry } from "@/lib/school-directory";
import {
  GlobeIcon, PlusIcon, PencilIcon, Trash2Icon, ChevronRightIcon,
  DollarSignIcon, PlaneIcon, AwardIcon, BookOpenIcon,
} from "lucide-react";

const EMPTY: Omit<School, "id" | "createdAt" | "updatedAt"> = {
  name: "", country: "", overview: "",
  cost: { tuition_usd_per_year: undefined, living_usd_per_year: undefined, notes: "" },
  visa: { type: "", processing_days: undefined, success_rate: "", notes: "" },
  scholarship: { available: false, amount: "", details: "" },
  requirements: { ielts_min: undefined, toefl_min: undefined, sat_min: undefined, gpa_min: "" },
  programs: [],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const textarea = `${input} min-h-[80px] resize-none`;

function formatUSD(v?: number) {
  if (!v) return "—";
  return `$${v.toLocaleString()}`;
}

export default function SchoolsPage() {
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [directoryItems, setDirectoryItems] = useState<SchoolDirectoryEntry[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/schools");
    setItems(await res.json());
    setLoading(false);
  }

  async function loadDirectory() {
    setDirectoryLoading(true);
    const res = await fetch("/api/admin/school-directory");
    setDirectoryItems(await res.json());
    setDirectoryLoading(false);
  }

  useEffect(() => {
    load();
    loadDirectory();
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(structuredClone(EMPTY));
    setOpen(true);
  }

  function openEdit(school: School) {
    setEditing(school);
    setForm({
      name: school.name, country: school.country, overview: school.overview,
      cost: { ...school.cost },
      visa: { ...school.visa },
      scholarship: { ...school.scholarship },
      requirements: { ...school.requirements },
      programs: school.programs ?? [],
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      programs: typeof form.programs === "string"
        ? (form.programs as string).split(",").map((s: string) => s.trim()).filter(Boolean)
        : form.programs,
    };
    if (editing) {
      await fetch(`/api/admin/schools/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/schools", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    await load();
    setSaving(false);
    setOpen(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/schools/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  function set(path: string, value: unknown) {
    setForm((prev) => {
      const next = structuredClone(prev) as Record<string, unknown>;
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] as Record<string, unknown>;
      cur[keys[keys.length - 1]] = value;
      return next as typeof EMPTY;
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Trường học</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lọc trường từ dữ liệu crawl hoặc quản lý hồ sơ trường nội bộ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/data/etest-school-directory.csv"
            className="px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            Tải CSV
          </Link>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={14} /> Thêm trường
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="directory">
              <GlobeIcon size={13} className="mr-1" />
              Lọc danh mục
            </TabsTrigger>
            <TabsTrigger value="manage">
              <ChevronRightIcon size={13} className="mr-1" />
              Quản lý hồ sơ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="mt-0">
            {directoryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <AdminSchoolDirectory items={directoryItems} />
            )}
          </TabsContent>

          <TabsContent value="manage" className="mt-0">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                <GlobeIcon size={32} className="opacity-30" />
                Chưa có trường nào. Nhấn "Thêm trường" để bắt đầu.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((school) => (
                  <div key={school.id} className="rounded-xl border bg-card p-4 flex gap-4 items-start group">
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
                      {school.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={school.image_url}
                          alt={school.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <GlobeIcon size={18} className="text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{school.name}</p>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {school.country}
                        </span>
                        {school.scholarship.available && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            Học bổng
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{school.overview}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {school.cost.tuition_usd_per_year && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSignIcon size={11} /> {formatUSD(school.cost.tuition_usd_per_year)}/yr
                          </span>
                        )}
                        {school.visa.type && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <PlaneIcon size={11} /> {school.visa.type}
                          </span>
                        )}
                        {school.requirements.ielts_min && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpenIcon size={11} /> IELTS {school.requirements.ielts_min}+
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(school)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <PencilIcon size={14} className="text-muted-foreground" />
                      </button>
                      <button onClick={() => setDeleteId(school.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                        <Trash2Icon size={14} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-background rounded-xl border shadow-lg p-6 w-80">
            <p className="font-medium text-sm mb-1">Xoá trường?</p>
            <p className="text-xs text-muted-foreground mb-4">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors">Huỷ</button>
              <button onClick={() => handleDelete(deleteId)} className="px-3 py-1.5 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity">Xoá</button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-2xl flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>{editing ? "Chỉnh sửa trường" : "Thêm trường"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="basic">
              <TabsList className="mb-6">
                <TabsTrigger value="basic"><BookOpenIcon size={13} className="mr-1" />Cơ bản</TabsTrigger>
                <TabsTrigger value="cost"><DollarSignIcon size={13} className="mr-1" />Chi phí</TabsTrigger>
                <TabsTrigger value="visa"><PlaneIcon size={13} className="mr-1" />Visa</TabsTrigger>
                <TabsTrigger value="scholarship"><AwardIcon size={13} className="mr-1" />Học bổng</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tên trường *">
                    <input className={input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="University of Melbourne" />
                  </Field>
                  <Field label="Quốc gia *">
                    <input className={input} value={form.country} onChange={e => set("country", e.target.value)} placeholder="Australia" />
                  </Field>
                </div>
                <Field label="Mô tả">
                  <textarea className={textarea} rows={4} value={form.overview} onChange={e => set("overview", e.target.value)} placeholder="Giới thiệu ngắn về trường..." />
                </Field>
                <Field label="Chương trình (cách nhau bằng dấu phẩy)">
                  <input className={input} value={Array.isArray(form.programs) ? (form.programs as string[]).join(", ") : String(form.programs ?? "")} onChange={e => set("programs", e.target.value)} placeholder="Business, Engineering, Medicine" />
                </Field>
                <p className="text-xs font-medium text-muted-foreground pt-2">Yêu cầu đầu vào</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="IELTS tối thiểu">
                    <input className={input} type="number" step="0.5" value={form.requirements.ielts_min ?? ""} onChange={e => set("requirements.ielts_min", e.target.value ? Number(e.target.value) : undefined)} placeholder="6.5" />
                  </Field>
                  <Field label="TOEFL tối thiểu">
                    <input className={input} type="number" value={form.requirements.toefl_min ?? ""} onChange={e => set("requirements.toefl_min", e.target.value ? Number(e.target.value) : undefined)} placeholder="79" />
                  </Field>
                  <Field label="SAT tối thiểu">
                    <input className={input} type="number" value={form.requirements.sat_min ?? ""} onChange={e => set("requirements.sat_min", e.target.value ? Number(e.target.value) : undefined)} placeholder="1200" />
                  </Field>
                  <Field label="GPA tối thiểu">
                    <input className={input} value={form.requirements.gpa_min ?? ""} onChange={e => set("requirements.gpa_min", e.target.value)} placeholder="7.0/10" />
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="cost" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Học phí (USD/năm)">
                    <input className={input} type="number" value={form.cost.tuition_usd_per_year ?? ""} onChange={e => set("cost.tuition_usd_per_year", e.target.value ? Number(e.target.value) : undefined)} placeholder="38000" />
                  </Field>
                  <Field label="Chi phí sinh hoạt (USD/năm)">
                    <input className={input} type="number" value={form.cost.living_usd_per_year ?? ""} onChange={e => set("cost.living_usd_per_year", e.target.value ? Number(e.target.value) : undefined)} placeholder="18000" />
                  </Field>
                </div>
                <Field label="Ghi chú">
                  <textarea className={textarea} rows={4} value={form.cost.notes ?? ""} onChange={e => set("cost.notes", e.target.value)} placeholder="Chi tiết thêm về chi phí, lịch thanh toán..." />
                </Field>
              </TabsContent>

              <TabsContent value="visa" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Loại visa">
                    <input className={input} value={form.visa.type ?? ""} onChange={e => set("visa.type", e.target.value)} placeholder="Student Visa (Subclass 500)" />
                  </Field>
                  <Field label="Thời gian xử lý (ngày)">
                    <input className={input} type="number" value={form.visa.processing_days ?? ""} onChange={e => set("visa.processing_days", e.target.value ? Number(e.target.value) : undefined)} placeholder="30" />
                  </Field>
                  <Field label="Tỷ lệ phê duyệt">
                    <input className={input} value={form.visa.success_rate ?? ""} onChange={e => set("visa.success_rate", e.target.value)} placeholder="~95%" />
                  </Field>
                </div>
                <Field label="Ghi chú">
                  <textarea className={textarea} rows={4} value={form.visa.notes ?? ""} onChange={e => set("visa.notes", e.target.value)} placeholder="Hồ sơ cần thiết, lưu ý..." />
                </Field>
              </TabsContent>

              <TabsContent value="scholarship" className="space-y-4 mt-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set("scholarship.available", !form.scholarship.available)}
                    className={`relative w-10 h-6 rounded-full transition-colors ${form.scholarship.available ? "bg-primary" : "bg-muted"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.scholarship.available ? "translate-x-4" : ""}`} />
                  </button>
                  <span className="text-sm">{form.scholarship.available ? "Có học bổng" : "Không có học bổng"}</span>
                </div>
                {form.scholarship.available && (
                  <>
                    <Field label="Giá trị">
                      <input className={input} value={form.scholarship.amount ?? ""} onChange={e => set("scholarship.amount", e.target.value)} placeholder="Lên đến $30,000/năm" />
                    </Field>
                    <Field label="Chi tiết">
                      <textarea className={textarea} rows={5} value={form.scholarship.details ?? ""} onChange={e => set("scholarship.details", e.target.value)} placeholder="Tên học bổng, điều kiện, cách nộp hồ sơ..." />
                    </Field>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter>
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">Huỷ</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Thêm trường"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
