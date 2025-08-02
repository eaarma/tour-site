import { Item } from "@/types/types";
import React from "react";
import ItemCard from "./ItemCard";

interface ItemListProps {
  items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No results found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
      ))}
    </div>
  );
};

export default ItemList;
