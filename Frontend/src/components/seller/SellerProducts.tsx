import React, { useState, useEffect } from "react";
import type { Seller } from "./SellerDashboard";
import SearchBar from "./SearchBar";
import ViewProduct from "./ViewProduct";
import { FaFilter } from "react-icons/fa";
import ProductIndicator from "./ProductIndicator";

interface Product {
  id: string;
  name: string;
  sellerid: string;
  price: number;
  description: string;
  category: string;
  inventory: string;
  active: boolean;
  images: string[];
}

type CategoryTree = {
  [key: string]: string | CategoryTree;
};

interface SellerData {
  seller: Seller;
  categoryData: CategoryTree | null;
}

const SellerProducts: React.FC<SellerData> = ({ seller }) => {
  console.log(seller);
  const [productData, setProductData] = useState<Product[] | null>(null);
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

  const getSellerProducts = async (): Promise<Product[] | null> => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/product/myproduct",
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSellerProducts();
      setProductData(data);
    };
    fetchData();
  }, []);

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

  useEffect(() => {
    if (openFilter) {
      setTempCategory(categoryFilter);
      setTempMinPrice(minPrice);
      setTempMaxPrice(maxPrice);
    }
  }, [openFilter]);

  return (
    <>
      {!productData || Object.keys(productData).length === 0 ? (
        <div>No products Found</div>
      ) : (
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

          {/* Filter Panel */}
          {openFilter && (
            <aside className="fixed top-1/2 right-[5rem] w-[400px] h-[600px] rounded-lg bg-white p-6 shadow-xl z-50 transform -translate-y-1/2 flex flex-col gap-4 overflow-y-auto ">
              <h2 className="text-xl font-bold mb-4">Filter Products</h2>

              {/* Temporary inputs for filtering */}
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

          {/* Product Grid */}
          <section className="w-[95%] h-[75%] flex flex-wrap justify-center items-center gap-2 overflow-y-auto scrollbar-cool mt-4">
            {productData === null ? (
              <p>Loading...</p>
            ) : filteredProducts && filteredProducts.length === 0 ? (
              <p>No products match your search.</p>
            ) : (
              filteredProducts?.map((product) => (
                <div
                  key={product.id}
                  className="p-4 py-8 w-[30%] h-[280px] flex flex-col items-center justify-evenly bg-white rounded-lg m-2 shadow-2xl hover:scale-101 cursor-pointer min-w-[300px] relative"
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
                      className="h-[150px] w-[250px] object-cover rounded-md border"
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
      )}
    </>
  );
};

export default SellerProducts;
