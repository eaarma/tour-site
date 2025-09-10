"use client";

import { useRef, useState, useEffect } from "react";
import { Item } from "@/types";
import ItemCard from "../items/ItemCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ItemListHorizontalProps {
  title: string;
  items: Item[];
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

  const itemWidthPercent = 100 / visibleCount;

  const updateScrollButtons = () => {
    const container = containerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 1); // add a small buffer
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1
    );
  };

  useEffect(() => {
    updateScrollButtons();
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateScrollButtons);
    return () => container.removeEventListener("scroll", updateScrollButtons);
  }, []);

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
    <div className="space-y-4 my-6">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="flex items-center gap-2">
        {/* Left arrow (always reserved) */}
        <button
          onClick={() => scrollByOne("left")}
          className={`shrink-0 bg-white rounded-full p-2 shadow transition ${
            canScrollLeft
              ? "opacity-100"
              : "opacity-0 pointer-events-none invisible"
          }`}
        >
          <ChevronLeft />
        </button>

        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
          style={{ scrollbarGutter: "stable" }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start flex-shrink-0 h-full px-1"
              style={{
                width: `${itemWidthPercent}%`,
              }}
            >
              <ItemCard item={item} href={`/items/${item.id}`} />
            </div>
          ))}
        </div>

        {/* Right arrow (always reserved) */}
        <button
          onClick={() => scrollByOne("right")}
          className={`shrink-0 bg-white rounded-full p-2 shadow transition ${
            canScrollRight
              ? "opacity-100"
              : "opacity-0 pointer-events-none invisible"
          }`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ItemListHorizontal;
