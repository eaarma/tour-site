"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Item } from "@/types";
import { Clock, Globe, MapPin, Euro, Users } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";

interface HighlightedItemProps {
  items: Item[];
}

const HighlightedItem: React.FC<HighlightedItemProps> = ({ items }) => {
  const [highlighted, setHighlighted] = useState<Item | null>(null);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const pickRandomTour = () => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setHighlighted(items[randomIndex]);
    };

    pickRandomTour(); // Initial pick
    const interval = setInterval(pickRandomTour, 30000); // Every 30s

    return () => clearInterval(interval);
  }, [items]);

  if (!highlighted) return null;

  return (
    <div className="card bg-base-100 shadow-xl border overflow-hidden rounded-xl lg:flex lg:flex-row">
      {/* Image (locked half) */}
      <figure className="relative w-full lg:w-1/2 h-64 lg:h-auto min-h-[300px] flex-shrink-0">
        <Image
          src={
            highlighted.image && highlighted.image.startsWith("http")
              ? highlighted.image
              : "/images/default.jpg"
          }
          alt={highlighted.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </figure>

      {/* Content (locked half) */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col h-full">
        {/* Title, location, description */}
        <div>
          <h2 className="card-title text-2xl font-bold mb-3">
            {highlighted.title}
          </h2>

          {highlighted.location && (
            <div className="flex items-center gap-2 mb-3 ml-1">
              <MapPin className="w-4 h-4 text-primary" />
              {highlighted.location}
            </div>
          )}

          {highlighted.description && (
            <p className="text-gray-600 mb-6 line-clamp-4">
              {highlighted.description}
            </p>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-8 ml-1 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            {formatDuration(highlighted.timeRequired)}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {highlighted.participants}
          </div>
          {highlighted.language && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              {highlighted.language}
            </div>
          )}
        </div>

        {/* Price + CTA (below details) */}
        <div className="flex items-center gap-6 mt-auto self-start lg:self-end">
          <span className="text-2xl font-bold text-primary flex items-center gap-1">
            <Euro className="w-5 h-5" />
            {highlighted.price}
          </span>
          <Link
            href={`/items/${highlighted.id}`}
            className="btn btn-primary px-6"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HighlightedItem;
