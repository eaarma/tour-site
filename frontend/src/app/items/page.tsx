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
        setFilteredItems(mapped);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, []);

  // Apply query params from homepage search
  useEffect(() => {
    const keyword = params.get("keyword") || "";
    const date = params.get("date") || "";
    if (keyword || date) {
      handleSearch(keyword, date);
    }
  }, [params]);

  // Search handler
  const handleSearch = (keyword: string, date: string) => {
    setSearchKeyword(keyword.toLowerCase());
    setSearchDate(date);

    let results = allItems;

    if (keyword) {
      results = results.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.location.toLowerCase().includes(keyword)
      );
    }

    // 🔹 Later: also filter by available schedules for given date
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
      <div className="w-full space-y-6">
        <SearchBar onSearch={handleSearch} />
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
