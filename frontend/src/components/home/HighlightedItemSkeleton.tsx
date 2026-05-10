"use client";

export default function HighlightedItemSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden rounded-xl border bg-base-100 shadow-xl">
      {/* Image placeholder */}
      <div className="relative h-56 w-full bg-gray-300 sm:h-64 lg:h-[24.375rem]"></div>

      {/* Content */}
      <div className="flex h-full w-full flex-col p-6">
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
        <div className="mt-auto flex items-center gap-6 self-start">
          <div className="h-6 w-20 bg-gray-300 rounded"></div> {/* price */}
          <div className="h-10 w-28 bg-gray-300 rounded"></div> {/* button */}
        </div>
      </div>
    </div>
  );
}
