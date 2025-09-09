"use client";
import { useRouter } from "next/navigation";
import ItemCard from "../items/ItemCard";
import { Item } from "@/types";

interface ManagerItemListProps {
  items: Item[];
  shopId: number;
}

export default function ManagerItemList({
  items,
  shopId,
}: ManagerItemListProps) {
  const router = useRouter();

  return (
    <div className="p-4">
      {/* Add Tour Button */}
      <div className="flex justify-end mb-4">
        <button
          className="btn btn-outline btn-primary flex items-center gap-2"
          onClick={() => router.push(`/manager/shops/${shopId}/items/new`)}
        >
          <span className="text-xl">+</span> Add a Tour
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center text-gray-500 mt-6">
          No items found for this manager.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() =>
                router.push(`/manager/shops/${shopId}/items/${item.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
