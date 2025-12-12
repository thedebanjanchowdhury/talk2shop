const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { semanticSearch } = require("../services/searchService.js");
const { TavilyClient } = require("tavily");

const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });

/**
 * @route GET /api/search/news
 * @desc Search for tech news using Tavily
 * @access Public
 */
router.get("/news", async (req, res) => {
  try {
    const { q } = req.query;
    // Force the query to be tech-related news
    const searchQuery = q ? `${q} technology news` : "latest technology news";
    
    // Perform search using Tavily
    const response = await tavily.search(searchQuery, {
      topic: "news",
      days: 7, 
      max_results: 5
    });

    res.json(response);
  } catch (error) {
    console.error("Tavily News Search Error:", error);
    res.status(500).json({ message: "Failed to fetch news", error: error.message });
  }
});

/**
 * @route GET /api/search
 * @desc Search products
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - List of products.
 * @returns {object} 500 - Server error.
 */
router.get("/", async (req, res) => {
  const q = req.query.q || "";
  const category = req.query.category || "";
  const subcategory = req.query.subcategory || "";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  if (!q) {
    const filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    const results = await Product.find(filter).skip(skip).limit(limit);
    return res.json(results);
  }

  try {
    const matches = await semanticSearch(q, {
      category,
      subcategory,
      topK: 50,
    });

    if (matches && matches.length) {
      const ids = matches.map((m) => m.id);
      const docs = await Product.find({ _id: { $in: ids } });

      // preserve order by Pinecone ranking
      const ordered = ids.map((id) =>
        docs.find((d) => d._id.toString() === id)
      );
      return res.json(ordered.slice(skip, skip + limit));
    }
    
    // If semantic search returns no results, throw error to trigger fallback
    throw new Error("No semantic matches found, falling back to text search");
  } catch (error) {
    if (error.message !== "No semantic matches found, falling back to text search") {
        console.log("Error with semantic search: ", error);
    }

    // fallback to MongoDB text search
    const results = await Product.find(
      {
        $text: { $search: q },
        ...(category ? { category } : {}),
        ...(subcategory ? { subcategory } : {}),
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    return res.json(results);
  }
});

module.exports = router;
