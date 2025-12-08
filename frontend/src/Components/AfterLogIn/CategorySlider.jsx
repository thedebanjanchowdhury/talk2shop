import React, { useRef, useEffect, useState } from "react";
import BACKEND_URL from "../../config.js";
import { FaChevronLeft, FaChevronRight, FaKeyboard, FaMouse, FaVolumeUp, FaHeadphones, FaBox, FaMicrochip, FaHdd, FaBolt, FaFan, FaQuestion } from "react-icons/fa";
import { MdMonitor } from "react-icons/md";

const iconMapping = {
  "Keyboards": <FaKeyboard />,
  "Mouse": <FaMouse />,
  "Monitor": <MdMonitor />,
  "Speaker": <FaVolumeUp />,
  "Headphones": <FaHeadphones />,
  "Cabinets": <FaBox />,
  "GPU": <FaFan />,
  "CPU": <FaMicrochip />,
  "Power Supply": <FaBolt />,
  "Storage": <FaHdd />,
  "Processor": <FaMicrochip />,
};

export default function CategorySlider({ onCategorySelect }) {
  const sliderRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState([]);

  const checkScreenSize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (category) => {
    console.log("Clicked Category:", category);
    if (onCategorySelect) onCategorySelect(category);
  };

  return (
    <div className="relative w-full mt-6 flex items-center px-4">
      {isMobile && (
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
        >
          <FaChevronLeft />
        </button>
      )}

      <div
        ref={sliderRef}
        className={`flex gap-6 w-full ${
          isMobile
            ? "overflow-x-auto scroll-smooth hide-scrollbar"
            : "overflow-x-hidden justify-between"
        }`}
      >
        <div
            onClick={() => handleCategoryClick(null)}
            className="flex-shrink-0 flex-1 bg-neutral-200 shadow-md rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer min-w-[120px]"
          >
            <div className="text-3xl text-blue-500 mb-3"><FaBox /></div>
            <h3 className="text-sm font-semibold text-gray-700 text-center">
              All
            </h3>
        </div>
        {categories.map((cat, index) => (
          <div
            key={index}
            onClick={() => handleCategoryClick(cat)}
            className="flex-shrink-0 flex-1 bg-neutral-200 shadow-md rounded-2xl p-6 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer min-w-[120px]"
          >
            <div className="text-3xl text-blue-500 mb-3">{iconMapping[cat] || <FaQuestion />}</div>
            <h3 className="text-sm font-semibold text-gray-700 text-center">
              {cat}
            </h3>
          </div>
        ))}
      </div>

      {isMobile && (
        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 -translate-y-1/2 right-2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
}
