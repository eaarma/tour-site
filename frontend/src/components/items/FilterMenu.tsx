"use client";

import { FilterCategory, Item } from "@/types/types";
import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface FilterMenuProps {
  filters: FilterCategory[];
  items: Item[];
  onFilter: (filtered: Item[]) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  filters,
  items,
  onFilter,
}) => {
  // Initialize once here
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, Set<string>>
  >(() => {
    const initialFilters: Record<string, Set<string>> = {};
    filters.forEach((f) => {
      initialFilters[f.key] = new Set();
    });
    return initialFilters;
  });

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = new Set(prev[key]);
      if (updated.has(value)) {
        updated.delete(value);
      } else {
        updated.add(value);
      }
      return { ...prev, [key]: updated };
    });
  };

  const isSelected = (key: string, option: string) =>
    selectedFilters[key]?.has(option);

  const clearAllFilters = () => {
    const cleared: Record<string, Set<string>> = {};
    filters.forEach((f) => {
      cleared[f.key] = new Set();
    });
    setSelectedFilters(cleared);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filter</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-red-600 hover:underline"
        >
          Clear All Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <div key={filter.key} className="w-48">
            <Listbox
              value={Array.from(selectedFilters[filter.key] || [])}
              onChange={(values: string[]) => {
                setSelectedFilters((prev) => ({
                  ...prev,
                  [filter.key]: new Set(values),
                }));
              }}
              multiple
            >
              <div className="relative">
                {/* Button */}
                <Listbox.Button className="w-full rounded border px-3 py-2 text-left bg-gray-800 text-sm shadow flex justify-between items-center">
                  <span className="truncate font-semibold">{filter.label}</span>
                  <ChevronUpDownIcon className="h-4 w-4 text-gray-500 ml-2" />
                </Listbox.Button>

                {/* Options */}
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 shadow-lg border text-sm">
                  {filter.options.map((option) => (
                    <Listbox.Option
                      key={option}
                      value={option}
                      className={({ active }) =>
                        `cursor-pointer select-none relative px-4 py-2 flex items-center gap-2 ${
                          active ? "bg-blue-400" : ""
                        }`
                      }
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {isSelected(filter.key, option) && (
                          <CheckIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <span>{option}</span>
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        ))}
      </div>

      {/* Selected Filters Display */}
      <div className="mt-6 flex flex-wrap gap-4">
        {Object.entries(selectedFilters).map(([key, values]) => {
          if (!values || values.size === 0) return null;
          const filterLabel = filters.find((f) => f.key === key)?.label;
          return (
            <div key={key} className="flex flex-col">
              <h4 className="font-semibold text-gray-700">{filterLabel}</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {Array.from(values).map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                  >
                    {val}
                    <button
                      onClick={() => toggleFilter(key, val)}
                      className="ml-4 text-blue-600 hover:text-blue-900 focus:outline-none"
                      aria-label={`Remove filter ${val}`}
                      type="button"
                    >
                      &#x2715;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterMenu;
