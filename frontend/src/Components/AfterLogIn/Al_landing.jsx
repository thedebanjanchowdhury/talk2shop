import React, { useState } from "react";
import API_BASE_URL from "../../config.js";
import ProductView from "./productView.jsx";
import CategorySlider from "./CategorySlider";
import Design from "../Essentaial/Design.jsx";
import ProductCard from "./ProductCard.jsx";
import Chatbot from "./Chatbot.jsx";
import OrderSummary from "./OrderSummary.jsx";

export default function Al_landing({ handleProfile, handleCheckout }) {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // 👈 Add state for category
  // when a product is clicked in ProductView
  const handleProductSelect = (id) => {
    setSelectedProductId(id);
  };

  // when “Add to Cart” is clicked in ProductCard
  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login to add items to cart");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: product._id,
          quantity: 1, // Default quantity
        }),
      });

      if (response.ok) {
        alert("Item added to cart!");
        // Optionally trigger cart refresh or open cart here if we had access to those functions
      } else {
        const errorData = await response.json();
        alert(`Failed to add to cart: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart");
    }
  };

  return (
    <div>
      <Design />


      <CategorySlider onCategorySelect={setSelectedCategory} />

      {/* ProductView passes productId to ProductCard */}
      <ProductView 
        categoryId={selectedCategory} 
        onSelectProduct={handleProductSelect} 
      />

      <ProductCard
        productId={selectedProductId}
        onAddToCart={handleAddToCart} 
        onBuyNow={handleCheckout}
      />
      <Chatbot />
    </div>
  );
}
