"use client";

import React from "react";

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

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  href,
  onClick,
  showStatus = false,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
  };

  const imageUrl = item.images?.length ? item.images[0] : null;

  const CardContent = (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-base-300 bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/images/item_placeholder.jpg";
              e.currentTarget.classList.add(
                "opacity-70",
                "grayscale",
                "blur-[1px]",
              );
              e.currentTarget.classList.remove("group-hover:scale-105");
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <img
              src="/images/item_placeholder.jpg"
              alt="placeholder"
              className="w-full h-full object-cover opacity-70 grayscale blur-[1px]"
            />
          </div>
        )}

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
          <Badge className="absolute top-3 left-3 bg-card/90 text-white backdrop-blur-sm text-card-foreground border-0 shadow-sm">
            {item.type}
          </Badge>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 right-3 rounded-xl px-3 py-1.5 shadow-md backdrop-blur-md bg-white/80 border border-white/40">
          <span className="text-lg font-bold text-gray-900">
            {"\u20AC"}
            {item.price}
          </span>
          <span className="ml-1 text-xs text-gray-700">/person</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title */}
        <h3 className="font-semibold text-base leading-snug line-clamp-2 text-balance text-card-foreground">
          {item.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
              <Clock className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
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
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
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

  return (
    <div onClick={handleClick} className="h-full">
      {CardContent}
    </div>
  );
};

export default ItemCard;
