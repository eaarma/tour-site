"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";
import FilterMenu from "@/components/items/FilterMenu";
import SortMenu from "@/components/items/SortMenu";
import ItemList from "@/components/items/ItemList";
import { PageResponse, TourService } from "@/lib/tourService";
import { ItemListSkeleton } from "@/components/items/ItemListSkeleton";
import { FILTER_CATEGORIES } from "@/types/filterCategories";
import { Tour } from "@/types";
import ItemListHorizontal from "@/components/home/ItemListHorizontal";

const PAGE_SIZE = 12;

export default function ItemsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageResponse<Tour> | null>(null);
  const [suggestedTours, setSuggestedTours] = useState<Tour[]>([]);
  // read query params
  const keyword = params.get("keyword") || "";
  const date = params.get("date") || "";

  const selectedCategories = params.getAll("category");
  const selectedLanguages = params.getAll("language");
  const selectedTypes = params.getAll("type");

  const sort = params.get("sort") || "title,asc";

  // Keep a stable key for all search params.
  const searchKey = params.toString();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const currentParams = new URLSearchParams(searchKey);
      const currentPage = Number(currentParams.get("page") || 0);
      const currentSort = currentParams.get("sort") || "title,asc";
      const currentKeyword = currentParams.get("keyword") || "";
      const currentDate = currentParams.get("date") || "";
      const categories = currentParams.getAll("category");
      const languages = currentParams.getAll("language");
      const types = currentParams.getAll("type");

      const query = {
        page: currentPage,
        size: PAGE_SIZE,
        sort: currentSort,
        keyword: currentKeyword || undefined,
        date: currentDate || undefined,
        categories: categories.length ? categories : undefined,
        language: languages.length ? languages : undefined,
        type: types.length ? types : undefined,
      };

      try {
        const data = await TourService.getAllByQuery(query);
        setPageData(data);

        if (data.content.length === 0) {
          const fallback = await TourService.getRandom(8);
          setSuggestedTours(fallback);
        } else {
          setSuggestedTours([]); // reset when results exist
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchKey]);

  const handleSearch = useCallback((kw: string, dt: string) => {
    if (kw === keyword && dt === date) return;
    const search = new URLSearchParams(searchKey);

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
  }, [date, keyword, router, searchKey]);

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
    <div className="flex flex-col items-center min-h-screen p-4 max-w-7xl mx-auto">
      <div className="w-full space-y-6 mt-5 sm:mt-7">
        <SearchBar
          onSearch={handleSearch}
          initialKeywords={keyword}
          initialDate={date}
        />

        <div className="w-full grid grid-cols-2 gap-4 sm:flex sm:justify-between items-start">
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
        ) : pageData.content.length === 0 ? (
          <>
            <div className="text-center text-gray-500 mt-10 sm:mt-20">
              No results found. Try adjusting your search or filters.
            </div>

            {suggestedTours.length > 0 && (
              <ItemListHorizontal
title={
  keyword
    ? `No results for "${keyword}" – you might like these`
    : "You might like these"
}                items={suggestedTours}
              />
            )}
          </>
        ) : (
          <ItemList
            pageData={pageData}
            loading={false}
            onPageChange={handlePageChange}
            queryString={params.toString()}
          />
        )}
      </div>
    </div>
  );
}
