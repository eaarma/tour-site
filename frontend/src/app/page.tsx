"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/common/SearchBar";
import HighlightedItem from "@/components/home/HighlightedItem";
import ItemListHorizontal from "@/components/home/ItemListHorizontal";
import { TourService } from "@/lib/tourService";
import { Tour } from "@/types";
import WelcomeImage from "@/components/home/WelcomeImage";
import ItemListHorizontalSkeleton from "@/components/home/ItemListHorizontalSkeleton";
import HighlightedItemSkeleton from "@/components/home/HighlightedItemSkeleton";

export default function Home() {
  const [allItems, setAllItems] = useState<Tour[]>([]); // keep full list for filtering
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Tour[]>([]);
  const [highlighted, setHighlighted] = useState<Tour | null>(null);

  // Fetch tours from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [randomTours, highlightedTour] = await Promise.all([
          TourService.getRandom(8),
          TourService.getHighlighted(),
        ]);

        setItems(randomTours);
        setHighlighted(highlightedTour);
      } catch (err) {
        console.error("Failed to fetch home page tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6 mt-5">
        <WelcomeImage imageUrl="/images/background.jpg">
          <SearchBar redirectOnSearch />
        </WelcomeImage>
        {loading ? (
          <ItemListHorizontalSkeleton />
        ) : (
          <ItemListHorizontal title="Available Tours" items={items} />
        )}
        {loading ? (
          <HighlightedItemSkeleton />
        ) : (
          highlighted && <HighlightedItem item={highlighted} />
        )}
      </div>
    </main>
  );
}
