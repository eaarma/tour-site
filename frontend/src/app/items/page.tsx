"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";
import FilterMenu from "@/components/items/FilterMenu";
import SortMenu from "@/components/items/SortMenu";
import ItemList from "@/components/items/ItemList";
import { PageResponse, TourService } from "@/lib/tourService";
import { ItemListSkeleton } from "@/components/items/ItemListSkeleton";
import { FILTER_CATEGORIES } from "@/types/filterCategories";

const PAGE_SIZE = 12;

export default function ItemsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageResponse<any> | null>(null);
  const currentPage = Number(params.get("page") || 0);
  // read query params
  const keyword = params.get("keyword") || "";
  const date = params.get("date") || "";

  const selectedCategories = params.getAll("category");
  const selectedLanguages = params.getAll("language");
  const selectedTypes = params.getAll("type");

  const sort = params.get("sort") || "title,asc";

  // 🔑 stable key for all search params
  const searchKey = params.toString();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const query = {
        page: currentPage,
        size: PAGE_SIZE,
        sort,
        keyword: keyword || undefined,
        date: date || undefined,
        category: selectedCategories.length ? selectedCategories : undefined,
        language: selectedLanguages.length ? selectedLanguages : undefined,
        type: selectedTypes.length ? selectedTypes[0] : undefined,
      };

      try {
        const data = await TourService.getAllByQuery(query);
        setPageData(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [sort, searchKey]);

  const handleSearch = (kw: string, dt: string) => {
    if (kw === keyword && dt === date) return;
    const search = new URLSearchParams(params);

    if (kw) {
      search.set("keyword", kw);
    } else {
      search.delete("keyword");
    }

    if (dt) {
      search.set("date", dt);
    } else {
      search.delete("date");
    }

    search.set("page", "0");
    router.replace(`/items?${search.toString()}`);
  };

  const handleFilterChange = (selection: Record<string, string[]>) => {
    const search = new URLSearchParams();

    // always rebuild URL from scratch
    search.set("page", "0");
    search.set("sort", sort);

    if (keyword) search.set("keyword", keyword);
    if (date) search.set("date", date);

    Object.entries(selection).forEach(([key, values]) => {
      values.forEach((v) => search.append(key, v));
    });

    router.replace(`/items?${search.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const search = new URLSearchParams(params);
    search.set("page", page.toString());
    router.replace(`/items?${search.toString()}`);
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6 mt-5">
        <SearchBar
          onSearch={handleSearch}
          initialKeywords={keyword}
          initialDate={date}
        />

        <div className="flex justify-between items-start gap-4">
          <FilterMenu
            filters={FILTER_CATEGORIES}
            selected={{
              category: selectedCategories,
              language: selectedLanguages,
              type: selectedTypes,
            }}
            onChange={handleFilterChange}
          />

          <SortMenu
            sortKey={sort}
            onSortChange={(newSort) => {
              if (newSort === sort) return; // ignore no-change
              const search = new URLSearchParams(params);
              search.set("sort", newSort);
              search.set("page", "0");
              router.replace(`/items?${search.toString()}`);
            }}
          />
        </div>

        {loading || !pageData ? (
          <ItemListSkeleton />
        ) : (
          <ItemList
            pageData={pageData}
            loading={false}
            onPageChange={handlePageChange}
            queryString={params.toString()}
          />
        )}
      </div>
    </main>
  );
}
