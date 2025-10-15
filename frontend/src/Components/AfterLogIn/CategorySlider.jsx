import React, { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import categories from "../../Data/categories_data.jsx";

export default function CategorySlider() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8; // scroll 80% of visible width
    if (direction === "left") {
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full md:w-4/5 mt-6 flex items-center ml-auto px-4 md:px-8">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
      >
        <FaChevronLeft />
      </button>

      {/* Category Cards */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-hidden overflow-y-hidden scroll-smooth w-full hide-scrollbar"
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="min-w-[160px] bg-neutral-200 shadow-md rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
          >
            <div className="text-3xl text-blue-500 mb-3">{cat.icon}</div>
            <h3 className="text-base font-semibold text-gray-700 text-center">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
      >
        <FaChevronRight 
        
        />
      </button>
    </div>
  );
}
