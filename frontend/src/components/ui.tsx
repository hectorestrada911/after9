import { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark disabled:opacity-60",
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
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-4 shadow-soft", className)}>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none",
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
        "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none",
        props.className,
      )}
    />
  );
}
