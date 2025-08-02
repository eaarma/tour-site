"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/common/SearchBar";
import HighlightedItem from "@/components/home/HighlightedItem";
import ItemListHorizontal from "@/components/home/ItemListHorizontal";
import { TourService } from "@/lib/tourService";
import { Item } from "@/types";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [allItems, setAllItems] = useState<Item[]>([]); // keep full list for filtering

  // 🔄 Fetch tours from backend
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const tours: Item[] = await TourService.getAll();

        // ✅ Map backend TourResponseDto to Item
        const mapped: Item[] = tours.map((tour) => ({
          id: tour.id,
          title: tour.title,
          description: tour.description,
          image: tour.image ?? "/images/default.jpg", // fallback if null
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

        setItems(mapped);
        setAllItems(mapped);
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, []);

  // 🔍 Search handler
  const handleSearch = (keyword: string) => {
    if (!keyword) {
      setItems(allItems);
      return;
    }

    const lowerKeyword = keyword.toLowerCase();
    const filtered = allItems.filter(
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
