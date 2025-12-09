const mongoose = require("mongoose");

/**
 * Cart Item Schema
 * @param {Object} product - The product object
 * @param {Number} quantity - The quantity of the product
 */
const cartItem = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

/**
 * Cart Schema
 * @param {Object} user - The user object
 * @param {String} name - The name of the cart
 * @param {Array} items - The items in the cart
 * @param {Date} createdAt - The creation date of the cart
 */
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, default: "Cart" },
  items: [cartItem],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cart", cartSchema);
