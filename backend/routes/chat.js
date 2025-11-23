const express = require("express");
const router = express.Router();
const { chatWithAgent } = require("../services/chatService");
const auth = require("../middlewares/auth"); // Optional: add authentication if needed

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate query
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ 
        error: "Query is required and must be a non-empty string" 
      });
    }

    console.log(`[Chat API] Received query: "${query}"`);
    
    // Call the chat agent
    const result = await chatWithAgent(query);
    
    // Check for errors in the result
    if (result.error) {
      console.error("[Chat API] Agent returned error:", result.error);
      return res.status(500).json(result);
    }

    console.log(`[Chat API] Agent response received`);
    res.json(result);
    
  } catch (error) {
    console.error("[Chat API] Endpoint error:", error);
    res.status(500).json({ 
      error: "Failed to process chat request",
      details: error.message 
    });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint for chat service
 */
router.get("/health", (req, res) => {
  const hasGroqKey = !!process.env.GROQ_API_KEY;
  const hasTavilyKey = !!process.env.TAVILY_API_KEY;
  
  res.json({
    status: "ok",
    service: "chat",
    dependencies: {
      groq: hasGroqKey ? "configured" : "missing",
      tavily: hasTavilyKey ? "configured" : "missing"
    }
  });
});

module.exports = router;
