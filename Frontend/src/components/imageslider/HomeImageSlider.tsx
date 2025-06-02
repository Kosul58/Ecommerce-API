import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleRight } from "react-icons/fa";

interface SlideData {
  image: string;
  link: string;
  title: string;
  description: string;
  buttonText: string;
}

interface ImageSliderProps {
  slides: SlideData[];
  interval?: number;
}

const HomeImageSlider: React.FC<ImageSliderProps> = ({
  slides,
  interval = 3000,
}) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const prev = () =>
    setCurrent((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );

  const next = () =>
    setCurrent((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );

  useEffect(() => {
    const slider = setInterval(() => {
      next();
    }, interval);
    return () => clearInterval(slider);
  }, [current, interval]);

  const currentSlide = slides[current];

  return (
    <div
      className="relative w-full h-[88vh] min-h-[400px] flex items-center justify-center text-white"
      style={{
        backgroundImage: `url(${currentSlide.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="absolute bottom-16 left-8 z-10 text-left max-w-xl px-6">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          {currentSlide.title}
        </h2>
        <p className="text-lg md:text-xl mb-6">{currentSlide.description}</p>
        <button
          onClick={() => navigate(currentSlide.link)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition flex gap-2 justify-center items-center cursor-pointer "
        >
          {currentSlide.buttonText} <FaArrowCircleRight />
        </button>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow-md hover:bg-white z-10 cursor-pointer"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/70 text-black p-2 rounded-full shadow-md hover:bg-white z-10 cursor-pointer"
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-6 flex gap-2 z-10">
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeImageSlider;
