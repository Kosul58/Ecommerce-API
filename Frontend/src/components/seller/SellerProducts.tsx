import React, { useState } from "react";
import type { Datum, SellerData } from "../../types/sellertypes";
import SearchBar from "./SearchBar";
import ViewProduct from "./ViewProduct";
import { FaFilter } from "react-icons/fa";
import ProductCard from "../cards/ProductCard";
import { useProducts } from "../../api/seller";
import ProductCategory from "./ProductCategory";

const SellerProducts: React.FC<SellerData> = ({ seller }) => {
  console.log(seller);
  const { data: productData, isLoading, isError, error } = useProducts();
  const [viewProduct, setViewProduct] = useState(false);
  const [viewData, setViewData] = useState<Datum | null>(null);
  const [viewFilter, setViewFilter] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tempCategory, setTempCategory] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  const filteredProducts = productData?.data.filter((product: Datum) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "" ||
      product.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const price = product.price;
    const matchesMinPrice = minPrice === "" || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || price <= parseFloat(maxPrice);

    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  if (isLoading) {
    return <div>Loading products...</div>;
  }

  if (isError) {
    return <div>Error: {error?.message}</div>;
  }

  if (!productData || productData.data.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <section className="w-[95%] h-[100%] flex flex-col  items-center overflow-y-auto scrollbar-cool relative md:left-20">
      <div className="absolute top-5 right-5 text-white flex items-center">
        {viewFilter && <p className="text-2xl mr-4">Filter:</p>}
        <FaFilter
          className="size-7 cursor-pointer"
          onClick={() => setOpenFilter(!openFilter)}
          onMouseEnter={() => setViewFilter(true)}
          onMouseLeave={() => setViewFilter(false)}
        />
      </div>

      {openFilter && (
        <aside className="fixed top-1/2 right-[5rem] w-[400px] h-[600px] rounded-lg bg-white p-6 shadow-xl z-30 transform -translate-y-1/2 flex flex-col gap-4 overflow-y-auto ">
          <h2 className="text-xl font-bold mb-4">Filter Products</h2>

          <label className="flex flex-col">
            Category:
            <ProductCategory onCategorySelect={(cat) => setTempCategory(cat)} />
          </label>
          <label className="flex flex-col">
            Min Price:
            <input
              type="number"
              min={100}
              placeholder="100"
              value={tempMinPrice}
              onChange={(e) => setTempMinPrice(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
          <label className="flex flex-col">
            Max Price:
            <input
              type="number"
              min={1000}
              value={tempMaxPrice}
              onChange={(e) => setTempMaxPrice(e.target.value)}
              className="border p-2 rounded"
              placeholder="1000"
            />
          </label>

          <div className="mt-auto flex gap-4">
            <button
              className="p-2 bg-green-500 text-white rounded w-full"
              onClick={() => {
                setCategoryFilter(tempCategory);
                setMinPrice(tempMinPrice);
                setMaxPrice(tempMaxPrice);
                setOpenFilter(false);
              }}
            >
              Apply Filter
            </button>
            <button
              className="p-2 bg-red-500 text-white rounded w-full"
              onClick={() => {
                setTempCategory("");
                setTempMinPrice("");
                setTempMaxPrice("");
                setCategoryFilter("");
                setMinPrice("");
                setMaxPrice("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </aside>
      )}

      <SearchBar onSearch={(query) => setSearchQuery(query)} />

      <section className="w-[95%] h-[85%] flex flex-wrap justify-center items-center gap-2 overflow-y-auto scrollbar-cool mt-4">
        {filteredProducts && filteredProducts.length === 0 ? (
          <p>No products match your search.</p>
        ) : (
          filteredProducts?.map((product: Datum) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => {
                setViewProduct(true);
                setViewData(product);
              }}
            />
          ))
        )}
      </section>
      {viewProduct && viewData && (
        <ViewProduct viewData={viewData} setViewProduct={setViewProduct} />
      )}
    </section>
  );
};

export default SellerProducts;
