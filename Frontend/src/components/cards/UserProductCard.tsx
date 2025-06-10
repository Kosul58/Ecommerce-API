import React from "react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  timestamp: string;
  price: number;
  inventory: number;
  images: string[];
  discount?: number;
}

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const placeholder = `https://via.placeholder.com/400x300?text=${
    product.name ? product.name.replace(/\s/g, "+") : "Product"
  }+Image`;

  const discountedPrice =
    product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden flex flex-col max-w-[400px] h-fit"
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
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-lg font-semibold text-gray-800 truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <h3 className="text-md text-gray-600 truncate" title={product.category}>
          {product.category}
        </h3>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-gray-700 font-bold text-xl flex  flex-col">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="line-through text-gray-500 text-xs mr-1">
                  Rs. {product.price.toLocaleString()}
                </span>
                <span> Rs. {discountedPrice.toLocaleString()}</span>
              </>
            ) : (
              `Rs. ${product.price.toLocaleString()}`
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
