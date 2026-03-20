"use client";

import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import type { Service } from "@/lib/data";
import { SparklesIcon, PlusIcon, PencilIcon, Trash2Icon, ClockIcon } from "lucide-react";

const EMPTY = {
  name: "", description: "", details: "",
  price_vnd: "" as string | number,
  duration: "", isActive: true,
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

function formatVND(v?: number) {
  if (!v) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN").format(v) + "đ";
}

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/services");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm({ ...EMPTY });
    setOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({
      name: s.name, description: s.description,
      details: s.details ?? "",
      price_vnd: s.price_vnd ?? "",
      duration: s.duration ?? "",
      isActive: s.isActive,
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      price_vnd: form.price_vnd !== "" ? Number(form.price_vnd) : undefined,
    };
    if (editing) {
      await fetch(`/api/admin/services/${editing.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/services", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
    }
    await load();
    setSaving(false);
    setOpen(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 border-b bg-background px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Services</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage services offered to students (tư vấn, visa, luyện thi…)
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
          <PlusIcon size={14} /> Add Service
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm gap-2">
            <SparklesIcon size={32} className="opacity-30" />
            No services yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card p-4 flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <SparklesIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{s.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {s.duration && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ClockIcon size={11} /> {s.duration}
                      </span>
                    )}
                    <span className="text-xs font-medium text-foreground">{formatVND(s.price_vnd)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <PencilIcon size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
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
            <p className="font-medium text-sm mb-1">Delete service?</p>
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
            <SheetTitle>{editing ? "Edit Service" : "Add Service"}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Field label="Service Name *">
              <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Tư vấn du học" />
            </Field>
            <Field label="Short Description *">
              <textarea className={`${inp} min-h-[70px] resize-none`} rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="One-line description shown in listings..." />
            </Field>
            <Field label="Full Details">
              <textarea className={`${inp} min-h-[100px] resize-none`} rows={4} value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} placeholder="What's included, process, deliverables..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Price (VND, 0 = free)">
                <input className={inp} type="number" value={form.price_vnd} onChange={e => setForm(p => ({ ...p, price_vnd: e.target.value }))} placeholder="0" />
              </Field>
              <Field label="Duration">
                <input className={inp} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Miễn phí – trọn lộ trình" />
              </Field>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.isActive ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${form.isActive ? "translate-x-4" : ""}`} />
              </button>
              <span className="text-sm">{form.isActive ? "Active – visible to chatbot" : "Inactive – hidden from chatbot"}</span>
            </div>
          </div>

          <SheetFooter>
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
              {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
