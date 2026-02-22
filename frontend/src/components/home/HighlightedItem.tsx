"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Globe,
  MapPin,
  Users,
  Flame,
  Tag,
  ArrowRight,
} from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { Tour } from "@/types";
import Badge from "../common/Badge";

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

function getIntensityColor(intensity: string) {
  const level = intensity?.toLowerCase();
  if (level === "easy" || level === "low")
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
  if (level === "moderate" || level === "medium")
    return "bg-amber-500/10 text-amber-700 border-amber-500/20";
  if (level === "hard" || level === "high" || level === "extreme")
    return "bg-red-500/10 text-red-700 border-red-500/20";
  return "bg-muted text-muted-foreground";
}

const HighlightedItem: React.FC<HighlightedItemProps> = ({ title, item }) => {
  const router = useRouter();
  if (!item) return null;

  const placeholderPath = "/images/item_placeholder.jpg";

  const mainImage = item.images?.[0] || placeholderPath;

  const isPlaceholder = mainImage === placeholderPath;

  const handleNavigate = () => router.push(`/items/${item.id}`);

  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
        {title}
      </h2>

      <div
        className="group cursor-pointer"
        role="link"
        tabIndex={0}
        aria-label={`View ${item.title}`}
        onClick={handleNavigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleNavigate();
        }}
      >
        <div className="relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col lg:flex-row lg:h-[340px]">
          {/* Image section */}
          <div className="relative w-full h-52 sm:h-60 lg:w-[50%] lg:h-full shrink-0 overflow-hidden bg-muted">
            <img
              src={mainImage}
              alt={item.title || "Tour image"}
              className={`
    w-full h-full object-cover transition-transform duration-500
    group-hover:scale-105
    ${isPlaceholder ? "opacity-70 grayscale blur-[1px]" : ""}
  `}
              onError={(e) => {
                e.currentTarget.src = placeholderPath;
                e.currentTarget.classList.add(
                  "opacity-70",
                  "grayscale",
                  "blur-[1px]",
                );
                e.currentTarget.classList.remove("group-hover:scale-105");
              }}
            />

            {/* Gradient overlay on image bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none lg:hidden" />

            {/* Type badge */}
            {item.type && (
              <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-white text-card-foreground border-0 shadow-sm">
                {item.type}
              </Badge>
            )}

            {/* Price tag on image (mobile) */}
            <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm lg:hidden">
              <span className="text-lg font-bold text-card-foreground">
                {"\u20AC"}
                {item.price}
              </span>
              <span className="text-xs text-muted-foreground ml-0.5">
                /person
              </span>
            </div>
          </div>

          {/* Content section */}
          <div className="flex flex-col flex-1 p-5 sm:p-6 lg:p-8 gap-4 min-w-0">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg sm:text-2xl font-bold leading-tight text-card-foreground line-clamp-2 text-balance">
                {item.title}
              </h3>
              {item.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 lg:line-clamp-3">
                {item.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                  <Clock className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                    Duration
                  </p>
                  <p className="font-medium text-sm text-card-foreground">
                    {formatDuration(item.timeRequired)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                  <Users className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                    Group
                  </p>
                  <p className="font-medium text-sm text-card-foreground">
                    Up to {item.participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                  <Flame className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                    Intensity
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 font-medium ${getIntensityColor(item.intensity)}`}
                  >
                    {item.intensity}
                  </Badge>
                </div>
              </div>

              {item.language && item.language.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                    <Globe className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                      Language
                    </p>
                    <p className="font-medium text-sm text-card-foreground">
                      {item.language.length > 2
                        ? `${item.language[0]}, ${item.language[1]} +${item.language.length - 2}`
                        : item.language.join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Categories */}
            {item.categories && item.categories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Tag className="size-3 text-muted-foreground shrink-0" />

                {item.categories.slice(0, 3).map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 text-white"
                  >
                    {formatCategory(cat)}
                  </Badge>
                ))}

                {item.categories.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{item.categories.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Price + CTA pinned to bottom */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
              {/* Price (desktop) */}
              <div className="hidden lg:block">
                <span className="ml-1 text-xs text-muted-foreground">From</span>
                <div className="flex items-baseline gap-0.5">
                  <span className=" ml-1 text-2xl font-bold text-card-foreground">
                    {"\u20AC"}
                    {item.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/person</span>
                </div>
              </div>

              {/* Price (mobile -- smaller) */}
              <div className="lg:hidden">
                <span className="text-xs text-muted-foreground">From</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-card-foreground">
                    {"\u20AC"}
                    {item.price}
                  </span>
                  <span className="text-xs text-muted-foreground">/person</span>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-primary mt-1 px-5 py-2.5 text-white text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                Book Now
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HighlightedItem;
