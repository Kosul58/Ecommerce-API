import React from "react";
import { IoClose } from "react-icons/io5";
import ImageSlider from "./ImageSlider";

interface ProductData {
  viewData: {
    id: string;
    name: string;
    sellerid: string;
    price: number;
    description: string;
    category: string;
    inventory: string;
    active: boolean;
    images: string[];
  } | null;

  setViewProduct: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewProduct: React.FC<ProductData> = ({ viewData, setViewProduct }) => {
  if (!viewData) return <div>No Product Data</div>;

  return (
    <div className="w-[80vw] h-[80vh] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 flex flex-col z-10 ">
      <IoClose
        className="absolute top-4 right-4 size-8 cursor-pointer hover:text-red-500"
        onClick={() => setViewProduct(false)}
      />

      <main className="flex flex-row w-full h-[90%]">
        <div className="w-2/3 h-full flex justify-center items-center">
          {viewData.images.length > 0 ? (
            <ImageSlider images={viewData.images} />
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-gray-200 rounded-lg">
              No Image
            </div>
          )}
        </div>
        <div className="w-1/3 h-[600px] overflow-y-auto flex flex-col  items-start px-8 py-4">
          <h2 className="text-2xl font-bold mb-2">{viewData.name}</h2>
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
            {viewData.active ? <span>active</span> : <span>hidden</span>}
          </p>
        </div>
      </main>
      <div className="w-full flex justify-center items-center ">
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
          Edit Product
        </button>
      </div>
    </div>
  );
};

export default ViewProduct;
