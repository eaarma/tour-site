"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getBackgroundImageValue } from "./homeVisuals";
import type { TourCollectionShowcaseItem } from "./TourCollectionGrid";

type Props = {
  item: TourCollectionShowcaseItem;
};

export default function TourCollectionGridItem({ item }: Props) {
  return (
    <Link
      href={item.href}
      className="group relative block aspect-square overflow-hidden rounded-[22px] border border-base-300 bg-slate-950 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:rounded-[30px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
        style={{ backgroundImage: getBackgroundImageValue(item.imageUrl) }}
      />
      <div
        className={`absolute inset-0 ${item.accentClassName ?? "bg-gradient-to-br from-sky-500/40 via-slate-900/70 to-slate-950/90"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/30 to-white/10" />

      <div className="relative flex h-full flex-col justify-between p-3 sm:p-6">
        <span className="inline-flex w-fit rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-sm backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs sm:tracking-[0.18em]">
          {item.eyebrow}
        </span>

        <div className="space-y-2 text-white sm:space-y-3">
          <div>
            <h3 className="text-base font-semibold leading-tight tracking-tight sm:text-[1.85rem]">
              {item.title}
            </h3>
            {item.description ? (
              <p className="mt-2 line-clamp-2 max-w-sm text-[11px] leading-4 text-white/80 sm:mt-3 sm:text-sm sm:leading-6">
                {item.description}
              </p>
            ) : null}
          </div>

          <p className="hidden text-sm font-medium text-white/90 sm:block">
            {item.note}
          </p>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition group-hover:translate-x-0.5 sm:gap-2 sm:text-sm">
            Explore
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
