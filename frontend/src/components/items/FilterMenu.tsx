"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";

import { FilterCategory, FilterOption } from "@/types/types";

interface FilterMenuProps {
  filters: FilterCategory[];
  selected: Record<string, string[]>;
  onChange: (selection: Record<string, string[]>) => void;
}

type NormalizedFilter = {
  key: string;
  label: string;
  options: FilterOption[];
};

export default function FilterMenu({
  filters,
  selected,
  onChange,
}: FilterMenuProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedFilters = useMemo<NormalizedFilter[]>(
    () =>
      filters.map((filter) => ({
        key: filter.key,
        label: filter.label,
        options: filter.options.map((option) =>
          typeof option === "string"
            ? { label: option, value: option }
            : option,
        ),
      })),
    [filters],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenKey(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleValue = (key: string, value: string) => {
    const currentValues = new Set(selected[key] ?? []);

    if (currentValues.has(value)) {
      currentValues.delete(value);
    } else {
      currentValues.add(value);
    }

    onChange({
      ...selected,
      [key]: Array.from(currentValues),
    });
  };

  const clearFilterGroup = (key: string) => {
    onChange({
      ...selected,
      [key]: [],
    });
  };

  const clearAllFilters = () => {
    const emptySelection: Record<string, string[]> = {};

    normalizedFilters.forEach((filter) => {
      emptySelection[filter.key] = [];
    });

    onChange(emptySelection);
  };

  const activeSelections = normalizedFilters.flatMap((filter) =>
    (selected[filter.key] ?? []).map((value) => {
      const option = filter.options.find((item) => item.value === value);

      return {
        filterKey: filter.key,
        filterLabel: filter.label,
        label: option?.label ?? value,
        value,
      };
    }),
  );

  const hasFiltersApplied = activeSelections.length > 0;

  return (
    <section className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/60">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
        </div>

        {hasFiltersApplied ? (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {normalizedFilters.map((filter) => {
          const selectedValues = selected[filter.key] ?? [];
          const isOpen = openKey === filter.key;

          return (
            <div key={filter.key} className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenKey((currentKey) =>
                    currentKey === filter.key ? null : filter.key,
                  )
                }
                aria-expanded={isOpen}
                className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition ${
                  selectedValues.length > 0
                    ? "border-primary/35 bg-primary/8 text-primary"
                    : "border-base-300 text-base-content hover:border-primary/35 hover:text-primary"
                }`}
              >
                <span>{filter.label}</span>

                {selectedValues.length > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                    {selectedValues.length}
                  </span>
                ) : null}

                <ChevronDown
                  className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen ? (
                <div className="absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[min(22rem,calc(100vw-3rem))] rounded-[24px] border border-base-300 bg-white p-4 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-base-content">
                        {filter.label}
                      </p>
                      <p className="text-xs text-base-content/55">
                        Choose one or more options
                      </p>
                    </div>

                    {selectedValues.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => clearFilterGroup(filter.key)}
                        className="text-xs font-semibold uppercase tracking-[0.18em] text-primary transition hover:text-primary/80"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-2">
                    {filter.options.map((option) => {
                      const isSelected = selectedValues.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleValue(filter.key, option.value)}
                          className={`flex w-full items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition ${
                            isSelected
                              ? "border-primary/30 bg-primary/8 text-primary"
                              : "border-base-300 bg-base-100 text-base-content hover:border-primary/25 hover:bg-base-100"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : "border-base-300 bg-white text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {hasFiltersApplied ? (
        <div className="flex flex-wrap gap-2">
          {activeSelections.map((selection) => (
            <button
              key={`${selection.filterKey}-${selection.value}`}
              type="button"
              onClick={() => toggleValue(selection.filterKey, selection.value)}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/16"
            >
              <span>{selection.filterLabel}:</span>
              <span>{selection.label}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
