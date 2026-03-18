"use client";

import Link from "next/link";
import { Tour } from "@/types";
import { MapPin } from "lucide-react";

interface Props {
  item: Tour;
}

export default function CategoryGridItem({ item }: Props) {
  const imageUrl = item.images?.length ? item.images[0] : null;

  return (
    <Link
      href={`/items/${item.id}`}
      className="relative group rounded-xl overflow-hidden h-44 sm:h-52 hover:-translate-y-1 transition-transform"
    >
      {/* Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        <img
          src="/images/item_placeholder.jpg"
          alt="placeholder"
          className="w-full h-full object-cover opacity-70 grayscale blur-[1px]"
        />
      )}

      {/* Gradient overlay (better than flat black) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1.5">
        {/* Title (with spacing) */}
        <h3 className="text-white font-semibold text-sm sm:text-base leading-tight line-clamp-2 ml-1">
          {item.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-white/80 text-xs sm:text-sm mb-1 ml-1">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
      </div>
    </Link>
  );
}
