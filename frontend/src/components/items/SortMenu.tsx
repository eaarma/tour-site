"use client";

import { Listbox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useEffect } from "react";
import { Item } from "@/types";

function parseDuration(timeRequired: string): number {
  if (!timeRequired) return Infinity; // handle empty values by putting them at the end

  const lower = timeRequired.toLowerCase();

  const minutesMatch = lower.match(/(\d+)\s*minute/);
  if (minutesMatch) return parseInt(minutesMatch[1], 10);

  const hoursMatch = lower.match(/(\d+)\s*hour/);
  if (hoursMatch) return parseInt(hoursMatch[1], 10) * 60;

  return Infinity; // if format doesn't match expected
}

const SORT_OPTIONS = [
  { key: "az", label: "A–Z (Title)" },
  { key: "price", label: "Price (Low → High)" },
  { key: "timeRequired", label: "Time Required (Low → High)" },
  { key: "intensity", label: "Intensity (Low → High)" },
  { key: "category", label: "Category (A–Z)" },
  { key: "type", label: "Type (A–Z)" },
  { key: "location", label: "Location (A–Z)" },
];

interface SortMenuProps {
  sortKey: string;
  setSortKey: (key: string) => void;
  items: Item[];
  onSort: (sorted: Item[]) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({
  sortKey,
  setSortKey,
  items,
  onSort,
}) => {
  // Apply sorting whenever sortKey or items change
  useEffect(() => {
    let sorted = [...items];
    switch (sortKey) {
      case "price":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "timeRequired":
        sorted.sort(
          (a, b) => (a.timeRequired ?? Infinity) - (b.timeRequired ?? Infinity)
        );
        break;
      case "intensity":
        sorted.sort((a, b) => (a.intensity ?? 0) - (b.intensity ?? 0));
        break;
      case "category":
      case "type":
      case "location":
      case "az":
      default:
        sorted.sort((a, b) =>
          (a[sortKey as keyof Item] ?? "")
            .toString()
            .localeCompare((b[sortKey as keyof Item] ?? "").toString())
        );
        break;
    }
    onSort(sorted);
  }, [sortKey, items, onSort]);

  const resetSort = () => setSortKey("az");

  return (
    <div className="flex flex-col items-end gap-2 mt-4 mr-4">
      <h2 className="text-lg font-semibold mb-2">Sort</h2>
      {/* Dropdown */}
      <Listbox value={sortKey} onChange={setSortKey}>
        <div className="relative w-60">
          <Listbox.Button className="w-full rounded border px-3 py-2 text-left bg-white text-sm shadow flex justify-between items-center">
            <span>
              {SORT_OPTIONS.find((opt) => opt.key === sortKey)?.label ?? "Sort"}
            </span>
            <ChevronUpDownIcon className="h-4 w-4 text-neutral ml-2" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border text-sm">
            {SORT_OPTIONS.map((opt) => (
              <Listbox.Option
                key={opt.key}
                value={opt.key}
                className={({ active }) =>
                  `cursor-pointer select-none relative px-4 py-2 flex items-center gap-2 ${
                    active ? "bg-blue-400 text-white" : ""
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <div className="w-4 h-4 flex items-center justify-center">
                      {selected && <CheckIcon className="h-4 w-4" />}
                    </div>
                    <span>{opt.label}</span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* "Sorted by" bubble */}
      {sortKey !== "az" && (
        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mt-2">
          Sorted by: {SORT_OPTIONS.find((opt) => opt.key === sortKey)?.label}
          <button
            onClick={resetSort}
            className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
            aria-label="Clear sorting"
            type="button"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortMenu;
