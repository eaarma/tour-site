"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (keywords: string, date: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [keywords, setKeywords] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = () => {
    onSearch(keywords.trim(), date);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-base-200 rounded border w-full max-w-2xl mx-auto">
      {/* Keyword input */}
      <input
        type="text"
        placeholder="Search by location..."
        className="input input-bordered w-full sm:w-auto flex-1"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />

      {/* Date input */}
      <input
        type="date"
        className="input input-bordered w-full sm:w-auto"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

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
