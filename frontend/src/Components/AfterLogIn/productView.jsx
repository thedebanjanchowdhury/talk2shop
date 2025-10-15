import React, { useRef } from "react";
import { FaKeyboard, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "../AfterLogIn/ProductCard.jsx";

// Sample product data
const products = [
  { id: 1, name: "Corsair K70 RGB MK.2", price: "$149.99", icon: <FaKeyboard /> },
  { id: 2, name: "Razer BlackWidow V3", price: "$129.99", icon: <FaKeyboard /> },
  { id: 3, name: "Logitech G915 TKL", price: "$199.99", icon: <FaKeyboard /> },
  { id: 4, name: "SteelSeries Apex Pro", price: "$179.99", icon: <FaKeyboard /> },
  { id: 5, name: "HyperX Alloy FPS Pro", price: "$89.99", icon: <FaKeyboard /> },
  { id: 6, name: "Cooler Master CK552", price: "$79.99", icon: <FaKeyboard /> },
  { id: 7, name: "Ducky One 2 Mini", price: "$109.99", icon: <FaKeyboard /> },
  { id: 8, name: "Keychron K8 Wireless", price: "$99.99", icon: <FaKeyboard /> },
  { id: 9, name: "Roccat Vulcan 121 AIMO", price: "$149.99", icon: <FaKeyboard /> },
  { id: 10, name: "ASUS ROG Strix Scope", price: "$129.99", icon: <FaKeyboard /> },
  { id: 11, name: "Fnatic Streak65", price: "$119.99", icon: <FaKeyboard /> },
  { id: 12, name: "Varmilo VA87M", price: "$139.99", icon: <FaKeyboard /> },
  { id: 13, name: "Akko 3084 Silent", price: "$89.99", icon: <FaKeyboard /> },
  { id: 14, name: "Logitech G Pro X", price: "$149.99", icon: <FaKeyboard /> },
  { id: 15, name: "Razer Huntsman Mini", price: "$119.99", icon: <FaKeyboard /> },
  { id: 16, name: "Corsair K100 RGB", price: "$229.99", icon: <FaKeyboard /> },
  { id: 17, name: "Keychron K6 Hot-swappable", price: "$79.99", icon: <FaKeyboard /> },
  { id: 18, name: "HyperX Alloy Origins", price: "$139.99", icon: <FaKeyboard /> },
  { id: 19, name: "Cooler Master SK621", price: "$109.99", icon: <FaKeyboard /> },
  { id: 20, name: "Ducky One 3 SF", price: "$149.99", icon: <FaKeyboard /> },
];

export default function ProductView() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    if (direction === "left") {
      sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-amber-200 w-full md:w-4/5 mt-6 ml-auto px-4 md:px-8 py-6">
      {/* Section Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Keyboard Products</h2>

      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
      >
        <FaChevronLeft />
      </button>

      {/* Products Slider */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-hidden overflow-y-hidden scroll-smooth hide-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative min-w-[160px] md:min-w-[200px] bg-neutral-200 shadow-md rounded-2xl p-5 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer h-60 overflow-hidden"
          >
            {/* Normal state content */}
            <div className="text-3xl text-blue-500 mb-3">{product.icon}</div>
            <h3 className="text-base font-semibold text-gray-700 text-center mb-2">
              {product.name}
            </h3>
            <span className="text-sm font-medium text-gray-600">{product.price}</span>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-200"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
