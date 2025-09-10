"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch?: (keywords: string, date: string) => void;
  redirectOnSearch?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  redirectOnSearch = false,
}) => {
  const [keywords, setKeywords] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (redirectOnSearch) {
      // navigate with query params
      const params = new URLSearchParams();
      if (keywords.trim()) params.append("keyword", keywords.trim());
      if (date) params.append("date", date);

      router.push(`/items?${params.toString()}`);
    } else {
      onSearch?.(keywords.trim(), date);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-base-200 rounded-xl shadow-md border w-full max-w-3xl mx-auto">
      {/* Keyword input */}
      <div className="flex-1 w-full">
        <input
          type="text"
          placeholder="Search by title, description, or location..."
          className="input input-bordered w-full"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
      </div>

      {/* Date input */}
      <div>
        <input
          type="date"
          className="input input-bordered"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="btn btn-primary w-full sm:w-auto"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
