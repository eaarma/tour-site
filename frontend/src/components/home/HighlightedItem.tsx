"use client";

import { useRouter } from "next/navigation";
import { Clock, Globe, MapPin, Euro, Users } from "lucide-react";
import { formatDuration } from "@/utils/formatDuration";
import { Tour } from "@/types";

interface HighlightedItemProps {
  title: string;
  item: Tour;
}

const HighlightedItem: React.FC<HighlightedItemProps> = ({ title, item }) => {
  const router = useRouter();
  if (!item) return null;

  type ItemWithImages = {
    images?: string[];
    image?: string;
  };

  const itemData = item as ItemWithImages;

  const mainImage =
    itemData.images?.[0] || itemData.image || "/images/item_placeholder.jpg";

  const handleNavigate = () => router.push(`/items/${item.id}`);

  return (
    <div>
      <h2 className=" text-l sm:text-2xl font-bold mb-4">{title}</h2>

      <div
        className="block group cursor-pointer"
        aria-label={`View ${item.title}`}
        onClick={handleNavigate}
      >
        <div className="card bg-base-100 shadow-xl border overflow-hidden rounded-xl flex flex-col lg:flex-row lg:h-[310px] transition-shadow duration-200 group-hover:shadow-2xl">
          {/* Image */}
          <figure className="relative w-full h-40 sm:h-48 lg:w-1/2 lg:h-full flex-shrink-0">
            <img
              src={mainImage}
              alt={item.title || "Tour Image"}
              className="object-cover w-full h-full opacity-80"
            />
          </figure>

          {/* Content */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 flex flex-col">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-3">
                {item.title}
              </h2>

              {item.location && (
                <div className="flex items-center gap-2 mb-2 sm:mb-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  {item.location}
                </div>
              )}

              {item.description && (
                <p className="hidden lg:block text-gray-600 mb-6 line-clamp-4">
                  {item.description}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-700 mb-4 lg:mb-6">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-primary" />
                {formatDuration(item.timeRequired)}
              </div>

              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                {item.participants}
              </div>

              {item.language && (
                <div className="hidden sm:flex items-center gap-1">
                  <Globe className="w-4 h-4 text-primary" />
                  {item.language}
                </div>
              )}
            </div>

            {/* Price + Button pinned to bottom */}
            <div className="flex justify-between items-center mt-auto sm:self-end sm:space-x-4">
              <span className="text-xl sm:text-2xl font-bold text-primary flex items-center gap-1">
                <Euro className="w-5 h-5" />
                {item.price}
              </span>

              <button
                className="btn btn-primary btn-sm sm:btn-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedItem;
