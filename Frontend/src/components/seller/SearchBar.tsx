import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  return (
    <div className="w-full flex items-center justify-center gap-2 z-60 px-2">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleInputChange}
        className="w-[80%] px-4 py-2 bg-gray-200  border hover:scale-101 rounded-lg focus:outline-none hover:border-gray-800 focus:ring-2 focus:ring-blue-400 shadow-md border-slate-500"
      />
      <button
        onClick={handleSearchClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition max-md:text-sm max-md:px-2 max-md:py-2"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
