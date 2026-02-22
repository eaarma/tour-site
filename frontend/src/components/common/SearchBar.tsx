"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDateInput from "./CustomDateInput";
import { format } from "date-fns";
import { Search, X } from "lucide-react";

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
    initialDate ? new Date(initialDate) : null,
  );
  const [initialized, setInitialized] = useState(false);
  const hasSkippedInitial = useRef(false);
  const router = useRouter();

  const formatDate = (d: Date) => format(d, "yyyy-MM-dd");

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

  useEffect(() => {
    setKeywords(initialKeywords);
    setDate(initialDate ? new Date(initialDate) : null);
    setInitialized(true);
  }, [initialKeywords, initialDate]);

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

  const handleClearAll = () => {
    setKeywords("");
    setDate(null);

    if (redirectOnSearch) {
      router.push("/items");
    } else {
      onSearch?.("", "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-base-100/90 backdrop-blur-[4px] border border-base-300 shadow-md shadow-black/5 rounded-2xl p-2 sm:p-2.5">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {/* Keyword input */}
          <div className="relative flex-1 group ">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors pointer-events-none group-hover:text-primary group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search tours, locations..."
              className="w-full h-11 pl-10 hover:bg-base-100 pr-9 bg-muted/50 text-foreground placeholder:text-muted-foreground rounded-xl border border-transparent bg-base-200 focus:bg-base-100 
              focus:border-border focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-primary text-sm transition-all
              hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/20 hover:ring-primary/30"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={handleKeyDown}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear keywords"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:flex items-center">
            <div className="w-px h-6 bg-border/60" />
          </div>

          {/* Date picker */}
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              wrapperClassName="w-full"
              portalId="root"
              popperClassName="z-[9999]"
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

          {/* Search button (redirect mode) */}
          {redirectOnSearch && (
            <button
              onClick={handleSearch}
              className="
  group
  h-11 px-6
  bg-base-100
  border border-base-300
  text-foreground
  font-medium text-sm
  sm:ml-2
  rounded-xl flex items-center justify-center gap-2 shrink-0
  transition-all duration-150
  hover:border-primary
  hover:text-primary
  active:bg-base-200
  active:text-primary
"
            >
              <Search className="size-4 transition-colors group-hover:text-primary" />
              <span>Search</span>
            </button>
          )}

          {/* Clear button (filter mode) */}
          {!redirectOnSearch && (
            <button
              onClick={handleClearAll}
              className="
  group
  h-11 px-5
  bg-base-100
  border border-base-300
  text-muted-foreground
  font-medium text-sm
  rounded-xl
  flex items-center justify-center gap-2 shrink-0
  transition-all duration-150

  hover:text-primary
hover:border-border hover:outline-none hover:ring-2 hover:ring-ring/20 hover:ring-primary/30
  active:bg-base-200
  active:text-primary
"
            >
              <X className="size-4 transition-colors group-hover:text-primary" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
