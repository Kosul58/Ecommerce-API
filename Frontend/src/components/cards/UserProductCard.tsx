import React from "react";
import { Link } from "react-router-dom";
import { FaTag } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  timestamp: string;
  price: number;
  inventory: number;
  images: string[];
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const isInStock = product.inventory > 0;
  const productYear = new Date(product.timestamp).getFullYear().toString();
  const placeholder = `https://via.placeholder.com/400x300?text=${
    product.name ? product.name.replace(/\s/g, "+") : "Product"
  }+Image`;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col"
      role="article"
      aria-label={`View details of ${product.name}`}
    >
      <div className="aspect-video w-full bg-gray-100 overflow-hidden relative">
        <img
          src={product.images?.[0] || placeholder}
          alt={product.name || "Product image"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!isInStock && (
          <div className="absolute inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center z-10">
            <span className="text-white text-lg font-semibold animate-pulse">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          <FaTag className="inline-block mr-1" />
          {product.category}
        </div>
        <div className="absolute bottom-3 right-3 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold opacity-90">
          {productYear}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-lg font-semibold text-gray-800 truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-3 mb-3 flex-grow">
          {product.description}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-blue-700 font-bold text-xl">
            Rs. {product.price.toLocaleString()}
          </span>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              isInStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isInStock ? `In Stock: ${product.inventory}` : "Out of Stock"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
