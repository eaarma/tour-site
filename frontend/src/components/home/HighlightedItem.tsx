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
        <div className="card bg-base-100 shadow-xl border overflow-hidden rounded-xl lg:flex lg:flex-row sm:h-[310px] transition-shadow duration-200 group-hover:shadow-2xl">
          {/* Image */}
          <figure className="relative w-full lg:w-1/2 h-full flex-shrink-0">
            <img
              src={mainImage}
              alt={item.title || "Tour Image"}
              className="object-cover w-full h-full opacity-70 grayscale blur-[1px]"
            />
          </figure>

          {/* Content */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col">
            <div>
              <h2 className="card-title text-2xl font-bold mb-3">
                {item.title}
              </h2>

              {item.location && (
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {item.location}
                </div>
              )}

              {item.description && (
                <p className="text-gray-600 mb-6 line-clamp-4">
                  {item.description}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-wrap gap-8 ml-1 text-sm text-gray-700 mb-6 ">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {formatDuration(item.timeRequired)}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {item.participants}
              </div>
              {item.language && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  {item.language}
                </div>
              )}
            </div>

            {/* Price + Button pinned to bottom */}
            <div className="flex items-center gap-6 self-center sm:self-end">
              <span className="text-2xl font-bold text-primary flex items-center gap-1">
                <Euro className="w-5 h-5" />
                {item.price}
              </span>

              {/* Button version — no nested link */}
              <button
                className="btn btn-primary px-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedItem;
