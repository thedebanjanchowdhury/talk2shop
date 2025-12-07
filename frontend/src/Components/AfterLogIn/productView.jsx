import React, { useRef, useEffect, useState } from "react";
import BACKEND_URL from "../../config.js";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";


export default function ProductView({ categoryId, onSelectProduct }) {
  const sliderRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Re-filter products whenever categoryId or products change
  useEffect(() => {
    if (categoryId) {
      setFilteredProducts(products.filter((p) => p.category === categoryId));
    } else {
      setFilteredProducts(products);
    }
  }, [categoryId, products]);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.8;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleProductClick = (id) => {
    if (onSelectProduct) onSelectProduct(id);
  };

  const categoryName = categoryId || "All Products";

  return (
    <div className="relative bg-amber-200 w-full mt-6 px-4 md:px-8 py-6 rounded-xl shadow-sm transition-all duration-300">
      {/* Category Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">
        {categoryName}
      </h2>

      {/* Left Scroll Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100 transition"
      >
        <FaChevronLeft />
      </button>

      {/* Product List */}
      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-hidden overflow-y-hidden scroll-smooth hide-scrollbar"
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="group relative min-w-[160px] md:min-w-[200px] bg-neutral-100 shadow-md rounded-2xl p-5 flex flex-col items-center justify-center hover:scale-105 hover:shadow-lg transition-transform cursor-pointer h-60 overflow-hidden"
            >
              <div className="w-full h-32 mb-3 overflow-hidden rounded-lg">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/150"} 
                    alt={product.title} 
                    className="w-full h-full object-cover"
                  />
              </div>
              <h3 className="text-base font-semibold text-gray-700 text-center mb-2 line-clamp-2">
                {product.title}
              </h3>
              <span className="text-sm font-medium text-gray-600">
                ₹{product.price}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center w-full">
            No products found for this category.
          </p>
        )}
      </div>

      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:bg-gray-100 transition"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
