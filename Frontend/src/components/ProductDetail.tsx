import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAllProducts } from "../hooks/useAuth";
import type { Product } from "../hooks/useAuth";

const ProductDetail = () => {
  const { pid } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useAllProducts();
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl">
        Loading product details...
      </div>
    );
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-600 mt-10">
        Failed to load product. Please try again.
      </div>
    );
  }

  const product = products.find((p: Product) => p.id === pid);

  if (!product) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Product not found.
        <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <section className="p-6 sm:p-10 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2">
          <img
            src={
              product.images[0] ||
              "https://via.placeholder.com/400x300?text=No+Image"
            }
            alt={product.name}
            className="rounded-lg shadow-md w-full h-auto object-cover"
          />
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.name}
          </h1>
          <p className="text-gray-600 text-md mb-6">{product.description}</p>
          <p className="text-2xl text-blue-700 font-bold mb-2">
            Rs. {product.price.toLocaleString()}
          </p>
          <p className="text-md mb-4">
            {product.inventory > 0 ? (
              <span className="text-green-600">
                In Stock: {product.inventory}
              </span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 m-2"
          >
            ← Back to Products
          </button>
          <button className="mt-6 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 m-2">
            Add to Cart +
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;
