"use client";

import { ShopDto } from "@/types/shop";
import { Store, CalendarDays, Users } from "lucide-react";

interface Props {
  shop: ShopDto;
  guideCount?: number;
  tourCount?: number;
  dateFormat?: "short" | "long"; // 24.02.2026 or 24 February 2026
}

function formatEuropeanDate(dateString: string, format: "short" | "long") {
  const date = new Date(dateString);

  if (format === "short") {
    return date.toLocaleDateString("en-GB");
    // -> 24/02/2026 (we’ll convert slashes below)
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ShopHeaderSection({
  shop,
  guideCount,
  tourCount,
  dateFormat = "long",
}: Props) {
  const formattedDateRaw = formatEuropeanDate(shop.createdAt, dateFormat);

  const formattedDate =
    dateFormat === "short"
      ? formattedDateRaw.replace(/\//g, ".")
      : formattedDateRaw;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-card text-card-foreground shadow-sm p-6 sm:p-8 space-y-6">
      {/* Title */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center size-12 rounded-xl bg-muted shrink-0">
          <Store className="size-10 mt-1 text-muted-foreground" />
        </div>

        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-balance">
            {shop.name}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>Established {formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {shop.description && (
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          {shop.description}
        </p>
      )}

      {/* Stats Row (future-proofed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-base-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Guides
            </p>
            <p className="font-semibold text-base">{guideCount ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
            <Store className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Tours available
            </p>
            <p className="font-semibold text-base">{tourCount ?? "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
            <CalendarDays className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Shop ID
            </p>
            <p className="font-semibold text-base">#{shop.id}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
