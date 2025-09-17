"use client";

import ItemCardSkeleton from "../items/ItemCardSkeleton";

interface ItemListHorizontalSkeletonProps {
  visibleCount?: number;
}

const ItemListHorizontalSkeleton: React.FC<ItemListHorizontalSkeletonProps> = ({
  visibleCount = 4,
}) => {
  return (
    <div className="space-y-4 my-6 animate-pulse">
      {/* Title placeholder */}
      <div className="h-6 bg-gray-200 rounded w-40 mb-4" />

      {/* Horizontal list */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: visibleCount }).map((_, idx) => (
          <div
            key={idx}
            className="snap-start flex-shrink-0 h-full px-1"
            style={{ width: `${100 / visibleCount}%` }}
          >
            <ItemCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemListHorizontalSkeleton;
