"use client";

import React from "react";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { TourCategory } from "@/types";

interface Props {
  selected: TourCategory[];
  onChange: (selected: TourCategory[]) => void;
}

const CategorySelector: React.FC<Props> = ({ selected, onChange }) => {
  const toggleCategory = (cat: TourCategory) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 border rounded-lg">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`px-3 py-1 rounded-full text-sm border transition 
              ${
                selected.includes(cat)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            onClick={() => toggleCategory(cat)}
          >
            {cat.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Selected:</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {cat.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
