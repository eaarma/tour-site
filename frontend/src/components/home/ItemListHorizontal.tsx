"use client";

import { useRef, useState, useEffect } from "react";
import { Item } from "@/types";
import ItemCard from "../items/ItemCard";
import { ChevronLeft, ChevronRight } from "lucide-react"; // or use any icon

interface ItemListHorizontalProps {
  title: string;
  items: Item[];
  visibleCount?: number; // Number of items visible at once
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

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth
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

      <div className="relative">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByOne("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow"
          >
            <ChevronLeft />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start flex-shrink-0"
              style={{
                width: `${itemWidthPercent}%`,
              }}
            >
              <ItemCard item={item} href={`/items/${item.id}`} />{" "}
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollByOne("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow"
          >
            <ChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemListHorizontal;
