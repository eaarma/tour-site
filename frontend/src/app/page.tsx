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
import CategoryGrid from "@/components/home/CategoryGrid";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Tour[]>([]);
  const [highlighted, setHighlighted] = useState<Tour | null>(null);
  const [categories, setCategories] = useState<
    { title: string; items: Tour[] }[]
  >([]);

  // Fetch tours from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [randomTours, highlightedTour, hiking, walking] =
          await Promise.all([
            TourService.getRandom(8),
            TourService.getHighlighted(),
            TourService.getRandomByCategory("HIKING", 4),
            TourService.getRandomByCategory("WALKING", 4),
          ]);

        setItems(randomTours);
        setHighlighted(highlightedTour);

        setCategories([
          { title: "Hiking Tours", items: hiking },
          { title: "Walking Tours", items: walking },
        ]);
      } catch (err) {
        console.error("Failed to fetch home page tours:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen sm:py-4 mb-6">
      <div className="w-full mt-0 space-y-6 sm:mt-4 px-2 sm:px-4 md:px-0">
        <div className="full-bleed sm:page-container mt-0 sm:mt-6 mb-40 sm:mb-12">
          <WelcomeImage imageUrl="/images/background.jpg">
            <SearchBar redirectOnSearch />
          </WelcomeImage>
        </div>
        {loading ? (
          <ItemListHorizontalSkeleton />
        ) : (
          <ItemListHorizontal title="Available Tours" items={items} />
        )}
        {/* Categories row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {categories.map((cat) => (
            <CategoryGrid key={cat.title} title={cat.title} items={cat.items} />
          ))}
        </div>

        {/* Highlighted below */}
        <div className="mt-8">
          {loading ? (
            <HighlightedItemSkeleton />
          ) : (
            highlighted && (
              <HighlightedItem title="Featured Tour" item={highlighted} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
