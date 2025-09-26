"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";
import { format } from "date-fns";

interface SearchBarProps {
  onSearch?: (keywords: string, date: string) => void;
  redirectOnSearch?: boolean;
  initialKeywords?: string;
  initialDate?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  redirectOnSearch = false,
  initialKeywords = "",
  initialDate = "",
}) => {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [date, setDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null
  );
  const [initialized, setInitialized] = useState(false);
  const hasSkippedInitial = useRef(false);
  const router = useRouter();

  // helper to format date safely in local time
  const formatDate = (d: Date) => format(d, "yyyy-MM-dd");

  // Handle search
  const handleSearch = () => {
    const trimmed = keywords.trim();

    if (redirectOnSearch) {
      const params = new URLSearchParams();
      if (trimmed) params.append("keyword", trimmed);
      if (date) params.append("date", formatDate(date));
      router.push(`/items?${params.toString()}`);
    } else {
      onSearch?.(trimmed, date ? formatDate(date) : "");
    }
  };

  // Initialize from props once
  useEffect(() => {
    setKeywords(initialKeywords);
    setDate(initialDate ? new Date(initialDate) : null);
    setInitialized(true);
  }, [initialKeywords, initialDate]);

  // Live search (debounced, only after init)
  useEffect(() => {
    if (!redirectOnSearch && onSearch && initialized) {
      const trimmed = keywords.trim();

      if ((initialKeywords || initialDate) && !hasSkippedInitial.current) {
        hasSkippedInitial.current = true;
        return;
      }

      if (trimmed.length >= 3 || date) {
        const timeout = setTimeout(() => {
          handleSearch();
        }, 300);
        return () => clearTimeout(timeout);
      }

      if (!trimmed && !date) {
        onSearch("", "");
      }
    }
  }, [keywords, date, initialized]);

  // Clear all search inputs
  const handleClearAll = () => {
    setKeywords("");
    setDate(null);

    if (redirectOnSearch) {
      router.push("/items");
    } else {
      onSearch?.("", "");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-base-200 rounded-xl shadow-md border w-full max-w-3xl mx-auto">
      {/* Keyword input with clear button */}
      <div className="relative flex-1 w-full">
        <input
          type="text"
          placeholder="Search by title, description, or location..."
          className="input input-bordered w-full pr-10"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        {keywords && (
          <button
            type="button"
            onClick={() => {
              setKeywords("");
              if (redirectOnSearch) {
                const params = new URLSearchParams();
                if (date) params.append("date", formatDate(date));
                router.push(`/items?${params.toString()}`);
              } else {
                onSearch?.("", date ? formatDate(date) : "");
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* Date picker with custom input */}
      <div className="w-full sm:w-auto">
        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          onSelect={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          dateFormat="yyyy-MM-dd"
          calendarStartDay={1}
          showPopperArrow={false}
          shouldCloseOnSelect={true}
          preventOpenOnFocus={true}
          customInput={
            <CustomDateInput
              value={date ? formatDate(date) : ""}
              onClear={() => setDate(null)}
            />
          }
        />
      </div>

      {/* Search button (only for HomePage redirect) */}
      {redirectOnSearch && (
        <button
          onClick={handleSearch}
          className="btn btn-primary w-full sm:w-auto"
        >
          Search
        </button>
      )}

      {/* Clear all button */}
      {!redirectOnSearch && (
        <button
          onClick={handleClearAll}
          className="btn btn-outline w-full sm:w-auto"
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default SearchBar;
