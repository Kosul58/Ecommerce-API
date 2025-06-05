import React from "react";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";

interface SortSelectProps {
  onSortChange: (sortBy: SortOption) => void;
}

const SortSelect: React.FC<SortSelectProps> = ({ onSortChange }) => {
  return (
    <div className="w-full max-w-[200px] p-2">
      <div className="relative">
        <select
          id="sort"
          name="sort"
          defaultValue=""
          className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="" disabled>
            Sort
          </option>
          <option value="name-asc" className="text-black">
            Name: A to Z
          </option>
          <option value="name-desc" className="text-black">
            Name: Z to A
          </option>
          <option value="price-asc" className="text-black">
            Price: Low to High
          </option>
          <option value="price-desc" className="text-black">
            Price: High to Low
          </option>
          <option value="date-desc" className="text-black">
            Date: Newest First
          </option>
          <option value="date-asc" className="text-black">
            Price: Oldest First
          </option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SortSelect;
