"use client";

export default function HighlightedItemSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl border overflow-hidden rounded-xl lg:flex lg:flex-row animate-pulse">
      {/* Image placeholder */}
      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto min-h-[300px] bg-gray-300"></div>

      {/* Content */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col h-full">
        {/* Title + location + description */}
        <div className="space-y-3 mb-6">
          <div className="h-7 w-2/3 bg-gray-300 rounded"></div> {/* title */}
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div> {/* location */}
          <div className="h-4 w-full bg-gray-300 rounded"></div>{" "}
          {/* desc line 1 */}
          <div className="h-4 w-5/6 bg-gray-300 rounded"></div>{" "}
          {/* desc line 2 */}
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-6 text-sm mb-6 ml-1">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-4 w-24 bg-gray-300 rounded"></div>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center gap-6 mt-auto self-start lg:self-end">
          <div className="h-6 w-20 bg-gray-300 rounded"></div> {/* price */}
          <div className="h-10 w-28 bg-gray-300 rounded"></div> {/* button */}
        </div>
      </div>
    </div>
  );
}
