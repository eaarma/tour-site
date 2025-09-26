"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";
import { FilterCategory } from "@/types/types";
import FilterMenu from "@/components/items/FilterMenu";
import ItemList from "@/components/items/ItemList";
import { Item } from "@/types";
import { PageResponse, TourService } from "@/lib/tourService";
import SortMenu from "@/components/items/SortMenu";
import { TourScheduleService } from "@/lib/tourScheduleService";

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

const PAGE_SIZE = 12;

export default function ItemsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortedItems, setSortedItems] = useState<Item[]>([]);
  const [sortKey, setSortKey] = useState("az"); // default sorting
  const [currentPage, setCurrentPage] = useState(0);
  const [pageData, setPageData] = useState<PageResponse<Item>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: PAGE_SIZE,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const keywordParam = params.get("keyword") || "";
  const dateParam = params.get("date") || "";

  // 🔍 Search handler
  const handleSearch = useCallback(
    async (keyword: string, date: string, items: Item[] = allItems) => {
      setLoading(true);
      try {
        const lowerKeyword = keyword.toLowerCase();
        setSearchKeyword(lowerKeyword);

        let results = items;

        if (lowerKeyword) {
          results = results.filter(
            (item) =>
              item.title.toLowerCase().includes(lowerKeyword) ||
              item.description.toLowerCase().includes(lowerKeyword) ||
              item.location.toLowerCase().includes(lowerKeyword)
          );
        }

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
      } catch (error) {
        console.error("Failed to apply search filters:", error);
      } finally {
        setLoading(false);
      }
    },
    [allItems]
  );

  // 🚀 Initial fetch
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

  // 🎯 Filter handler
  const handleFilter = useCallback(
    (filteredByFilterMenu: Item[]) => {
      setLoading(true);
      let results = filteredByFilterMenu;
      if (searchKeyword) {
        results = results.filter(
          (item) =>
            item.title.toLowerCase().includes(searchKeyword) ||
            item.description.toLowerCase().includes(searchKeyword)
        );
      }
      setFilteredItems(results);
      setLoading(false);
    },
    [searchKeyword]
  );

  // 🔄 Apply sorting whenever filteredItems or sortKey changes
  useEffect(() => {
    let sorted = [...filteredItems];
    switch (sortKey) {
      case "price":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "timeRequired":
        sorted.sort(
          (a, b) => (a.timeRequired ?? Infinity) - (b.timeRequired ?? Infinity)
        );
        break;
      case "intensity":
        sorted.sort((a, b) => (a.intensity ?? 0) - (b.intensity ?? 0));
        break;
      default:
        sorted.sort((a, b) =>
          (a[sortKey as keyof Item] ?? "")
            .toString()
            .localeCompare((b[sortKey as keyof Item] ?? "").toString())
        );
    }
    setSortedItems(sorted);
  }, [filteredItems, sortKey]);

  // 🧩 Reset page on new sorted results
  useEffect(() => {
    setCurrentPage(0);
  }, [sortedItems]);

  // 📄 Build paginated view
  useEffect(() => {
    if (!sortedItems.length) {
      setPageData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: PAGE_SIZE,
        first: true,
        last: true,
      });
      setLoading(false);
      return;
    }

    const totalElements = sortedItems.length;
    const totalPages = Math.ceil(totalElements / PAGE_SIZE);
    const safePage = Math.min(
      Math.max(currentPage, 0),
      Math.max(totalPages - 1, 0)
    );
    const start = safePage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const content = sortedItems.slice(start, end);

    setCurrentPage(safePage);
    setPageData({
      content,
      totalPages,
      totalElements,
      number: safePage,
      size: PAGE_SIZE,
      first: safePage === 0,
      last: safePage === totalPages - 1,
    });
    setLoading(false);
  }, [sortedItems, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage((prev) => {
      if (page === prev) return prev;
      if (page < 0) return 0;
      if (pageData) {
        const maxPage = Math.max(pageData.totalPages - 1, 0);
        return Math.min(page, maxPage);
      }
      return page;
    });
  };

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
            onSort={(items) => setSortedItems(items)}
          />
        </div>
        <ItemList
          pageData={pageData ?? undefined}
          loading={loading}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
