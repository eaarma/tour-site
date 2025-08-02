"use client";

import SearchBar from "@/components/common/SearchBar";
import HighlightedItem from "@/components/home/HighlightedItem";
import ItemListHorizontal from "@/components/home/ItemListHorizontal";
import { Item } from "@/types/types";
import { useState } from "react";

// ✅ Example default data
const DEFAULT_ITEMS: Item[] = [
  {
    id: "1",
    title: "City Exploration Tour",
    description: "Discover the city's hidden gems",
    image: "/images/tour1.jpg",
    price: "$50",
    timeRequired: "3 hours",
    intensity: "Low",
    participants: "Up to 10",
    category: "Urban",
    language: "English",
    location: "Athens",
  },
  {
    id: "2",
    title: "Mountain Hiking",
    description: "Explore the scenic mountain trails",
    image: "/images/tour2.jpg",
    price: "$70",
    timeRequired: "6 hours",
    intensity: "High",
    participants: "Up to 8",
    category: "Adventure",
    language: "English",
    location: "Meteora",
  },
  // Add more items as needed...
];
export default function Home() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);

  // 🔍 Search handler that filters items by keyword
  const handleSearch = (keyword: string) => {
    if (!keyword) {
      setItems(DEFAULT_ITEMS);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filtered = DEFAULT_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        item.description.toLowerCase().includes(lowerKeyword)
    );

    setItems(filtered);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6">
        <SearchBar onSearch={handleSearch} />
        <ItemListHorizontal title="Available Tours" items={items} />
        <HighlightedItem items={items} />
      </div>
    </main>
  );
}
