"use client";

import React from "react";
import ItemCard from "./ItemCard";
import ItemCardSkeleton from "./ItemCardSkeleton";
import { Item } from "@/types";
import { PageResponse } from "@/lib/tourService";

interface ItemListProps {
  pageData?: PageResponse<Item>;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const SKELETON_COUNT = 8;

const ItemList: React.FC<ItemListProps> = ({
  pageData,
  loading = false,
  onPageChange,
}) => {
  if (!loading && (!pageData || pageData.content.length === 0)) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No results found. Try adjusting your search or filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Items grid */}
      <div className="grid gap-6 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
              <ItemCardSkeleton key={idx} />
            ))
          : pageData?.content.map((item) => (
              <ItemCard key={item.id} item={item} href={`/items/${item.id}`} />
            ))}
      </div>

      {/* Pagination controls */}
      {pageData && pageData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => onPageChange(pageData.number - 1)}
            disabled={pageData.first}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: pageData.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`px-3 py-1 rounded ${
                i === pageData.number ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(pageData.number + 1)}
            disabled={pageData.last}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemList;
