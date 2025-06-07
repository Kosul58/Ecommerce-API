import React, { useState, useMemo } from "react";
import type { Datum, Seller } from "../../types/sellertypes";
import SearchBar from "../search/SearchBar";
import ViewProduct from "./ViewProduct";
import { useProducts } from "../../api/seller";
import ProductTable from "../table/Table";
import PaginationComponent from "../pagination/Pagination";
import { CiCirclePlus } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

interface SellerData {
  setProductData: React.Dispatch<React.SetStateAction<Datum | null>>;
  seller: Seller;
}

const SellerProducts: React.FC<SellerData> = ({ seller, setProductData }) => {
  console.log(seller);
  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();
  const navigate = useNavigate();
  const [viewProduct, setViewProduct] = useState(false);
  const [viewData, setViewData] = useState<Datum | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filteredProducts = useMemo(() => {
    if (!productData?.data) return [];

    const products = productData.data.filter((product: Datum) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    return products;
  }, [productData, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentPage, filteredProducts, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewProduct = (product: Datum) => {
    setViewProduct(true);
    setViewData(product);
    setProductData(product);
  };

  const handleAddProduct = () => {
    navigate("/seller/addproduct");
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

  const handleEditProduct = async (product: Datum) => {
    console.log(product);
    navigate("/seller/editproduct", { state: { product } });
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
    <section className="w-full flex flex-col items-center bg-gray-100 h-screen max-h-screen">
      <div className="px-4 py-2 w-full flex justify-between bg-white flex-shrink-0 border-b border-gray-200">
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
          <h1 className="text-md max-sm:text-sm">Manage Your Products</h1>
          <h2 className="text-xs text-gray-400 max-sm:hidden">
            Add,edit or delete products to keep your catalog updated.
          </h2>
        </div>

        <div>
          <button
            className="px-4 mr-2 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md cursor-pointer flex justify-center  items-center gap-1 max-sm:rounded-full max-sm:p-2"
            onClick={() => handleAddProduct()}
          >
            <CiCirclePlus className="size-5 max-sm:size-6" />
            <h1 className="max-sm:hidden">Add Product</h1>
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-end items-center px-4 bg-white  border-b border-gray-200 ">
        <div className="w-full max-w-sm">
          <SearchBar onSearch={(query) => setSearchQuery(query)} />
        </div>
      </div>

      {/* Product Table Section */}
      <section className="w-full flex flex-col items-center bg-gray-50 shadow-lg p-2 justify-between flex-grow overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <p className="py-8 text-lg text-gray-600">
            No products match your search.
          </p>
        ) : (
          <ProductTable
            products={currentProducts}
            onProductView={handleViewProduct}
            onToggleStatus={handleToggleProductStatus}
            onProductDelete={handleDeleteProduct}
            onProductEdit={handleEditProduct}
          />
        )}
        {filteredProducts.length > 0 && (
          <div className="w-full flex justify-center flex-shrink-0 ">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
      {viewProduct && viewData && (
        <ViewProduct viewData={viewData} setViewProduct={setViewProduct} />
      )}
    </section>
  );
};

export default SellerProducts;
