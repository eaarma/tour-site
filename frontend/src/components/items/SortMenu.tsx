"use client";

import { ArrowDownUp } from "lucide-react";

const DEFAULT_SORT = "title,asc";

const SORT_OPTIONS = [
  { key: "title,asc", label: "Name A-Z" },
  { key: "title,desc", label: "Name Z-A" },
  { key: "price,asc", label: "Price low to high" },
  { key: "price,desc", label: "Price high to low" },
  { key: "timeRequired,asc", label: "Duration low to high" },
  { key: "timeRequired,desc", label: "Duration high to low" },
];

interface SortMenuProps {
  sortKey: string;
  onSortChange: (newSortKey: string) => void;
}

export default function SortMenu({ sortKey, onSortChange }: SortMenuProps) {
  return (
    <section className="w-full sm:w-auto">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor="tour-sort"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/60"
        >
          <ArrowDownUp className="h-4 w-4 text-primary" />
          Sort
        </label>

        {sortKey !== DEFAULT_SORT ? (
          <button
            type="button"
            onClick={() => onSortChange(DEFAULT_SORT)}
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            Reset
          </button>
        ) : null}
      </div>

      <select
        id="tour-sort"
        value={sortKey}
        onChange={(event) => onSortChange(event.target.value)}
        className="select select-bordered w-full min-w-[220px] rounded-2xl border-base-300 shadow-sm focus:border-primary"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}
