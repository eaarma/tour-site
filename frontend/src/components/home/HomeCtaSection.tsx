"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

const DEFAULT_CTA_TITLE =
  "Ready to find the right tour or ask a question before you book?";

const DEFAULT_CTA_DESCRIPTION =
  "Keep browsing the tour catalog, or head to the contact page if you want help choosing a route, comparing options, or planning a trip.";

type HomeCtaSectionProps = {
  title?: string | null;
  description?: string | null;
};

export default function HomeCtaSection({
  title,
  description,
}: HomeCtaSectionProps) {
  const resolvedTitle = title?.trim() || DEFAULT_CTA_TITLE;
  const resolvedDescription = description?.trim() || DEFAULT_CTA_DESCRIPTION;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-base-300 bg-slate-950 px-6 py-10 text-white shadow-[0_22px_70px_rgba(15,23,42,0.20)] sm:px-8 sm:py-12 lg:px-12">
      <div className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {resolvedTitle}
          </h2>
          <p className="text-base leading-7 text-white/75">
            {resolvedDescription}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/items"
            className="btn btn-primary rounded-full border-0 px-6 text-base shadow-[0_14px_35px_rgba(2,132,199,0.28)] transition hover:-translate-y-0.5"
          >
            Browse tours
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="btn rounded-full border border-white/15 bg-white/10 px-6 text-base text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            Contact us
            <Mail className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
