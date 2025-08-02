"use client";
import { useRouter } from "next/navigation";
import { Item } from "@/types/types";
import ItemCard from "../items/ItemCard";

interface ManagerItemListProps {
  items: Item[];
}

const ManagerItemList: React.FC<ManagerItemListProps> = ({ items }) => {
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No items found for this manager.
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => router.push(`/manager/items/${item.id}`)}
        />
      ))}
    </div>
  );
};

export default ManagerItemList;
