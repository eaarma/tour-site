"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";
import { FilterCategory } from "@/types/types";
import FilterMenu from "@/components/items/FilterMenu";
import ItemList from "@/components/items/ItemList";
import { Item } from "@/types";
import { TourService } from "@/lib/tourService";
import { TourScheduleService } from "@/lib/TourScheduleService";
import SortMenu from "@/components/items/SortMenu";

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: "category",
    label: "Category",
    options: ["Culture", "History", "Adventure", "Urban", "Nature"],
  },
  {
    key: "language",
    label: "Language",
    options: [
      "English",
      "Estonian",
      "Russian",
      "German",
      "French",
      "Spanish",
      "Italian",
      "Finnish",
      "Swedish",
      "Chinese",
      "Japanese",
    ],
  },
  {
    key: "type",
    label: "Type",
    options: ["Walking", "Bus", "Boat", "Museum"],
  },
];

export default function ItemsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortedItems, setSortedItems] = useState<Item[]>([]);
  const [sortKey, setSortKey] = useState("az"); // default sorting
  const [searchDate, setSearchDate] = useState("");

  const params = useSearchParams();

  // ✅ Store params in local state so we can use them after fetch finishes
  const keywordParam = params.get("keyword") || "";
  const dateParam = params.get("date") || "";

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const tours: Item[] = await TourService.getAll();
        const mapped: Item[] = tours
          .map((tour) => ({
            id: tour.id,
            title: tour.title,
            description: tour.description,
            image: tour.image ?? "/images/default.jpg",
            price: tour.price,
            timeRequired: tour.timeRequired,
            intensity: tour.intensity,
            type: tour.type,
            status: tour.status,
            participants: tour.participants,
            category: tour.category,
            language: tour.language,
            location: tour.location,
          }))
          // ✅ Only keep ACTIVE items
          .filter((item) => item.status === "ACTIVE");

        setAllItems(mapped);

        if (keywordParam || dateParam) {
          handleSearch(keywordParam, dateParam, mapped);
        } else {
          setFilteredItems(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, [keywordParam, dateParam]);

  // Search handler
  const handleSearch = async (
    keyword: string,
    date: string,
    items: Item[] = allItems
  ) => {
    const lowerKeyword = keyword.toLowerCase();
    setSearchKeyword(lowerKeyword);
    setSearchDate(date);

    let results = items;

    // Filter by keyword first (synchronous)
    if (lowerKeyword) {
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.description.toLowerCase().includes(lowerKeyword) ||
          item.location.toLowerCase().includes(lowerKeyword)
      );
    }

    // Filter by date (async)
    if (date) {
      const filteredByDate: Item[] = [];

      await Promise.all(
        results.map(async (item) => {
          const schedules = await TourScheduleService.getByTourId(item.id);
          const hasMatchingDate = schedules.some((s) => s.date === date);
          if (hasMatchingDate) filteredByDate.push(item);
        })
      );

      results = filteredByDate;
    }

    setFilteredItems(results);
  };

  // Filter handler
  const handleFilter = useCallback(
    (filteredByFilterMenu: Item[]) => {
      let results = filteredByFilterMenu;
      if (searchKeyword) {
        results = results.filter(
          (item) =>
            item.title.toLowerCase().includes(searchKeyword) ||
            item.description.toLowerCase().includes(searchKeyword)
        );
      }
      setFilteredItems(results);
    },
    [searchKeyword]
  );

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6 mt-5">
        <SearchBar
          onSearch={handleSearch}
          initialKeywords={keywordParam}
          initialDate={dateParam}
        />
        <div className="flex justify-between items-start gap-4">
          <FilterMenu
            filters={FILTER_CATEGORIES}
            items={allItems}
            onFilter={handleFilter}
          />
          <SortMenu
            sortKey={sortKey}
            setSortKey={setSortKey}
            items={filteredItems}
            onSort={setSortedItems}
          />
        </div>
        <ItemList items={sortedItems} />
      </div>
    </main>
  );
}
