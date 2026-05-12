"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Flame,
  Globe,
  MapPin,
  Tag,
  Users,
} from "lucide-react";

import Badge from "../common/Badge";
import HomeSectionHeading from "./HomeSectionHeading";
import { Tour } from "@/types";
import { formatDuration } from "@/utils/formatDuration";

interface HighlightedItemProps {
  title: string;
  item: Tour;
}

function formatCategory(cat: string) {
  return cat
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTypeLabel(type: string) {
  return type
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTypeBadgeClassName(type: string) {
  switch (type?.toUpperCase()) {
    case "PUBLIC":
      return "border-white/15 bg-slate-950/45 text-white/90";
    case "PRIVATE":
      return "border-white/15 bg-slate-950/40 text-white/90";
    default:
      return "border-white/15 bg-slate-950/42 text-white/90";
  }
}

function getIntensityColor(intensity: string) {
  const level = intensity?.toLowerCase();

  if (level === "easy" || level === "low") {
    return "border-success/25 bg-success/10 text-success";
  }

  if (level === "moderate" || level === "medium") {
    return "border-warning/30 bg-warning/10 text-warning";
  }

  if (level === "hard" || level === "high" || level === "extreme") {
    return "border-error/30 bg-error/10 text-error";
  }

  return "border-base-300 bg-base-200/50 text-base-content/70";
}

function formatPriceUnit(type?: string) {
  return type?.toUpperCase() === "PRIVATE" ? "/tour" : "/person";
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-200/70 text-base-content/65">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-base-content/50 font-medium tracking-wide">
          {label}
        </p>
        <div className="mt-0.5 truncate text-sm font-semibold text-base-content">
          {value}
        </div>
      </div>
    </div>
  );
}

const HighlightedItem: React.FC<HighlightedItemProps> = ({ title, item }) => {
  const router = useRouter();

  if (!item) return null;

  const placeholderPath = "/images/item_placeholder.jpg";
  const mainImage = item.images?.[0] || placeholderPath;
  const isPlaceholder = mainImage === placeholderPath;

  const priceUnit = formatPriceUnit(item.type);

  const handleNavigate = () => {
    router.push(`/items/${item.id}`);
  };

  const handleKeyboardNavigate = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <section>
      <div className="mb-6">
        <HomeSectionHeading title={title} />
      </div>

      <div
        className="group cursor-pointer"
        role="link"
        tabIndex={0}
        aria-label={`View ${item.title}`}
        onClick={handleNavigate}
        onKeyDown={handleKeyboardNavigate}
      >
        <article className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
          <div className="relative h-72 overflow-hidden bg-muted sm:h-80 lg:h-[22rem]">
            <img
              src={mainImage}
              alt={item.title || "Tour image"}
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035] ${
                isPlaceholder ? "opacity-70 grayscale blur-[1px]" : ""
              }`}
              onError={(event) => {
                event.currentTarget.src = placeholderPath;
                event.currentTarget.classList.add(
                  "opacity-70",
                  "grayscale",
                  "blur-[1px]",
                );
                event.currentTarget.classList.remove(
                  "group-hover:scale-[1.035]",
                );
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/18 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/18 via-transparent to-transparent" />

            {item.type ? (
              <Badge
                className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-md ${getTypeBadgeClassName(
                  item.type,
                )}`}
              >
                {formatTypeLabel(item.type)}
              </Badge>
            ) : null}

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
              <div className="min-w-0 text-white">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                  Featured route
                </p>

                <h3 className="mt-2 line-clamp-2 text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {item.title}
                </h3>

                {item.location ? (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                ) : null}
              </div>

              <div className="hidden shrink-0 rounded-2xl border border-white/15 bg-slate-950/55 px-4 py-3 text-right text-white shadow-sm backdrop-blur-md sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/55">
                  From
                </p>
                <div className="mt-0.5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {item.price != null ? `€${item.price}` : "—"}
                  </span>
                  <span className="text-sm text-white/70">{priceUnit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {item.description ? (
              <p className="line-clamp-2 text-sm leading-7 text-card-foreground/75">
                {item.description}
              </p>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoPill
                icon={<Clock className="size-4" />}
                label="Duration"
                value={formatDuration(item.timeRequired)}
              />

              <InfoPill
                icon={<Users className="size-4" />}
                label="Group"
                value={`Up to ${item.participants}`}
              />

              <InfoPill
                icon={<Flame className="size-4" />}
                label="Pace"
                value={
                  item.intensity ? (
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 text-[11px] font-medium ${getIntensityColor(
                        item.intensity,
                      )}`}
                    >
                      {item.intensity}
                    </Badge>
                  ) : (
                    "-"
                  )
                }
              />

              <InfoPill
                icon={<Globe className="size-4" />}
                label="Language"
                value={
                  item.language?.length
                    ? item.language.length > 2
                      ? `${item.language[0]}, ${item.language[1]} +${
                          item.language.length - 2
                        }`
                      : item.language.join(", ")
                    : "-"
                }
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {item.categories?.length ? (
                <>
                  <Tag className="size-4 text-base-content/45" />
                  {item.categories.slice(0, 3).map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {formatCategory(cat)}
                    </Badge>
                  ))}

                  {item.categories.length > 3 ? (
                    <span className="text-xs text-base-content/50">
                      +{item.categories.length - 3} more
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/70 pt-5">
              <div className="sm:hidden">
                <p className="text-xs text-base-content/55">From</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-base-content">
                    {item.price != null ? `€${item.price}` : "—"}
                  </span>
                  <span className="text-sm text-base-content/55">
                    {priceUnit}
                  </span>
                </div>
              </div>

              <div />

              <button
                type="button"
                className="btn btn-primary shrink-0 justify-end"
                onClick={(event) => {
                  event.stopPropagation();
                  handleNavigate();
                }}
              >
                Book now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default HighlightedItem;
