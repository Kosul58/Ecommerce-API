import React, { useState, useMemo } from "react";
import type { Datum, Seller } from "../../types/sellertypes";
import SearchBar from "../search/SearchBar";
import ViewProduct from "./ViewProduct";
import { useProducts } from "../../api/seller";
import ProductTable from "../table/SellerProducts";
import PaginationComponent from "../pagination/Pagination";
import { CiCirclePlus } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useDeleteProducts, useChangeVisibility } from "../../hooks/useAuth";
import Notification from "../notifications/Notification";
import type { AxiosError } from "axios";
import Button from "../buttons/Buttons";

interface SellerData {
  setProductData: React.Dispatch<React.SetStateAction<Datum | null>>;
  seller: Seller;
}

const SellerProducts: React.FC<SellerData> = ({ seller, setProductData }) => {
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
  };

  const {
    data: productData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();
  console.log(productData);
  const { mutateAsync: deleteProduct, isPending: deletePending } =
    useDeleteProducts();
  const { mutateAsync: changeStatus, isPending: statusPending } =
    useChangeVisibility();

  const navigate = useNavigate();
  const [viewProduct, setViewProduct] = useState(false);
  const [viewData, setViewData] = useState<Datum | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
    if (statusPending) {
      return;
    }
    try {
      showNotification("Changing Product Status", "success");
      await changeStatus({ productids: [productId], status: newStatus });
      showNotification("Product status changed.", "success");
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const data = err.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          const message = (data as { message: string }).message;
          showNotification(message, "error");
        } else {
          showNotification("Unexpected error format.", "error");
        }
      } else {
        showNotification("Network error or server is unreachable.", "error");
      }
    } finally {
      await refetch();
    }
  };

  const handleConfirmDeleteClick = (productId: string) => {
    setProductIdToDelete(productId);
    setShowConfirmDialog(true);
  };

  const executeDeleteProduct = async () => {
    if (!productIdToDelete) return;
    setShowConfirmDialog(false);
    if (deletePending) {
      return;
    }
    try {
      showNotification("Deleting Product", "success");
      await deleteProduct({ productids: [productIdToDelete] });
      showNotification("Product deleted.", "success");
      setProductIdToDelete(null);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        const data = err.response.data;
        if (typeof data === "object" && data !== null && "message" in data) {
          const message = (data as { message: string }).message;
          showNotification(message, "error");
        } else {
          showNotification("Unexpected error format.", "error");
        }
      } else {
        showNotification("Network error or server is unreachable.", "error");
      }
    } finally {
      await refetch();
    }
  };

  const handleEditProduct = async (product: Datum) => {
    navigate("/seller/editproduct", { state: { product } });
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
          <h2 className="text-xs text-gray-400 max-[780px]:hidden">
            Add, edit, or delete products to keep your catalog updated.
          </h2>
        </div>

        <div>
          <Button onClick={() => handleAddProduct()}>
            <CiCirclePlus className="size-5 max-sm:size-6" />
            <h1 className="max-sm:hidden">Add Product</h1>
          </Button>
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
            onProductDelete={handleConfirmDeleteClick}
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <p className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setProductIdToDelete(null); // Clear ID if canceled
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteProduct} // Call the function to proceed with deletion
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 ease-in-out"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SellerProducts;
