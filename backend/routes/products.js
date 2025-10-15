const express = require("express");
const router = express.Router();
const product = require("../models/Product");
const auth = require("../middlewares/auth");
const adminOnly = require("../middlewares/adminOnly");
const validate = require("../middlewares/validate");
const {
  createProduct,
  updateProduct,
} = require("../validators/productSchemas");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { indexProduct, semanticSearch } = require("../services/searchService");

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const name = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    cb(null, name);
  },
});
const upload = multer({ storage });

// Get product by ID (public)
router.get("/:id", async (req, res) => {
  const p = await product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

// List of products (public)
router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;
  const products = await product
    .find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  res.json(products);
});

// Semantic Search Endpoint
router.get("/semantic", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });

    const results = await semanticSearch(q, 5);

    res.json(results);
  } catch (err) {
    console.error("Semantic Search Error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

// Create product (admin)
router.post(
  "/",
  auth,
  adminOnly,
  upload.array("images", 6),
  validate(createProduct),
  async (req, res) => {
    try {
      const data = req.validated.body;
      const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
      const prod = new product({ ...data, images });
      const savedProduct = await prod.save();
      await indexProduct(savedProduct);
      savedProduct.vectorId = savedProduct._id.toString();
      await savedProduct.save();

      res.status(201).json(savedProduct);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Update product (admin)
router.put(
  "/:id",
  auth,
  adminOnly,
  upload.array("images", 6),
  validate(updateProduct),
  async (req, res) => {
    try {
      const update = req.validated.body;
      if (req.files && req.files.length) {
        update.images = (req.files || []).map((f) => `/uploads/${f.filename}`);
      }
      update.updatedAt = Date.now();

      const updatedProduct = await product.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      );

      if (updatedProduct) {
        await indexProduct(updatedProduct);
      }

      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete product (admin)
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const p = await product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    await index.deleteOne(p._id.toString());

    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
