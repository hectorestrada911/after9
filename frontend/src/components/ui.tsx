import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonOutline({
  className,
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-white border border-line px-6 py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-5", className)}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black", className)}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  className,
  valueClassName,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-line bg-white p-5", className)}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("mt-2 text-3xl font-black tracking-tighter text-black", valueClassName)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wider text-muted">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-black">{title}</h2>
      {subtitle && <p className="max-w-2xl text-base text-muted">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: {
  title: string;
  subtitle: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-line bg-offwhite p-10 text-center", className)}>
      <p className={cn("text-base font-bold text-black", titleClassName)}>{title}</p>
      <p className={cn("mt-1 text-sm text-muted", subtitleClassName)}>{subtitle}</p>
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-black placeholder:text-muted focus:border-black focus:outline-none",
        props.className,
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-black placeholder:text-muted focus:border-black focus:outline-none",
        props.className,
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-black focus:border-black focus:outline-none",
        props.className,
      )}
    />
  );
}
