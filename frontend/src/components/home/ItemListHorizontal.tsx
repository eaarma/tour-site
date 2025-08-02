"use client";

import { Item } from "@/types";
import ItemCard from "../items/ItemCard";

interface ItemListHorizontalProps {
  title: string;
  items: Item[];
  visibleCount?: number; // e.g. 3 means show 3 cards in view
}

const ItemListHorizontal: React.FC<ItemListHorizontalProps> = ({
  title,
  items,
  visibleCount = 3,
}) => {
  const itemWidth = 100 / visibleCount;

  return (
    <div className="space-y-4 my-6">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="relative">
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start flex-shrink-0"
              style={{
                width: `${itemWidth}%`,
                minWidth: `${itemWidth}%`,
              }}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemListHorizontal;
