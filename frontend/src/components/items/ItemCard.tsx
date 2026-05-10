"use client";

import { useEffect, useState } from "react";

import { Tour } from "@/types";
import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import { Globe, Clock, MapPin, Users, Flame, Tag } from "lucide-react";
import Badge from "../common/Badge";

interface ItemCardProps {
  item: Tour;
  href?: string;
  onClick?: () => void;
  showStatus?: boolean;
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

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  ON_HOLD: "bg-amber-500",
  CANCELLED: "bg-red-500",
};

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

function getTypeBadgeClassName(type: string) {
  switch (type?.toUpperCase()) {
    case "PUBLIC":
      return "border-white/10 bg-slate-950/38 text-white/90";
    case "PRIVATE":
      return "border-white/10 bg-slate-950/30 text-white/88";
    default:
      return "border-white/10 bg-slate-950/34 text-white/88";
  }
}

const priceFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatPrice(value: number) {
  if (!Number.isFinite(value)) {
    return priceFormatter.format(0);
  }

  const hasWholeNumberPrice = Number.isInteger(value);

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasWholeNumberPrice ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ItemCard({
  item,
  href,
  onClick,
  showStatus = false,
}: ItemCardProps) {
  const isInteractive = Boolean(href || onClick);
  const imageUrl = item.images?.length ? item.images[0] : null;
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  const displayImageUrl =
    imageUrl && !hasImageError ? imageUrl : "/images/item_placeholder.jpg";
  const isUsingPlaceholderImage = !imageUrl || hasImageError;
  const priceLabel = formatPrice(item.price);

  const CardContent = (
    <div
      className={`group relative flex flex-col h-full overflow-hidden rounded-xl border border-base-300 bg-card text-card-foreground shadow-sm transition-shadow duration-300 ${
        isInteractive ? "cursor-pointer hover:shadow-md" : "cursor-default"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted shrink-0">
        <img
          src={displayImageUrl}
          alt={item.title}
          className={`h-full w-full object-cover ${
            isUsingPlaceholderImage
              ? "opacity-70 grayscale blur-[1px]"
              : "transition-transform duration-500 group-hover:scale-105"
          }`}
          onError={() => setHasImageError(true)}
        />

        {/* Status indicator */}
        {showStatus && item.status && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
            <span
              className={`size-2 rounded-full shrink-0 ${
                statusColors[item.status] || "bg-muted-foreground"
              }`}
            />
            <span className="text-xs font-medium text-card-foreground">
              {item.status.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Type badge */}
        {item.type && (
          <Badge
            className={`absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md shadow-sm ${getTypeBadgeClassName(
              item.type,
            )}`}
          >
            {formatTypeLabel(item.type)}
          </Badge>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 right-3 flex items-baseline gap-1.5 rounded-lg border border-white/10 bg-slate-800/75 px-2.5 py-2 shadow-sm backdrop-blur-md">
          <span className="text-sm font-semibold leading-none text-white">
            {priceLabel}
          </span>
          <span className="text-xs font-medium leading-none text-white/75">
            / {item.type === "PUBLIC" ? "person" : "tour"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="space-y-1.5 pb-1">
          {/* Title */}
          <h3 className="font-semibold text-base leading-snug line-clamp-2 text-balance text-card-foreground">
            {item.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate capitalize">{item.location}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
              <Clock className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/75">
                Duration
              </p>
              <p className="font-medium text-sm text-card-foreground truncate">
                {formatDuration(item.timeRequired)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/75">
                Group
              </p>
              <p className="font-medium text-sm text-card-foreground truncate">
                Up to {item.participants}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
              <Flame className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/75">
                Intensity
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 font-medium ${getIntensityColor(
                  item.intensity,
                )}`}
              >
                {item.intensity}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
              <Globe className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground/75">
                Language
              </p>
              <p className="font-medium text-sm text-card-foreground truncate">
                {Array.isArray(item.language) && item.language.length > 0
                  ? item.language.length > 2
                    ? `${item.language[0]}, ${item.language[1]} +${item.language.length - 2}`
                    : item.language.join(", ")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {item.categories && item.categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <Tag className="size-3 text-muted-foreground shrink-0" />

            {item.categories.slice(0, 3).map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="border-accent/20 bg-accent/12 px-1.5 py-0 text-[10px] font-medium text-accent shadow-none"
              >
                {formatCategory(cat)}
              </Badge>
            ))}

            {item.categories.length > 3 && (
              <span className="text-[10px] text-accent/65">
                +{item.categories.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block h-full w-full text-left">
        {CardContent}
      </button>
    );
  }

  return (
    <div className="h-full">
      {CardContent}
    </div>
  );
}
