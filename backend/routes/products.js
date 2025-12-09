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
const cloudinary = require("../config/cloudinary");
const { indexProduct, semanticSearch, deleteProductVector } = require("../services/searchService");

// Multer memory storage (no disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });



const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products", public_id: filename },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

/**
 * @route GET /api/products/categories
 * @desc Get distinct categories
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Distinct categories.
 * @returns {object} 500 - Server error.
 */
router.get("/categories", async (req, res) => {
  try {
    const categories = await product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/products/semantic
 * @desc Semantic search
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Search results.
 * @returns {object} 500 - Server error.
 */
router.get("/semantic", async (req, res) => {
  try {
    const { q, category, subcategory, topK } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });

    const results = await semanticSearch(q, {
      category,
      subcategory,
      topK: Number(topK) || 5,
    });

    const ids = results.map((r) => r.id);
    const products = await product.find({ _id: { $in: ids } });

    // Fetch full product details for the IDs returned by the semantic search, then merge with scores
    const finalResults = results
      .map((r) => {
        const p = products.find((prod) => prod._id.toString() === r.id);
        return p ? { ...p.toObject(), score: r.score } : null;
      })
      .filter((item) => item !== null);

    res.json({ query: q, count: finalResults.length, results: finalResults });
  } catch (err) {
    console.error("Semantic Search Error:", err);
    res.status(500).json({ message: `Search failed: ${err.message}` });
  }
});

/**
 * @route GET /api/products/text-search
 * @desc Text search (Hybrid)
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Search results.
 * @returns {object} 500 - Server error.
 */
router.get("/text-search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });
    try {
        await require("../config/db")(process.env.MONGODB_URI);
    } catch (dbErr) {
        console.error("Route Connection Error:", dbErr);
        return res.status(500).json({ message: "Database connection failed" });
    }
    const searchRegex = new RegExp(q, 'i'); 


    
    const results = await product.find({
        $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { subcategory: searchRegex }
        ]
    })
    .select("title description category subcategory price images stock") // Only needed fields
    .limit(10); // Limit at database level

    res.json(results);

  } catch (err) {
    console.error("Text Search Error:", err);
    res.status(500).json({ message: `Search failed: ${err.message}` });
  }
});

/**
 * @route GET /api/products
 * @desc Get list of products (Pagination)
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - List of products.
 * @returns {object} 500 - Server error.
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const products = await product
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/products/stats
 * @desc Get product statistics (count)
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Product stats.
 * @returns {object} 500 - Server error.
 */
router.get("/stats", async (req, res) => {
    try {
        const total = await product.countDocuments();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 2. DYNAMIC / WILDCARD ROUTES (Must come LAST)
// ==========================================

/**
 * @route GET /api/products/:id
 * @desc Get product by ID
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Product.
 * @returns {object} 404 - Product not found.
 * @returns {object} 500 - Server error.
 */
router.get("/:id", async (req, res) => {
  try {
    const p = await product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// 3. POST / PUT / DELETE ROUTES
// ==========================================

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 201 - New product object.
 * @returns {object} 400 - No files uploaded.
 * @returns {object} 500 - Server error.
 */
router.post(
  "/",
  auth,
  adminOnly,
  upload.array("images", 6),
  validate(createProduct),
  async (req, res) => {
    try {
      const data = req.validated.body;

      // Upload each file buffer to Cloudinary
      const images = [];
      for (const file of req.files || []) {
        const url = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products", public_id: Date.now().toString() },
            (err, result) => (err ? reject(err) : resolve(result.secure_url))
          );
          stream.end(file.buffer);
        });
        images.push(url);
      }

      const prod = new product({ ...data, images });
      const savedProduct = await prod.save();
      await indexProduct(savedProduct);
      savedProduct.vectorId = savedProduct._id.toString();
      await savedProduct.save();

      res.status(201).json(savedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route PUT /api/products/:id
 * @desc Update a product
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Updated product object.
 * @returns {object} 404 - Product not found.
 * @returns {object} 500 - Server error.
 */
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
        const existing = await product.findById(req.params.id);

        // Delete old images from Cloudinary
        if (existing?.images) {
          for (const url of existing.images) {
            const parts = url.split("/");
            const publicIdWithExt = parts.slice(-1)[0];
            const publicId = `products/${publicIdWithExt.split(".")[0]}`;
            await cloudinary.uploader.destroy(publicId);
          }
        }

        // Upload new images
        const images = [];
        for (const file of req.files) {
          const url = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products", public_id: Date.now().toString() },
              (err, result) => (err ? reject(err) : resolve(result.secure_url))
            );
            stream.end(file.buffer);
          });
          images.push(url);
        }
        update.images = images;
      }

      update.updatedAt = Date.now();
      const updatedProduct = await product.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      );

      if (updatedProduct) await indexProduct(updatedProduct);
      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route DELETE /api/products/:id
 * @desc Delete a product
 * @access Private
 * @middleware auth - Ensures the user is authenticated.
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Product deleted successfully.
 * @returns {object} 404 - Product not found.
 * @returns {object} 500 - Server error.
 */
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const p = await product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });

    // Remove images from Cloudinary
    if (p.images) {
      for (const url of p.images) {
        const parts = url.split("/");
        const publicIdWithExt = parts.slice(-1)[0];
        const publicId = `products/${publicIdWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await deleteProductVector(p._id.toString());
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;