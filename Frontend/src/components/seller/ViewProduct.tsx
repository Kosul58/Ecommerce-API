import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import ImageSlider from "./ImageSlider";
import type { Datum } from "../../types/sellertypes";
import EditProduct from "./EditProduct";

interface ProductData {
  viewData: Datum;
  setViewProduct: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewProduct: React.FC<ProductData> = ({ viewData, setViewProduct }) => {
  const [editMode, setEditMode] = useState(false);
  const [productData, setProductData] = useState(viewData);
  if (!productData) return <div>No Product Data</div>;

  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-[85vh] max-h-[85vh] max-md:min-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="relative h-full flex flex-col md:flex-row">
          <IoClose
            className="absolute top-4 right-4 size-8 text-gray-600 hover:text-red-500 cursor-pointer z-10"
            onClick={() => setViewProduct(false)}
          />

          <div className="w-full md:w-2/3 h-[300px] md:h-auto flex justify-center items-center bg-gray-50 p-4">
            {productData.images.length > 0 ? (
              <ImageSlider images={productData.images} />
            ) : (
              <div className="w-full h-full flex justify-center items-center bg-gray-200 rounded-lg text-gray-600">
                No Image
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 overflow-y-auto px-6 py-4">
            <h2 className="text-2xl font-bold mb-3">{productData.name}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Category:</strong> {productData.category}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Price:</strong> Rs. {productData.price}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Inventory:</strong> {productData.inventory}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Description:</strong> {productData.description}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Status:</strong>
              <span
                className={`ml-2 font-semibold ${
                  productData.active ? "text-green-600" : "text-red-500"
                }`}
              >
                {productData.active ? "Active" : "Hidden"}
              </span>
            </p>

            {!editMode && (
              <button
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                onClick={() => setEditMode(true)}
              >
                Edit Product
              </button>
            )}
          </div>
        </div>
      </div>
      {editMode && (
        <EditProduct
          product={productData}
          onClose={() => setEditMode(false)}
          onSave={(updatedProduct) => {
            setProductData(updatedProduct);
          }}
        />
      )}
    </>
  );
};

export default ViewProduct;
