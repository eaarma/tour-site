"use client";

import React from "react";
import ItemCard from "./ItemCard";
import ItemCardSkeleton from "./ItemCardSkeleton";
import { Tour } from "@/types";
import { PageResponse } from "@/lib/tourService";

interface ItemListProps {
  pageData?: PageResponse<Tour>;
  loading?: boolean;
  onPageChange: (page: number) => void;
  queryString: string;
}

const SKELETON_COUNT = 8;

const ItemList: React.FC<ItemListProps> = ({
  pageData,
  loading = false,
  onPageChange,
  queryString,
}) => {
  const items = pageData?.content ?? [];

  if (!loading && items.length === 0) {
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
          : items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                href={`/items/${item.id}?${queryString}`}
              />
            ))}
      </div>

      {/* Pagination controls */}
      {pageData && pageData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-6">
          <button
            onClick={() => onPageChange(pageData.number - 1)}
            disabled={pageData.first}
            className="btn btn-sm btn-outline"
          >
            Prev
          </button>

          {Array.from({ length: pageData.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`btn btn-sm ${
                i === pageData.number
                  ? "btn-primary"
                  : "btn-outline hover:btn-primary transition-colors"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(pageData.number + 1)}
            disabled={pageData.last}
            className="btn btn-sm btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemList;
