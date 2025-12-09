const mongoose = require("mongoose");

/**
 * Product Schema
 * @param {String} title - The title of the product
 * @param {String} description - The description of the product
 * @param {String} category - The category of the product
 * @param {String} subcategory - The subcategory of the product
 * @param {Number} price - The price of the product
 * @param {Number} stock - The stock of the product
 * @param {Array} images - The images of the product
 * @param {Date} createdAt - The creation date of the product
 * @param {Date} updatedAt - The update date of the product
 */
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, index: true },
  subcategory: { type: String, index: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/**
 * Product Index, for full-text search capabilities across title, description, and categories.
 * @param {String} title - The title of the product
 * @param {String} description - The description of the product
 * @param {String} category - The category of the product
 * @param {String} subcategory - The subcategory of the product
 */
productSchema.index(
  {
    title: "text",
    description: "text",
    category: "text",
    subcategory: "text",
  },
  {
    weights: { title: 5, description: 3, category: 2, subcategory: 1 },
  }
);

module.exports = mongoose.model("Product", productSchema);
