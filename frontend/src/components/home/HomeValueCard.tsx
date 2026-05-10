"use client";

import { LucideIcon } from "lucide-react";

type HomeValueCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function HomeValueCard({
  icon: Icon,
  title,
  description,
}: HomeValueCardProps) {
  return (
    <article className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="text-xl font-semibold tracking-tight text-base-content">
          {title}
        </h3>
        <p className="text-sm leading-7 text-base-content/70">{description}</p>
      </div>
    </article>
  );
}
