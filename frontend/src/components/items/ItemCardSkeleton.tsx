"use client";

export default function ItemCardSkeleton() {
  return (
    <div className="card w-full bg-base-100 shadow-md border h-full flex flex-col rounded-xl overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200" />

      <div className="p-4 flex flex-col justify-between flex-grow">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />

        {/* Location + Language row */}
        <div className="flex justify-between items-center mb-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>

        {/* Price + Duration row */}
        <div className="flex justify-between items-center mt-auto">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
