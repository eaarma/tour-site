"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";
import { FilterCategory } from "@/types/types";
import FilterMenu from "@/components/items/FilterMenu";
import ItemList from "@/components/items/ItemList";
import { Item } from "@/types";
import { TourService } from "@/lib/tourService";

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    key: "category",
    label: "Category",
    options: ["Culture", "Food & Drink", "Adventure", "Urban", "Nature"],
  },
  {
    key: "language",
    label: "Language",
    options: ["English", "Greek", "Spanish"],
  },
  {
    key: "type",
    label: "Type",
    options: ["Tour", "Workshop", "Event"],
  },
];

export default function ItemsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const params = useSearchParams();

  // ✅ Store params in local state so we can use them after fetch finishes
  const keywordParam = params.get("keyword") || "";
  const dateParam = params.get("date") || "";

  // Fetch tours
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const tours: Item[] = await TourService.getAll();
        const mapped: Item[] = tours.map((tour) => ({
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
        }));

        setAllItems(mapped);

        // ✅ run initial search immediately after data load
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
  const handleSearch = (
    keyword: string,
    date: string,
    items: Item[] = allItems
  ) => {
    const lowerKeyword = keyword.toLowerCase();
    setSearchKeyword(lowerKeyword);
    setSearchDate(date);

    let results = items;

    if (lowerKeyword) {
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.description.toLowerCase().includes(lowerKeyword) ||
          item.location.toLowerCase().includes(lowerKeyword)
      );
    }

    // 🔹 date filtering could be added here
    setFilteredItems(results);
  };

  // Filter handler
  const handleFilter = (filteredByFilterMenu: Item[]) => {
    let results = filteredByFilterMenu;
    if (searchKeyword) {
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(searchKeyword) ||
          item.description.toLowerCase().includes(searchKeyword)
      );
    }
    setFilteredItems(results);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6 mt-5">
        <SearchBar
          onSearch={handleSearch}
          initialKeywords={keywordParam}
          initialDate={dateParam}
        />
        <FilterMenu
          filters={FILTER_CATEGORIES}
          items={allItems}
          onFilter={handleFilter}
        />
        <ItemList items={filteredItems} />
      </div>
    </main>
  );
}
