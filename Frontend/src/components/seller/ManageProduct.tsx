import React, { useState, useEffect } from "react";
import { useProducts } from "../../api/seller";
import SearchBar from "../search/SearchBar";
import { MdDeleteForever, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaEdit, FaBoxOpen } from "react-icons/fa";
import { IoSearchCircle } from "react-icons/io5";
import { type Datum } from "../../types/sellertypes";
import { useChangeVisibility, useDeleteProducts } from "../../hooks/useAuth";

interface ManageProductProps {
  sellerId: string;
}

const ManageProduct: React.FC<ManageProductProps> = ({ sellerId }) => {
  const {
    data: productData,
    isLoading,
    // isError,
    //  error
  } = useProducts();

  const {
    mutateAsync: changeVisibility,
    isPending: isChangingVisibility,
    // isError: changeVisibilityError,
    // error: changeVisibilityErr,
  } = useChangeVisibility();

  const {
    mutateAsync: deleteSelected,
    isPending: isDeletingProducts,
    // isError: deleteProductsError,
    // error: deleteProductsErr,
  } = useDeleteProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  const filteredProducts =
    productData?.data
      ?.filter((product: Datum) => product.sellerid === sellerId)
      .filter(
        (product: Datum) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

  useEffect(() => {
    if (
      filteredProducts.length > 0 &&
      selectedProducts.size === filteredProducts.length
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedProducts, filteredProducts.length]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prevSelected) => {
      const newSet = new Set(prevSelected);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
    } else {
      const allProductIds = new Set(filteredProducts.map((p) => p.id));
      setSelectedProducts(allProductIds);
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      console.log("Please select at least one product to delete.");
      return;
    }
    try {
      await deleteSelected({ productids: Array.from(selectedProducts) });
      setSelectedProducts(new Set());
      console.log("Products deleted successfully!");
    } catch (err) {
      console.error("Failed to delete products:", err);
    }
  };

  const handleToggleVisibilitySelected = async (active: boolean) => {
    if (selectedProducts.size === 0) {
      console.log(
        "Please select at least one product to change its visibility."
      );
      return;
    }

    const actionText = active ? "show" : "hide";
    try {
      const changeResult = await changeVisibility({
        productids: Array.from(selectedProducts),
        status: active,
      });
      const data = changeResult.data;
      console.log(data);
      setSelectedProducts(new Set());
      console.log(`Products visibility changed to ${actionText} successfully!`);
    } catch (err) {
      console.error("Failed to change product visibility:", err);
    }
  };

  const isAnyActionPending = isChangingVisibility || isDeletingProducts;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-lg text-blue-600 animate-pulse bg-gray-50 rounded-lg p-8">
        <span className="sr-only">Loading...</span>
        Loading products for management...
      </div>
    );
  }

  // if (isError || changeVisibilityError || deleteProductsError) {
  //   const errorMessage =
  //     error?.message ||
  //     changeVisibilityErr?.message ||
  //     deleteProductsErr?.message ||
  //     "An unknown error occurred.";
  //   return (
  //     <div className="flex justify-center items-center h-full text-lg text-red-700 bg-red-100 p-6 rounded-lg shadow-md border border-red-200">
  //       Error: {errorMessage}
  //     </div>
  //   );
  // }

  if (filteredProducts.length === 0 && searchQuery === "") {
    return (
      <div className="flex flex-col justify-center items-center h-full text-lg text-gray-500 bg-gray-50 rounded-lg shadow-inner p-8">
        <FaBoxOpen className="text-6xl mb-4 text-gray-400" />
        <p className="font-semibold mb-2 text-gray-700">
          You don't have any products to manage yet.
        </p>
        <p className="text-base text-gray-600">
          Start by adding your first product!
        </p>
      </div>
    );
  }

  if (filteredProducts.length === 0 && searchQuery !== "") {
    return (
      <div className="flex flex-col justify-center items-center h-full text-lg text-gray-500 bg-gray-50 rounded-lg shadow-inner p-8">
        <IoSearchCircle className="text-6xl mb-4 text-gray-400" />
        <p className="font-semibold mb-2 text-gray-700">
          No products found matching "
          <span className="font-bold text-gray-800">{searchQuery}</span>".
        </p>
        <p className="text-base text-gray-600">
          Try a different search term or clear the search bar.
        </p>
      </div>
    );
  }

  return (
    <main className="w-full h-full p-4 md:p-6 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      <h1 className="text-2xl max-md:text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-3 pb-4 border-b border-gray-200">
        <FaEdit className="text-indigo-600" />
        Manage Products
      </h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-grow">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="flex flex-wrap md:flex-row flex-col items-center gap-2 md:gap-3 p-3 bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectAll && filteredProducts.length > 0}
              onChange={toggleSelectAll}
              className="w-5 h-5 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label
              htmlFor="selectAll"
              className="text-gray-700 font-medium cursor-pointer select-none"
            >
              Select All (
              <span className="font-bold">{selectedProducts.size}</span>)
            </label>
          </div>

          <div className="flex gap-2 max-sm:flex-col">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedProducts.size === 0 || isAnyActionPending}
              className={`flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium w-full md:w-auto ${
                isDeletingProducts ? "animate-pulse" : ""
              }`}
            >
              {isDeletingProducts ? (
                "Deleting..."
              ) : (
                <>
                  <MdDeleteForever className="mr-1 text-lg" /> Delete
                </>
              )}
            </button>
            <button
              onClick={() => handleToggleVisibilitySelected(false)}
              disabled={selectedProducts.size === 0 || isAnyActionPending}
              className={`flex items-center px-4 py-2 bg-amber-500 text-white rounded-md shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium w-full md:w-auto ${
                isChangingVisibility ? "animate-pulse" : ""
              }`}
            >
              {isChangingVisibility ? (
                "Hiding..."
              ) : (
                <>
                  <MdVisibilityOff className="mr-1 text-lg" /> Hide
                </>
              )}
            </button>
            <button
              onClick={() => handleToggleVisibilitySelected(true)}
              disabled={selectedProducts.size === 0 || isAnyActionPending}
              className={`flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium w-full md:w-auto ${
                isChangingVisibility ? "animate-pulse" : ""
              }`}
            >
              {isChangingVisibility ? (
                "Showing..."
              ) : (
                <>
                  <MdVisibility className="mr-1 text-lg" /> Show
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product.id)}
              className={`relative bg-white border rounded-lg shadow-sm overflow-hidden flex items-center justify-between p-4 transition-all duration-200 ease-in-out w-full cursor-pointer
                ${
                  selectedProducts.has(product.id)
                    ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50"
                    : "border-gray-200 hover:shadow-md hover:border-gray-300"
                }`}
            >
              <input
                type="checkbox"
                checked={selectedProducts.has(product.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleProductSelection(product.id);
                }}
                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0 mr-4"
              />
              <div className="flex-grow min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate mb-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm truncate mb-2">
                  Category:{" "}
                  <span className="font-medium text-gray-700">
                    {product.category}
                  </span>
                </p>
                <p className="text-gray-900 font-bold text-xl mb-1">
                  Rs. {product.price.toFixed(2)}
                </p>
                <p
                  className={`text-sm font-medium ${
                    product.inventory > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  Inventory:{" "}
                  <span className="font-bold">{product.inventory}</span>
                </p>
                <p
                  className={`text-sm font-medium ${
                    product.active ? "text-emerald-500" : "text-amber-600"
                  }`}
                >
                  Status:{" "}
                  <span className="font-bold">
                    {product.active ? "Active" : "Hidden"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ManageProduct;
