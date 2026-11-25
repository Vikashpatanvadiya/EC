"use client";

import type { ReactNode } from "react";

/**
 * Shared form primitives. Every field is a real <label> bound to its
 * input, with inline error text wired through aria-describedby.
 */

export function Field({
  label,
  name,
  error,
  hint,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <label htmlFor={name} className="micro block normal-case">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="mt-2 block min-h-12 w-full rounded-xl border border-ink/25 bg-cream px-4 text-[1rem] tracking-[-0.02em] outline-none transition-colors focus:border-ink"
        {...rest}
      />
      {hint ? (
        <p id={hintId} className="mt-1.5 text-[0.8125rem] text-ink/65">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1.5 text-[0.8125rem] font-medium text-[#8b1f1f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
  tone = "ink",
}: {
  children: ReactNode;
  pending?: boolean;
  tone?: "ink" | "light";
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={`pill w-full justify-center disabled:opacity-60 ${
        tone === "light" ? "pill--light" : ""
      }`}
    >
      {pending ? "Working…" : children}
      {pending ? null : <span aria-hidden="true">↗</span>}
    </button>
  );
}
