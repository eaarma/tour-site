"use client";

import { useState, useEffect } from "react";
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

  // 🔹 Fetch tours on mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const tours: Item[] = await TourService.getAll();

        // ✅ Map backend TourResponseDto to Item
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
        setFilteredItems(mapped); // start with all
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, []);

  // 🔎 Search handler
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword.toLowerCase());
  };

  // 🔎 Filter handler
  const handleFilter = (filteredByFilterMenu: Item[]) => {
    if (searchKeyword) {
      const searchFiltered = filteredByFilterMenu.filter(
        (item) =>
          item.title.toLowerCase().includes(searchKeyword) ||
          item.description.toLowerCase().includes(searchKeyword)
      );
      setFilteredItems(searchFiltered);
    } else {
      setFilteredItems(filteredByFilterMenu);
    }
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
