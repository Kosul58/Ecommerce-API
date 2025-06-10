import React, { useState, useMemo } from "react";
import type { Datum, Seller } from "../../types/sellertypes";
import SearchBar from "../search/SearchBar";
import ViewProduct from "./ViewProduct";
import { useProducts } from "../../api/seller";
import ProductCategory from "./ProductCategory";
import SortSelect from "../selects/SortSelect";
import type { Section } from "../../pages/SellerDashboard";
import ProductTable from "../table/SellerProducts";
import PaginationComponent from "../pagination/Pagination";
import { CiCirclePlus } from "react-icons/ci";

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
  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

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
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filteredAndSortedProducts = useMemo(() => {
    if (!productData?.data) return [];

    const products = productData.data.filter((product: Datum) => {
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

    products.sort((a, b) => {
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

    return products;
  }, [
    productData,
    searchQuery,
    categoryFilter,
    minPrice,
    maxPrice,
    sortOption,
  ]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [currentPage, filteredAndSortedProducts, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewProduct = (product: Datum) => {
    setViewProduct(true);
    setViewData(product);
    setProductData(product);
  };

  const handleAddProduct = () => {
    console.log("Add Product");
  };

  const handleToggleProductStatus = async (
    productId: string,
    newStatus: boolean
  ) => {
    console.log(`Toggling status for product ${productId} to ${newStatus}`);
    await refetch();
  };

  const handleDeleteProduct = async (productId: string) => {
    console.log(`Deleting product with ID: ${productId}`);
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-lg text-gray-600">
        Loading products...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-full text-lg text-red-600">
        Error: {error?.message}
      </div>
    );
  }

  if (!productData || productData.data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full text-lg text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <section className="w-full flex flex-col items-center bg-gray-100 min-h-screen">
      <div className="px-4 py-4 w-full flex justify-between bg-white flex-shrink-0 border-b border-gray-200">
        <div className="flex flex-col">
          <h3 className="text-xs text-gray-500">Seller /</h3>
          <h1 className="text-lg font-semibold text-gray-800">Products</h1>
        </div>
        <div className="flex flex-col items-end ">
          <h3 className="text-xs text-gray-500">seller</h3>
          <h1 className="text-lg font-semibold text-gray-800">
            {seller.username}
          </h1>
        </div>
      </div>

      <div className="w-full flex justify-between px-6 py-2 bg-white border-b border-gray-200">
        <div className="flex justify-center max-sm:items-center flex-col">
          <h1 className="text-md max-sm:text-xs">Manage Your Products</h1>
          <h2 className="text-xs text-gray-400 max-sm:hidden">
            Add,edit or delete products to keep your catalog updated.
          </h2>
        </div>

        <div>
          <button
            className="px-4 mr-2 py-2 bg-blue-300 hover:bg-blue-400 text-white rounded-md cursor-pointer flex justify-center  items-center gap-1 max-sm:rounded-full max-sm:p-2"
            onClick={() => handleAddProduct()}
          >
            <CiCirclePlus className="size-5 max-sm:size-6" />
            <h1 className="max-sm:hidden">Add Product</h1>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center px-4 bg-white  border-b border-gray-200 ">
        <div className="flex max-[400px]:flex-wrap items-center p-1 gap-1 w-full md:w-auto justify-between max-md:justify-center ">
          <button
            className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-sm flex-shrink-0 text-sm max-[400px]:w-full"
            onClick={() => setOpenFilter(!openFilter)}
          >
            Filter
          </button>
          <div className="w-full max-[400px]:w-full  max-w-[200px">
            <SortSelect onSortChange={(option) => setSortOption(option)} />
          </div>
        </div>
        <div className="w-full max-w-sm">
          <SearchBar onSearch={(query) => setSearchQuery(query)} />
        </div>
      </div>
      {openFilter && (
        <aside className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-2">
              Filter Products
            </h2>

            <label className="flex flex-col text-gray-700 font-medium">
              Category:
              <ProductCategory
                onCategorySelect={(cat) => setTempCategory(cat)}
              />
            </label>
            <label className="flex flex-col text-gray-700 font-medium">
              Min Price:
              <input
                type="number"
                min={0}
                placeholder="e.g., 100"
                value={tempMinPrice}
                onChange={(e) => setTempMinPrice(e.target.value)}
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none mt-1"
              />
            </label>
            <label className="flex flex-col text-gray-700 font-medium">
              Max Price:
              <input
                type="number"
                min={0}
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(e.target.value)}
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none mt-1"
                placeholder="e.g., 1000"
              />
            </label>

            <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                className="p-3 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition-colors duration-200 shadow-md font-semibold"
                onClick={() => {
                  setCategoryFilter(tempCategory);
                  setMinPrice(tempMinPrice);
                  setMaxPrice(tempMaxPrice);
                  setOpenFilter(false);
                  setCurrentPage(1);
                }}
              >
                Apply Filter
              </button>
              <button
                className="p-3 bg-red-500 text-white rounded-md w-full hover:bg-red-600 transition-colors duration-200 shadow-md font-semibold"
                onClick={() => {
                  setOpenFilter(false);
                  setTempCategory("");
                  setTempMinPrice("");
                  setTempMaxPrice("");
                  setCategoryFilter("");
                  setMinPrice("");
                  setMaxPrice("");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Product Table Section */}
      <section className="w-full flex flex-col items-center bg-white shadow-lg p-4 justify-between flex-grow overflow-y-auto">
        {filteredAndSortedProducts.length === 0 ? (
          <p className="py-8 text-lg text-gray-600">
            No products match your search or filters.
          </p>
        ) : (
          <ProductTable
            products={currentProducts}
            onProductView={handleViewProduct}
            onToggleStatus={handleToggleProductStatus}
            onProductDelete={handleDeleteProduct}
          />
        )}
        {filteredAndSortedProducts.length > 0 && (
          <div className="w-full flex justify-center mt-4 flex-shrink-0">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>

      {/* View Product Modal */}
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
