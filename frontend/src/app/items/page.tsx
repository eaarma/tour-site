"use client";

import { useState } from "react";
import SearchBar from "@/components/common/SearchBar";
import { FilterCategory, Item } from "@/types/types";
import FilterMenu from "@/components/items/FilterMenu";
import ItemList from "@/components/items/ItemList";

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

const DEFAULT_ITEMS: Item[] = [
  {
    id: "1",
    title: "Athens Walking Tour",
    description: "Historical sites and local culture",
    image: "/images/athens.jpg",
    price: "$40",
    timeRequired: "2 hours",
    intensity: "Low",
    participants: "Max 10",
    category: "Culture",
    language: "English",
    type: "Tour",
    location: "Athens",
  },
  {
    id: "2",
    title: "Santorini Wine Tasting",
    description: "Taste local wines with a sunset view",
    image: "/images/santorini.jpg",
    price: "$65",
    timeRequired: "3 hours",
    intensity: "Low",
    participants: "Max 12",
    category: "Food & Drink",
    language: "English",
    type: "Workshop",
    location: "Santorini",
  },
  {
    id: "3",
    title: "Meteora Hiking Adventure",
    description: "Breathtaking views and active trekking",
    image: "/images/meteora.jpg",
    price: "$75",
    timeRequired: "5 hours",
    intensity: "High",
    participants: "Max 6",
    category: "Adventure",
    language: "English",
    type: "Tour",
    location: "Kalambaka",
  },
  {
    id: "4",
    title: "Thessaloniki Bike Tour",
    description: "Explore the city on two wheels",
    image: "/images/thessaloniki.jpg",
    price: "$50",
    timeRequired: "2.5 hours",
    intensity: "Medium",
    participants: "Max 8",
    category: "Urban",
    language: "English",
    type: "Tour",
    location: "Thessaloniki",
  },
  {
    id: "5",
    title: "Crete Farm Visit",
    description: "Experience authentic rural life and food",
    image: "/images/crete.jpg",
    price: "$55",
    timeRequired: "4 hours",
    intensity: "Low",
    participants: "Max 10",
    category: "Nature",
    language: "English",
    type: "Event",
    location: "Crete",
  },
];

export default function ItemsPage() {
  const [allItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [filteredItems, setFilteredItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword.toLowerCase());
  };

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
