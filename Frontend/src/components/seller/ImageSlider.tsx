import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setCurrent((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {images.length > 0 ? (
        <>
          <img
            src={images[current]}
            alt={`Product Image ${current + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg border transition-all duration-300"
          />

          <button
            className="absolute left-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
            onClick={prev}
          >
            <FaChevronLeft />
          </button>

          <button
            className="absolute right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100 cursor-pointer"
            onClick={next}
          >
            <FaChevronRight />
          </button>
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center bg-gray-200 rounded-lg">
          No Image
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
