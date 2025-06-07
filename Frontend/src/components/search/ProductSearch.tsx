import React, { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

interface SearchProps {
  onSearch?: (value: string) => void;
}

const ProductSearch: React.FC<SearchProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      navigate("/products");
      return;
    }
    onSearch?.(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-3 py-1.5 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 w-32 md:w-48 hover:w-48 md:hover:w-64 text-sm"
      />
      <LuSearch
        onClick={handleSearch}
        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
        size={16}
      />
    </div>
  );
};

export default ProductSearch;
