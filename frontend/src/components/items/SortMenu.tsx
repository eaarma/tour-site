"use client";

import { Listbox } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

const DEFAULT_SORT = "title,asc";

const SORT_OPTIONS = [
  { key: "title,asc", label: "A–Z (Title)" },
  { key: "title,desc", label: "Z–A (Title)" },
  { key: "price,asc", label: "Price (Low → High)" },
  { key: "price,desc", label: "Price (High → Low)" },
  { key: "timeRequired,asc", label: "Duration (Low → High)" },
  { key: "timeRequired,desc", label: "Duration (High → Low)" },
];

interface SortMenuProps {
  sortKey: string;
  onSortChange: (newSortKey: string) => void;
}

const SortMenu: React.FC<SortMenuProps> = ({ sortKey, onSortChange }) => {
  const handleChange = (key: string) => {
    onSortChange(key);
  };

  const reset = () => onSortChange(DEFAULT_SORT);

  const activeLabel =
    SORT_OPTIONS.find((o) => o.key === sortKey)?.label || "Sort";

  return (
    <div className="flex flex-col items-end gap-2 mt-4 mr-4">
      <h2 className="text-lg font-semibold mb-2">Sort</h2>

      <Listbox value={sortKey} onChange={handleChange}>
        <div className="relative w-60">
          <Listbox.Button className="w-full rounded border px-3 py-2 text-left bg-white text-sm shadow flex justify-between items-center">
            <span>{activeLabel}</span>
            <ChevronUpDownIcon className="h-4 w-4 text-neutral ml-2" />
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg border text-sm">
            {SORT_OPTIONS.map((opt) => (
              <Listbox.Option
                key={opt.key}
                value={opt.key}
                className={({ active }) =>
                  `
                    cursor-pointer select-none relative px-4 py-2 flex items-center gap-2
                    ${active ? "bg-blue-400 text-white" : ""}
                  `
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

      {sortKey !== DEFAULT_SORT && (
        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mt-2">
          Sorted by: {activeLabel}
          <button
            onClick={reset}
            className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SortMenu;
