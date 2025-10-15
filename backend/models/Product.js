const mongoose = require("mongoose");

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
