import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const adminInputClassName =
  "w-full rounded-[1.1rem] border border-border bg-background/90 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";

export const adminTextareaClassName = `${adminInputClassName} min-h-[132px] resize-none`;
export const adminSelectClassName = `${adminInputClassName} cursor-pointer appearance-none`;

interface AdminStatProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

export function AdminStat({ label, value, detail, icon: Icon }: AdminStatProps) {
  return (
    <div className="saas-card card-lift flex min-h-36 flex-col justify-between gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {label}
        </p>
        <div className="flex size-10 items-center justify-center rounded-full border border-border/80 bg-secondary/70">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-3xl leading-none font-semibold tracking-[-0.04em] text-foreground">
          {value}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

interface AdminPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  stats?: AdminStatProps[];
  children: React.ReactNode;
  className?: string;
}

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions,
  stats,
  children,
  className,
}: AdminPageShellProps) {
  return (
    <div className={cn("flex h-full flex-col overflow-y-auto", className)}>
      <div className="page-wrap py-5">
        <div className="saas-card overflow-hidden px-6 py-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-4">
              <Badge variant="outline" className="w-fit">
                {eyebrow}
              </Badge>
              <div className="space-y-3">
                <h1 className="section-heading max-w-4xl text-foreground">
                  {title}
                </h1>
                <p className="section-copy max-w-3xl">{description}</p>
              </div>
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="page-wrap flex flex-1 flex-col gap-5 pb-6">
        {stats?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <AdminStat key={stat.label} {...stat} />
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

interface AdminSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: AdminSectionProps) {
  return (
    <section className={cn("saas-card overflow-hidden", className)}>
      <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="text-xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </p>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-3">{action}</div> : null}
      </div>
      <div className={cn("p-5 sm:p-6", contentClassName)}>{children}</div>
    </section>
  );
}

interface AdminFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function AdminField({
  label,
  hint,
  children,
  className,
}: AdminFieldProps) {
  return (
    <label className={cn("flex flex-col gap-2.5", className)}>
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? (
          <span className="block text-xs leading-5 text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-border bg-secondary/40 px-6 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-border/80 bg-card/90">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
