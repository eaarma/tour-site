"use client";

import { useRef, useState, useEffect } from "react";
import { Tour } from "@/types";
import ItemCard from "../items/ItemCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ItemListHorizontalProps {
  title: string;
  items: Tour[];
  visibleCount?: number;
}

const ItemListHorizontal: React.FC<ItemListHorizontalProps> = ({
  title,
  items,
  visibleCount = 4,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const updateScrollButtons = () => {
    const container = containerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 1);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Update scroll buttons after mount and after images/layout are ready
    const handleResizeOrImages = () => updateScrollButtons();

    // Initial check
    handleResizeOrImages();

    // Listen to scroll
    container.addEventListener("scroll", updateScrollButtons);

    // Listen to resize (in case container size changes)
    window.addEventListener("resize", handleResizeOrImages);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", handleResizeOrImages);
    };
  }, [items]);

  const scrollByOne = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth / visibleCount;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative space-y-4 my-6">
      <h2 className=" text-l sm:text-2xl font-bold mt-15">{title}</h2>

      {/* Wrapper for scrollable area and overlay buttons */}
      <div className="relative">
        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
          style={{ scrollbarGutter: "stable" }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="
    snap-start flex-shrink-0 h-full px-1
    w-[260px] sm:w-auto
  "
              style={
                isMobile
                  ? { width: 260 }
                  : { flex: `0 0 calc((100% - ${4 * 16}px) / ${visibleCount})` }
              }
            >
              <ItemCard item={item} href={`/items/${item.id}`} />
            </div>
          ))}
        </div>

        {/* Left arrow overlay */}
        <button
          onClick={() => scrollByOne("left")}
          className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow transition ${
            canScrollLeft
              ? "opacity-100"
              : "opacity-0 pointer-events-none invisible"
          } z-10`}
        >
          <ChevronLeft />
        </button>

        {/* Right arrow overlay */}
        <button
          onClick={() => scrollByOne("right")}
          className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow transition ${
            canScrollRight
              ? "opacity-100"
              : "opacity-0 pointer-events-none invisible"
          } z-10`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ItemListHorizontal;
