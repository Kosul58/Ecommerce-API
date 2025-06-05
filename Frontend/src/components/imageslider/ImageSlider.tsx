import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  const next = () =>
    setCurrent((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );

  return (
    <div className="relative w-full h-full flex items-center justify-center z-30">
      <img
        src={images[current]}
        alt={`Product ${current + 1}`}
        className="object-contain max-h-[300px] md:max-h-[500px] w-full rounded-lg transition duration-300"
      />

      <button
        onClick={prev}
        className="absolute left-2 md:left-4 bg-white/80 hover:bg-white p-2 rounded-full shadow transition cursor-pointer"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-2 md:right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow transition cursor-pointer"
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-4 flex gap-2 justify-center w-full">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              index === current ? "bg-blue-600" : "bg-gray-300"
            } transition`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
