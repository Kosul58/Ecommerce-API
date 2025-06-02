import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAllProducts } from "../hooks/useAuth";

const PRODUCTS_PER_PAGE = 6;
const Products = () => {
  const { data: products, isLoading, isError } = useAllProducts();
  console.log(products);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999]);

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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      const matchesYear =
        !selectedYear ||
        new Date(product.timestamp).getFullYear().toString() === selectedYear;

      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesYear && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, selectedYear, priceRange]);

  const productsToDisplay = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
  };

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSelectedYear(null);
    setPriceRange([0, 999999]);
    setSearchTerm("");
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading products...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-600 py-20">
        Failed to load products.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 bg-white rounded-xl shadow p-5 space-y-6">
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Category</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-blue-600 mt-1"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Year</h3>
            <div className="space-y-1">
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
              <button
                onClick={() => setSelectedYear(null)}
                className="text-sm text-blue-600 mt-1"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Price Range (Rs.)</h3>
            <div className="space-y-2">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([+e.target.value, priceRange[1]])
                }
                className="w-full p-2 border rounded-md"
                placeholder="Min"
              />
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], +e.target.value])
                }
                className="w-full p-2 border rounded-md"
                placeholder="Max"
              />
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-md"
          >
            Reset Filters
          </button>
        </aside>

        <div className="flex-1">
          {productsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsToDisplay.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <img
                    src={
                      product.images[0] ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-52 object-cover rounded-t-xl"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-bold truncate">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-blue-700 font-bold text-xl">
                        Rs. {product.price.toLocaleString()}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.inventory > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inventory > 0
                          ? `In Stock: ${product.inventory}`
                          : "Out of Stock"}
                      </span>
                    </div>
                    <Link
                      to={`/product/${product.id}`}
                      className="block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-lg mt-20">
              No products match your criteria.
            </div>
          )}

          {hasMoreProducts && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold text-lg hover:bg-blue-700 transition"
              >
                Load More ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
