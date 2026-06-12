"use client";

import { cn } from "@/lib/cn";
import { forwardRef } from "react";

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary:
        "bg-cyan-500 text-white hover:bg-cyan-600 focus-visible:ring-cyan-400 shadow-sm",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-300",
      ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-300",
      danger: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400 shadow-sm",
      outline:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300 shadow-sm",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-[12.5px] gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-2.5 text-[15px] gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-t border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-700 placeholder-slate-400",
        "focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200",
        "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
        "shadow-sm transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────────────────

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-700 placeholder-slate-400 resize-vertical min-h-[80px]",
      "focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200",
      "disabled:bg-slate-50 disabled:text-slate-400",
      "shadow-sm transition-colors",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-700",
      "focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-200",
      "disabled:bg-slate-50 disabled:text-slate-400",
      "shadow-sm transition-colors",
      className
    )}
    {...props}
  />
));
Select.displayName = "Select";

// ─── Label ────────────────────────────────────────────────────────────────────

export function Label({
  className,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-[13px] font-semibold text-slate-700 mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple" | "cyan";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-[3px] rounded-full text-[11.5px] font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-5 w-5 text-cyan-500", className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6 pt-2">
      <div>
        <h1 className="text-[22px] font-bold text-slate-800 leading-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-[13.5px] text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-14">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="h-7 w-7 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {description && <p className="mt-1 text-[13px] text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

const COLOR_ALIASES: Record<string, string> = {
  indigo: "cyan",
  green: "emerald",
  yellow: "amber",
  red: "rose",
  purple: "violet",
};

export function StatCard({
  label,
  value,
  sub,
  color = "cyan",
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}) {
  const resolvedColor = COLOR_ALIASES[color] ?? color;
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    cyan: { bg: "bg-cyan-50", text: "text-cyan-600", icon: "text-cyan-400" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-400" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-400" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", icon: "text-rose-400" },
    violet: { bg: "bg-violet-50", text: "text-violet-600", icon: "text-violet-400" },
  };
  const c = colors[resolvedColor] ?? colors.cyan;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-100/80">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className={cn("mt-1.5 text-[28px] font-bold leading-none", c.text)}>{value}</p>
          {sub && <p className="mt-1.5 text-[12px] text-slate-400">{sub}</p>}
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.bg)}>
            <span className={cn("w-5 h-5", c.icon)}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: "info" | "success" | "warning" | "danger";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    info: "bg-blue-50 text-blue-800 border-blue-100",
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
    warning: "bg-amber-50 text-amber-800 border-amber-100",
    danger: "bg-red-50 text-red-800 border-red-100",
  };

  return (
    <div
      className={cn("rounded-xl border px-4 py-3 text-[13.5px]", styles[variant], className)}
    >
      {children}
    </div>
  );
}

// ─── FormField ────────────────────────────────────────────────────────────────

export function FormField({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-[12px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
