import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAllProducts } from "../hooks/useAuth";
import FilterSidebar from "../components/FilterSidebar";
import NavBar from "../components/navbar/Navbar";
import ProductCard from "../components/cards/UserProductCard";
import SortSelect from "../components/selects/SortSelect";
import { FaFilter, FaTimes } from "react-icons/fa";
import PaginationComponent from "../components/pagination/Pagination";

interface ProductsProps {
  productsPerPage?: number;
}

type SortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "date-asc"
  | "date-desc";

const DEFAULT_PRODUCTS_PER_PAGE = 8;

const Products: React.FC<ProductsProps> = ({
  productsPerPage = DEFAULT_PRODUCTS_PER_PAGE,
}) => {
  const { data: products, isLoading, isError } = useAllProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999999]);
  const [sortBy, setSortBy] = useState<SortOption | "">("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedYear, priceRange, sortBy, productsPerPage]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products.filter((product) => {
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const productYear = product.timestamp
        ? new Date(product.timestamp).getFullYear().toString()
        : null;
      const matchesYear = !selectedYear || productYear === selectedYear;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesCategory && matchesYear && matchesPrice;
    });

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "date-asc":
            return (
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
          case "date-desc":
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          default:
            return 0;
        }
      });
    }
    return result;
  }, [products, selectedCategory, selectedYear, priceRange, sortBy]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / productsPerPage);
  }, [filteredProducts.length, productsPerPage]);

  const productsToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, productsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedYear(null);
    setPriceRange([0, 9999999]);
    setSortBy("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== null ||
      selectedYear !== null ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 9999999 ||
      sortBy !== ""
    );
  }, [selectedCategory, selectedYear, priceRange, sortBy]);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <NavBar />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="hidden md:block h-full bg-white shadow-md">
          <FilterSidebar
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            handleResetFilters={handleResetFilters}
          />
        </div>

        {isFilterOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-start justify-center p-4 pt-20"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-lg max-w-sm w-full p-6 overflow-auto max-h-[80vh] relative shadow-lg">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-4 right-4 size-8 z-50 flex justify-center items-center text-white bg-red-500 rounded-full hover:bg-red-600 transition"
                aria-label="Close filters"
              >
                <FaTimes size={20} />
              </button>
              <FilterSidebar
                products={products}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                handleResetFilters={() => {
                  handleResetFilters();
                  setIsFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col w-full">
          <div className="w-full flex justify-between items-center px-4 py-2 bg-white shadow-sm md:shadow-none">
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition"
              onClick={() => setIsFilterOpen(true)}
              aria-label="Open filters"
            >
              <FaFilter />
              Filters
            </button>
            <SortSelect onSortChange={setSortBy} />
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-full">
                <div className="text-xl font-semibold text-blue-600 animate-pulse">
                  Loading products...
                </div>
              </div>
            ) : isError || !products ? (
              <div className="flex items-center justify-center min-h-full">
                <div className="text-xl font-semibold text-red-600">
                  Failed to load products. Please try again later.
                </div>
              </div>
            ) : productsToDisplay.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsToDisplay.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="w-full flex justify-center items-center mt-8">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-600 text-xl mt-16 p-6 bg-white rounded-lg shadow-md">
                {hasActiveFilters
                  ? "No products found matching your criteria."
                  : "No products available at the moment."}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
