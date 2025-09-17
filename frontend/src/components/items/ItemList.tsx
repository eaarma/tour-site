"use client";

import React from "react";
import ItemCard from "./ItemCard";
import ItemCardSkeleton from "./ItemCardSkeleton";
import { Item } from "@/types";

interface ItemListProps {
  items?: Item[]; // make optional to handle loading
  loading?: boolean;
}

const SKELETON_COUNT = 8; // number of skeletons to display

const ItemList: React.FC<ItemListProps> = ({ items, loading = false }) => {
  if (!loading && items?.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No results found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {loading
        ? Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <ItemCardSkeleton key={idx} />
          ))
        : items?.map((item) => (
            <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
          ))}
    </div>
  );
};

export default ItemList;
