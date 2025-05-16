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
    <div className="w-full flex items-center justify-center mt-4 gap-2">
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={handleInputChange}
        className="w-[500px] px-4 py-2  border-white border-2 rounded-lg  focus:outline-none hover:border-gray-800 focus:ring-2 focus:ring-blue-400 shadow-2xl"
      />
      <button
        onClick={handleSearchClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
