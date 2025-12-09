"use client";

import { Tour } from "@/types";
import { formatDuration } from "@/utils/formatDuration";
import Link from "next/link";
import { Globe, Clock, Euro, MapPin } from "lucide-react";

interface ItemCardProps {
  item: Tour;
  href?: string;
  onClick?: () => void;
  showStatus?: boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500",
  ON_HOLD: "bg-yellow-500",
  CANCELLED: "bg-red-500",
};

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
    if (href) {
      // let Link handle; do not navigate here
      return;
    }
  };

  const CardContent = (
    <div className="card w-full bg-base-100 shadow-md hover:shadow-lg transition duration-300 border cursor-pointer flex flex-col rounded-xl overflow-hidden">
      {/* Image */}
      <figure className="relative w-full h-52 md:h-48 lg:h-48 flex-shrink-0">
        <img
          src={
            item.images?.length
              ? item.images[0]
              : "/images/item_placeholder.jpg"
          }
          alt={item.title}
          className={`w-full h-full object-cover ${
            item.images?.length ? "" : "opacity-70 grayscale blur-[1px]"
          }`}
          onError={(e) => {
            e.currentTarget.src = "/images/item_placeholder.jpg";
            e.currentTarget.classList.add(
              "opacity-70",
              "grayscale",
              "blur-[1px]"
            );
          }}
        />

        {showStatus && item.status && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                statusColors[item.status] || "bg-gray-400"
              }`}
            ></span>
            <span className="px-2 py-0.5 text-xs rounded bg-white shadow">
              {item.status}
            </span>
          </div>
        )}
      </figure>

      {/* Content */}
      <div className="card-body p-4 flex flex-col flex-1 min-h-[160px] justify-between">
        {/* Title */}
        <h2 className="card-title text-base font-semibold line-clamp-2 leading-snug">
          {item.title}
        </h2>

        {/* Language + Location */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span className="flex items-center gap-1 truncate">
            <MapPin size={14} className="text-gray-400" />
            {item.location}
          </span>

          <span className="flex items-center gap-1 truncate">
            <Globe size={14} className="text-gray-400" />

            {Array.isArray(item.language) && item.language.length > 0 ? (
              (() => {
                const langs = item.language;
                const display =
                  langs.length > 2
                    ? `${langs[0]}, ${langs[1]} +${langs.length - 2}`
                    : langs.join(", ");

                return <span>{display}</span>;
              })()
            ) : (
              <span>-</span>
            )}
          </span>
        </div>

        {/* Price + duration */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary flex items-center gap-1">
            <Euro className="w-4 h-4" />
            {item.price}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={14} className="text-gray-500" />
            {formatDuration(item.timeRequired)}
          </span>
        </div>
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

  // Otherwise clickable div (manager list)
  return (
    <div onClick={handleClick} className="h-full">
      {CardContent}
    </div>
  );
};

export default ItemCard;
