import React from "react";
import type { Datum } from "../../types/sellertypes";
import ProductIndicator from "../seller/ProductIndicator";

interface ProductCardProps {
  product: Datum;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full  max-md:w-[200px] max-lg:w-[260px] xl:w-[300px] rounded-lg m-4 bg-white shadow-lg overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:scale-101 relative max-w-[300px]"
    >
      <ProductIndicator active={product.active} />
      {product.images.length > 0 && (
        <div className="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className="p-4 relative">
        <h2 className="font-semibold text-lg text-gray-800 truncate">
          {product.name}
        </h2>
        <p className="text-sm text-gray-500 truncate">
          Category: {product.category}
        </p>

        <div className="flex justify-between mt-4 text-sm font-medium text-gray-700">
          <p>Inventory: {product.inventory}</p>
          <p>Rs. {product.price}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
