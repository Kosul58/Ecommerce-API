import React, { useMemo } from "react";
import { FaRedo } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  timestamp: string;
  images: string[];
  inventory: number;
};

type FilterSidebarProps = {
  products: Product[] | undefined;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedYear: string | null;
  setSelectedYear: (year: string | null) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  handleResetFilters: () => void;
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  products,
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  priceRange,
  setPriceRange,
  handleResetFilters,
}) => {
  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.category))).sort();
  }, [products]);

  const years = useMemo(() => {
    if (!products) return [];
    const yearSet = new Set<string>();
    for (const p of products) {
      const date = new Date(p.timestamp);
      if (!isNaN(date.getTime())) {
        yearSet.add(date.getFullYear().toString());
      }
    }
    return Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));
  }, [products]);

  return (
    <aside className="w-full md:w-64 bg-white shadow-md p-6 space-y-8 sticky top-24 transition-all min-h-[100%]">
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Category</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center space-x-2">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
              />
              <span className="truncate capitalize">{cat}</span>
            </label>
          ))}
          {categories.length > 0 && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Clear selection
            </button>
          )}
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Year</h3>
        <div className="space-y-2">
          {years.map((year) => (
            <label key={year} className="flex items-center space-x-2">
              <input
                type="radio"
                name="year"
                checked={selectedYear === year}
                onChange={() => setSelectedYear(year)}
              />
              <span>{year}</span>
            </label>
          ))}
          {years.length > 0 && (
            <button
              onClick={() => setSelectedYear(null)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Clear selection
            </button>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3 border-b pb-2">
          Price Range
        </h3>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              placeholder="Min"
              min={0}
            />
          </div>
          <div className="relative">
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200"
              placeholder="Max"
              min={priceRange[0]}
            />
          </div>
        </div>
      </section>

      <button
        onClick={handleResetFilters}
        className="w-full flex items-center justify-center gap-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md transition-colors cursor-pointer"
      >
        <FaRedo className="text-gray-600" />
        Reset Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;
