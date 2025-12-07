import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config.js";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ productId, onAddToCart, onBuyNow }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/products/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching product:", err);
          setLoading(false);
        });
    } else {
      setProduct(null);
    }
  }, [productId]);

  if (!productId) {
    return (
      <div className="text-center text-gray-500 py-10">
        Select a product to view details.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-10">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-red-500 py-10">
        Product not found. (ID: {productId})
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 bg-white font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* --- Left: Product Details --- */}
        <div className="space-y-6">
          <div className="text-sm text-gray-500">
            Electronics / {product.category || "Category"}
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900">
            {product.title}
          </h1>

          <div className="flex items-center space-x-3">
            <div className="flex text-yellow-500">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.487 6.91l6.572-.955L10 0l2.941 5.955 6.572.955-4.758 4.635 1.123 6.545z" />
                  </svg>
                ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.reviews || 0} reviews
            </span>
          </div>

          <div className="text-3xl font-bold text-gray-900">
            ₹{product.price}
          </div>

          <p className="text-gray-600 leading-relaxed max-w-lg">
            {product.description || "No description available."}
          </p>

          {product.stock > 0 ? (
            <div className="flex items-center text-green-600 font-medium">
              ✅ In stock and ready to ship
            </div>
          ) : (
            <div className="text-red-600 font-medium">Out of stock</div>
          )}

          {/* ✅ Add to Cart Button */}
          <div className="pt-4 flex space-x-4">
            <button
              className="flex items-center justify-center px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150"
              onClick={() => onAddToCart && onAddToCart(product)} // ✅ Add to cart array
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>

            <button
              className="flex-1 max-w-xs flex items-center justify-center px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150"
              onClick={() => onBuyNow && onBuyNow(product)} // Trigger Buy Now
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* --- Right: Product Image --- */}
        <div className="flex justify-center items-center">
          <div className="w-full max-w-md p-4 bg-gray-50 rounded-xl shadow-inner">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/400"}
              alt={product.title}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
