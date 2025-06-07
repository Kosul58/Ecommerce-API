import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchQuery.trim() || searchQuery.trim() === "") {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <div className="w-full flex items-center px-4 py-2">
      <div className="relative flex-1">
        <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500 text-lg" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm sm:text-base"
        />
      </div>
    </div>
  );
};

export default SearchBar;
