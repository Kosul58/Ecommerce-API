import React, { useState } from "react";
import type { Product, SellerData } from "../../types/sellertypes";
import SearchBar from "./SearchBar";
import ViewProduct from "./ViewProduct";
import { FaFilter } from "react-icons/fa";
import ProductIndicator from "./ProductIndicator";
import { useMyProducts } from "../../hooks/useProductList";

const SellerProducts: React.FC<SellerData> = ({ seller, categoryData }) => {
  console.log(seller);
  console.log(categoryData);
  const { data: productData, isLoading, isError, error } = useMyProducts();
  const [viewProduct, setViewProduct] = useState(false);
  const [viewData, setViewData] = useState<Product | null>(null);
  const [viewFilter, setViewFilter] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tempCategory, setTempCategory] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  const filteredProducts = productData?.filter((product) => {
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

  if (!productData || productData.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <section className="w-[95%] h-[95%] flex flex-col items-center overflow-y-auto scrollbar-cool relative">
      <div className="absolute top-2 right-2 text-white flex items-center">
        {viewFilter && <p className="text-2xl mr-4">Filter:</p>}
        <FaFilter
          className="size-7 cursor-pointer"
          onClick={() => setOpenFilter(!openFilter)}
          onMouseEnter={() => setViewFilter(true)}
          onMouseLeave={() => setViewFilter(false)}
        />
      </div>

      {openFilter && (
        <aside className="fixed top-1/2 right-[5rem] w-[400px] h-[600px] rounded-lg bg-white p-6 shadow-xl z-50 transform -translate-y-1/2 flex flex-col gap-4 overflow-y-auto ">
          <h2 className="text-xl font-bold mb-4">Filter Products</h2>

          <label className="flex flex-col">
            Category:
            <input
              type="text"
              value={tempCategory}
              onChange={(e) => setTempCategory(e.target.value)}
              className="border p-2 rounded"
            />
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
          filteredProducts?.map((product: Product) => (
            <div
              key={product.id}
              className="py-8 w-[300px] h-[380px] flex flex-col items-center justify-evenly bg-white rounded-lg m-2 shadow-2xl hover:scale-101 cursor-pointer min-w-[300px] relative"
              onClick={() => {
                setViewProduct(true);
                setViewData(product);
              }}
            >
              <ProductIndicator active={product.active} />
              {product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-[70%] w-[300px] object-cover border"
                />
              )}
              <div className="w-full h-[100px] p-1">
                <h2 className="font-bold text-md truncate max-w-[200px]">
                  Name: {product.name}
                </h2>
                <p className="truncate max-w-[300px]">
                  Category: {product.category}
                </p>
                <div className="flex w-full justify-start gap-4">
                  <p>Inventory: {product.inventory}</p>
                  <p>Price: Rs.{product.price}</p>
                </div>
              </div>
            </div>
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
