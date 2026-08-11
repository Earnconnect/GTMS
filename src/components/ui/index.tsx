import Link from "next/link";
import { clsx } from "@/lib/cn";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-glow hover:shadow-[0_12px_34px_-8px_rgb(13_148_136_/_0.55)] hover:brightness-[1.06] active:brightness-95 disabled:opacity-60 disabled:shadow-none",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-300",
  secondary:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300 active:bg-slate-100 disabled:opacity-60",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.01em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={clsx(baseBtn, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      className={clsx(baseBtn, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card ring-1 ring-inset ring-slate-900/[0.02]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A card with a titled header row and body. */
export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card ring-1 ring-inset ring-slate-900/[0.02]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/40 px-5 py-4">
        <div>
          <h2 className="text-[0.9rem] font-semibold tracking-[-0.01em] text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/** KPI tile: label, big value, optional icon + trend/hint. */
export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  tone?: "brand" | "emerald" | "amber" | "red" | "slate";
}) {
  const iconTones: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-brand-100/40 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
      <div className="relative flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={clsx("grid h-10 w-10 place-items-center rounded-xl shadow-inner-top ring-1 ring-inset ring-white/40", iconTones[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="font-display relative mt-3 text-[1.7rem] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      {hint && <p className="relative mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={clsx("mb-1.5 block text-sm font-medium text-slate-700", className)}
      {...props}
    />
  );
}

const badgeTones: Record<string, string> = {
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  yellow: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-brand-50 text-brand-700 ring-brand-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: keyof typeof badgeTones;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ring-1 ring-inset",
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Circular initials avatar. */
export function Avatar({ name, email, size = 36 }: { name?: string | null; email?: string; size?: number }) {
  const label = (name || email || "?").trim();
  const initials = label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-emerald-500 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      {title && <p className="text-sm font-semibold text-slate-700">{title}</p>}
      <div className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{children}</div>
    </div>
  );
}
