import React from "react";
import { IoClose } from "react-icons/io5";
import ImageSlider from "../imageslider/ImageSlider";
import type { Datum } from "../../types/sellertypes";
import type { Section } from "../../pages/SellerDashboard";

interface ProductData {
  viewData: Datum;
  setViewProduct: React.Dispatch<React.SetStateAction<boolean>>;
  onEdit: (key: Section) => void;
}

const ViewProduct: React.FC<ProductData> = ({
  viewData,
  setViewProduct,
  onEdit,
}) => {
  if (!viewData) return <div>No Product Data</div>;

  return (
    <>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-6xl h-[85vh] max-h-[85vh] max-md:min-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="relative h-full flex flex-col md:flex-row">
          <IoClose
            className="absolute top-4 right-4 size-8 rounded-full text-black bg-red-200 hover:bg-red-500 cursor-pointer z-10"
            onClick={() => setViewProduct(false)}
          />

          <div className="w-full md:w-2/3 h-[300px] md:h-auto flex justify-center items-center bg-gray-50 p-4">
            {viewData.images.length > 0 ? (
              <ImageSlider images={viewData.images} />
            ) : (
              <div className="w-full h-full flex justify-center items-center bg-gray-200 rounded-lg text-gray-600">
                No Image
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 overflow-y-auto px-6 py-4">
            <h2 className="text-2xl font-bold mb-3">{viewData.name}</h2>
            <p className="text-gray-700 mb-1">
              <strong>Category:</strong> {viewData.category}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Price:</strong> Rs. {viewData.price}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Inventory:</strong> {viewData.inventory}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Description:</strong> {viewData.description}
            </p>
            <p className="text-gray-700 mb-3">
              <strong>Status:</strong>
              <span
                className={`ml-2 font-semibold ${
                  viewData.active ? "text-green-600" : "text-red-500"
                }`}
              >
                {viewData.active ? "Active" : "Hidden"}
              </span>
            </p>
            <button
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              onClick={() => {
                onEdit("editProduct");
                setViewProduct(false);
              }}
            >
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProduct;
