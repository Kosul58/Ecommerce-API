import React, { useEffect, useState } from "react";
import { FaDollarSign, FaBoxes } from "react-icons/fa";
import { MdDescription } from "react-icons/md";
import { BiCategory } from "react-icons/bi";

interface ProductCardProps {
  name: string;
  price: number;
  inventory: number;
  discount: number;
  category: string;
  description: string;
  imageUrls?: string[];
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  inventory,
  discount,
  category,
  description,
  imageUrls,
}) => {
  const [displayImageUrl, setDisplayImageUrl] = useState("");

  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      setDisplayImageUrl(imageUrls[0]);
    } else {
      setDisplayImageUrl("");
    }
  }, [imageUrls]);

  const discountedPrice = price - (price * discount) / 100;

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Area */}
      <div className="relative h-52 bg-gray-100">
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={name || "Product Image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
            No Image
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 truncate" title={name}>
          {name || "Product Name"}
        </h3>

        <div className="flex items-center text-sm text-gray-600">
          <BiCategory className="mr-2 text-base" />
          <span>
            <span className="font-semibold">Category:</span> {category || "N/A"}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <FaBoxes className="mr-2 text-base" />
          <span>
            <span className="font-semibold">In Stock:</span>{" "}
            {inventory > 0 ? inventory : "0"} units
          </span>
        </div>

        <div className="flex items-start text-sm text-gray-600">
          <MdDescription className="mr-2 mt-1 text-base" />
          <p className="line-clamp-3" title={description}>
            {description || "No description provided."}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="flex items-baseline space-x-1">
            <FaDollarSign className="text-gray-700 text-sm" />
            {discount > 0 ? (
              <>
                <span className="text-sm line-through text-gray-400">
                  {price.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-green-600">
                  {discountedPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-800">
                {price > 0 ? price.toFixed(2) : "0.00"}
              </span>
            )}
          </div>

          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition">
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
