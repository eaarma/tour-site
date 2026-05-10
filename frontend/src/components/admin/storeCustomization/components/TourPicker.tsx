"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Search, Trash2 } from "lucide-react";

import { TourService } from "@/lib/tours/tourService";
import type { Tour } from "@/types";

import IconButton from "./IconButton";

type TourLookup = Record<number, Tour>;

type TourPickerProps = {
  label: string;
  description: string;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  tourLookup: TourLookup;
  onToursHydrated: (tours: Tour[]) => void;
  allowMultiple?: boolean;
  allowReorder?: boolean;
  maxSelections?: number;
  helperText?: string;
};

export default function TourPicker({
  label,
  description,
  selectedIds,
  onChange,
  tourLookup,
  onToursHydrated,
  allowMultiple = true,
  allowReorder = false,
  maxSelections = 24,
  helperText,
}: TourPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tour[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const isNumericQuery = /^\d+$/.test(trimmedQuery);

    if (trimmedQuery.length < 2 && !isNumericQuery) {
      setResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setSearching(true);

      try {
        const [pageResult, directResult] = await Promise.all([
          trimmedQuery.length >= 2
            ? TourService.getAdminPage({
                query: trimmedQuery,
                status: "ACTIVE",
                size: 8,
              })
            : Promise.resolve({ content: [] }),
          isNumericQuery
            ? TourService.getById(Number(trimmedQuery)).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        const mergedResults = [
          ...(directResult && directResult.status === "ACTIVE"
            ? [directResult]
            : []),
          ...pageResult.content.filter((tour) => tour.status === "ACTIVE"),
        ].filter(
          (tour, index, allTours) =>
            allTours.findIndex((candidate) => candidate.id === tour.id) ===
            index,
        );

        setResults(mergedResults);
        onToursHydrated(mergedResults);
      } catch (searchError) {
        if (!cancelled) {
          console.error(searchError);
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [onToursHydrated, query]);

  const addTour = (tour: Tour) => {
    if (selectedIds.includes(tour.id)) {
      return;
    }

    if (allowMultiple) {
      onChange([...selectedIds, tour.id].slice(0, maxSelections));
      return;
    }

    onChange([tour.id]);
  };

  const removeTour = (tourId: number) => {
    onChange(selectedIds.filter((selectedId) => selectedId !== tourId));
  };

  const moveTour = (tourId: number, direction: "up" | "down") => {
    const currentIndex = selectedIds.findIndex(
      (selectedId) => selectedId === tourId,
    );

    if (currentIndex < 0) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= selectedIds.length) {
      return;
    }

    const nextIds = [...selectedIds];
    const [movedId] = nextIds.splice(currentIndex, 1);
    nextIds.splice(targetIndex, 0, movedId);
    onChange(nextIds);
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-200/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-base-content">{label}</p>
          <p className="mt-1 text-sm text-base-content/60">{description}</p>
        </div>
        <span className="badge badge-outline">
          {selectedIds.length}/{maxSelections}
        </span>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/45" />
        <input
          type="text"
          className="input input-bordered w-full pl-10"
          value={query}
          placeholder="Search by tour name or ID"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {helperText ? (
        <p className="mt-2 text-sm text-base-content/55">{helperText}</p>
      ) : null}

      {(searching || results.length > 0) && (
        <div className="mt-4 rounded-2xl border border-base-300 bg-base-100">
          <div className="border-b border-base-300 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/55">
            {searching ? "Searching..." : "Search results"}
          </div>

          <div className="divide-y divide-base-300">
            {results.map((tour) => (
              <div
                key={`search-result-${tour.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-base-content">
                    {tour.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-base-content/60">
                    #{tour.id}
                    {tour.location ? ` \u2022 ${tour.location}` : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={selectedIds.includes(tour.id)}
                  onClick={() => addTour(tour)}
                >
                  {selectedIds.includes(tour.id)
                    ? "Selected"
                    : allowMultiple
                      ? "Add"
                      : "Use tour"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {selectedIds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/55">
            No tours selected yet.
          </div>
        ) : (
          selectedIds.map((tourId, index) => {
            const selectedTour = tourLookup[tourId];

            return (
              <div
                key={`selected-tour-${tourId}-${index}`}
                className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-ghost badge-sm">
                        #{tourId}
                      </span>
                      <p className="truncate text-sm font-medium text-base-content">
                        {selectedTour?.title ?? `Tour ${tourId}`}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-xs text-base-content/60">
                      {selectedTour?.location
                        ? `${selectedTour.location} \u2022 ${selectedTour.status}`
                        : (selectedTour?.status ?? "Loading tour details...")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {allowReorder ? (
                      <>
                        <IconButton
                          label="Move up"
                          disabled={index === 0}
                          onClick={() => moveTour(tourId, "up")}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Move down"
                          disabled={index === selectedIds.length - 1}
                          onClick={() => moveTour(tourId, "down")}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </IconButton>
                      </>
                    ) : null}

                    <IconButton
                      label="Remove tour"
                      className="text-error"
                      onClick={() => removeTour(tourId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

