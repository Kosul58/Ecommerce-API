import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllProducts, useAddCart } from "../hooks/useAuth";
import type { Product } from "../hooks/useAuth";
import { IoIosAddCircleOutline } from "react-icons/io";
import ImageSlider from "./imageslider/ImageSlider";
import NavBar from "./navbar/Navbar";

const ProductDetail = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useAllProducts();
  const {
    mutate: addToCart,
    isPending,
    isSuccess,
    isError: isAddError,
  } = useAddCart();
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Loading product details...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-600 mt-10 text-lg font-medium">
        Failed to load product. Please try again later.
      </div>
    );
  }

  const product = products.find((p: Product) => p.id === pid);

  if (!product) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p className="text-2xl font-semibold mb-4">Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : ["https://via.placeholder.com/400x300?text=No+Image"];

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(
      1,
      Math.min(product.inventory, Number(e.target.value))
    );
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (product && product.id && quantity > 0) {
      addToCart({ productid: product.id, quantity });
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        <NavBar />
      </div>

      <section className="p-6 sm:p-12 bg-white max-h-screen">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 h-fit relative rounded-lg shadow-lg overflow-hidden z-30">
            <ImageSlider images={images} />
          </div>
          <div className="md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                {product.name}
              </h1>

              <p className="text-gray-700 text-lg leading-relaxed mb-6 whitespace-pre-line">
                {product.description}
              </p>

              <p className="text-3xl font-extrabold text-blue-700 mb-6">
                Rs. {product.price.toLocaleString()}
              </p>

              <div className="text-lg mb-6">
                {product.inventory > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock: {product.inventory}
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-3 mb-4">
                <label htmlFor="quantity" className="font-medium text-gray-700">
                  Quantity:
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.inventory}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-20 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={product.inventory <= 0}
                />
              </div>

              {/* Feedback */}
              {isSuccess && (
                <p className="text-green-600 font-medium mb-2">
                  Added to cart successfully!
                </p>
              )}
              {isAddError && (
                <p className="text-red-500 font-medium mb-2">
                  Failed to add to cart. Try again.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5 items-center mt-6">
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition font-medium shadow-md"
              >
                ← Back to Products
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.inventory <= 0 || isPending}
                className={`px-8 py-3 rounded-lg transition font-semibold shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  product.inventory > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                {isPending ? "Adding..." : "Add to Cart"}
                {!isPending && <IoIosAddCircleOutline size={20} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetail;
