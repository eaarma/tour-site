"use client";

import { ReactNode } from "react";

interface LegalPageShellProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function LegalPageShell({
  eyebrow,
  title,
  description,
  meta,
  children,
  footer,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-16 sm:px-8 lg:px-12">
        <section className="rounded-3xl border border-base-300 bg-base-100 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            {title}
          </h1>

          {description ? (
            <div className="mt-4 text-base leading-7 text-base-content/70">
              {description}
            </div>
          ) : null}

          {meta ? (
            <div className="mt-4 text-sm text-base-content/60">{meta}</div>
          ) : null}
        </section>

        {children}

        {footer ? (
          <section className="rounded-3xl border border-base-300 bg-base-200/80 p-6 text-sm leading-6 text-base-content/70 shadow-sm">
            {footer}
          </section>
        ) : null}
      </main>
    </div>
  );
}
