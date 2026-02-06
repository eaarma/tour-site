"use client";

import { FilterCategory } from "@/types/types";
import { useState, useMemo, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface FilterMenuProps {
  filters: FilterCategory[];
  selected: Record<string, string[]>; // from URL (parent)
  onChange: (selection: Record<string, string[]>) => void; // tell parent to update URL
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  filters,
  onChange,
  selected,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, Set<string>>
  >(() => {
    const initial: Record<string, Set<string>> = {};
    filters.forEach((f) => {
      initial[f.key] = new Set();
    });
    return initial;
  });

  useEffect(() => {
    const next: Record<string, Set<string>> = {};

    filters.forEach((f) => {
      next[f.key] = new Set(selected[f.key] || []);
    });

    setSelectedFilters(next);
  }, [selected, filters]);

  const emitChange = (next: Record<string, Set<string>>) => {
    const plain: Record<string, string[]> = {};
    Object.entries(next).forEach(([k, v]) => {
      plain[k] = Array.from(v);
    });
    onChange(plain);
  };

  const toggleFilter = (key: string, value: string) => {
    setSelectedFilters((prev) => {
      const updated = new Set(prev[key]);

      if (updated.has(value)) {
        updated.delete(value);
      } else {
        updated.add(value);
      }

      const next = {
        ...prev,
        [key]: updated,
      };

      emitChange(next);
      return next;
    });
  };

  const isSelected = (key: string, option: string) =>
    selectedFilters[key]?.has(option) ?? false;

  const clearAllFilters = () => {
    const cleared: Record<string, Set<string>> = {};
    filters.forEach((f) => {
      cleared[f.key] = new Set();
    });
    setSelectedFilters(cleared);

    // also notify parent that all filters are cleared
    const emptySelection: Record<string, string[]> = {};
    filters.forEach((f) => {
      emptySelection[f.key] = [];
    });
    onChange(emptySelection);
  };

  // ✅ Check if any filter is applied
  const hasFiltersApplied = useMemo(() => {
    return Object.values(selectedFilters).some((set) => set.size > 0);
  }, [selectedFilters]);

  return (
    <div className="w-full px-2 sm:px-4 mt-4">
      <h2 className="text-lg font-semibold mb-4">Filter</h2>

      {/* Dropdown filters */}
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:flex-nowrap">
        {filters.map((filter) => (
          <div key={filter.key} className="w-full sm:w-48">
            <Listbox
              value={Array.from(selectedFilters[filter.key] || [])}
              onChange={(values: string[]) => {
                setSelectedFilters((prev) => {
                  const next = {
                    ...prev,
                    [filter.key]: new Set(values),
                  };
                  emitChange(next);
                  return next;
                });
              }}
              multiple
            >
              <div className="relative">
                <Listbox.Button className="w-full rounded border px-3 py-2 text-left bg-base-100 text-sm shadow flex justify-between items-center">
                  <span className="truncate font-semibold">{filter.label}</span>
                  <ChevronUpDownIcon className="h-4 w-4 text-neutral ml-2" />
                </Listbox.Button>

                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-base-100 text-neutral shadow-lg border text-sm">
                  {filter.options.map((opt) => {
                    const label = typeof opt === "string" ? opt : opt.label;
                    const value = typeof opt === "string" ? opt : opt.value;

                    return (
                      <Listbox.Option
                        key={value}
                        value={value}
                        className={({ active }) =>
                          `cursor-pointer select-none relative px-4 py-2 flex items-center gap-2 ${
                            active ? "bg-blue-400" : ""
                          }`
                        }
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          {isSelected(filter.key, value) && (
                            <CheckIcon className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <span>{label}</span>
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        ))}
      </div>

      {/* Selected filters + Clear button */}
      {hasFiltersApplied && (
        <div className="mt-6 flex flex-wrap items-center gap-4">
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
                        className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
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

          <button
            onClick={clearAllFilters}
            className="ml-2 mt-7 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
