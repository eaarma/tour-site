"use client";

import { ReactNode } from "react";

interface AuthPageShellProps {
  formEyebrow: string;
  formTitle: string;
  formDescription: string;
  children: ReactNode;
}

export default function AuthPageShell({
  formEyebrow,
  formTitle,
  formDescription,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,rgba(14,165,233,0.08)_0%,rgba(255,255,255,0)_24%)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <section className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="border-b border-base-300 px-6 py-8 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
              {formEyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold text-base-content">
              {formTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65">
              {formDescription}
            </p>
          </div>

          <div className="px-6 py-8 sm:px-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
