// src/Data/cart_data.jsx
export let cartData = [];

// Function to add product to cart
export const addToCart = (product) => {
  const exists = cartData.find((item) => item.p_id === product.p_id);
  if (!exists) {
    cartData.push(product);
    console.log("🛒 Product added to cart:", product.name);
  } else {
    console.log("⚠️ Product already in cart:", product.name);
  }

  console.log("🧾 Current cart:", cartData);
};

// Function to clear cart (optional)
export const clearCart = () => {
  cartData = [];
  console.log("🧹 Cart cleared!");
};
