import React, { useState } from "react";
import type { Datum, Seller } from "../../types/sellertypes";
import SearchBar from "./SearchBar";
import ViewProduct from "./ViewProduct";
import ProductCard from "../cards/ProductCard";
import { useProducts } from "../../api/seller";
import ProductCategory from "./ProductCategory";
import { IoSearchCircle } from "react-icons/io5";
import SortSelect from "../selects/SortSelect";
import type { Section } from "../../pages/SellerDashboard";
interface SellerData {
  setProductData: React.Dispatch<React.SetStateAction<Datum | null>>;
  seller: Seller;
  onEdit: (key: Section) => void;
}
const SellerProducts: React.FC<SellerData> = ({
  seller,
  setProductData,
  onEdit,
}) => {
  console.log(seller);
  const { data: productData, isLoading, isError, error } = useProducts();
  const [viewProduct, setViewProduct] = useState(false);
  const [viewData, setViewData] = useState<Datum | null>(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tempCategory, setTempCategory] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");
  const [searchShow, setSearchShow] = useState(false);
  const [sortOption, setSortOption] = useState("");

  const filteredProducts = productData?.data
    .filter((product: Datum) => {
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
    })
    ?.sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
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
    <section className="w-full h-[100%] flex flex-col items-center overflow-y-auto relative">
      <div className="w-full h-fit bg-gray-100 flex flex-row justify-between items-center py-2 max-md:justify-end">
        <h2 className="px-4 text-2xl max-sm:hidden font-bold max-lg:text-lg max-lg:px-2">
          Seller Products:
        </h2>
        <div>
          {searchShow && (
            <div className="min-md:hidden">
              <SearchBar
                onSearch={(query) => {
                  setSearchQuery(query);
                  setSearchShow(false);
                }}
              />
            </div>
          )}
          {!searchShow && (
            <IoSearchCircle
              size={40}
              className="cursor-pointer min-md:hidden"
              onClick={() => setSearchShow(true)}
            />
          )}
        </div>
        <div className="max-md:hidden min-w-[400px] w-[70%]">
          <SearchBar onSearch={(query) => setSearchQuery(query)} />
        </div>
      </div>
      <div className="text-gray-400 w-full flex justify-start px-4 items-center bg-inherit">
        <button
          className="px-2 py-1 rounded-md bg-slate-200 cursor-pointer text-gray-500 hover:bg-slate-300"
          onClick={() => setOpenFilter(!openFilter)}
        >
          Filter
        </button>
        <SortSelect onSortChange={(option) => setSortOption(option)} />
      </div>
      {openFilter && (
        <aside className="fixed top-1/2 left-1/2 w-[400px] h-[600px] rounded-lg bg-white p-6 shadow-xl z-30 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 overflow-y-auto">
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
              className="p-2 bg-green-500 text-white rounded w-full cursor-pointer"
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
              className="p-2 bg-red-500 text-white rounded w-full cursor-pointer"
              onClick={() => {
                setOpenFilter(false);
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
      <section className="w-full h-[85%] flex flex-wrap justify-center items-center gap-2 overflow-y-auto mt-1 bg-slate-300/70">
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
                setProductData(product);
              }}
            />
          ))
        )}
      </section>
      {viewProduct && viewData && (
        <ViewProduct
          viewData={viewData}
          setViewProduct={setViewProduct}
          onEdit={onEdit}
        />
      )}
    </section>
  );
};

export default SellerProducts;
