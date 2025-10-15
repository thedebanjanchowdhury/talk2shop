import React from "react";

export default function ProductCard({ image, name, description, price }) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-4 flex items-center gap-6">
      {/* Left: Product Image */}
      <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
        <img
          src={image || "https://via.placeholder.com/150"}
          alt={name}
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* Right: Content */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">{name}</h2>
          {description && (
            <p className="text-gray-500 mt-1 text-sm md:text-base">{description}</p>
          )}
          <p className="text-base md:text-lg font-bold text-green-600 mt-2">{price}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
            Add to Cart
          </button>
          <button className="px-4 py-2 border border-gray-400 text-gray-700 rounded-xl hover:bg-gray-100 transition">
            Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}
