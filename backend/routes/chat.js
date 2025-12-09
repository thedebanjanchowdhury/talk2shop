const express = require("express");
const router = express.Router();
const { chatWithAgent, streamChatWithAgent } = require("../services/chatService");
const auth = require("../middlewares/auth"); // Optional: add authentication if needed

/**
 * @route POST /api/chat
 * @desc Chat with agent
 * @access Private
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Chat response.
 * @returns {object} 500 - Server error.
 */
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
    
    const result = await chatWithAgent(query);
    
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
 * @route POST /api/chat/stream
 * @desc Chat with agent in stream
 * @access Private
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Chat response.
 * @returns {object} 500 - Server error.
 */
router.post("/stream", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ error: "Query is required" });
      }
  
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
  
      console.log(`[Chat Stream] Starting stream for: "${query}"`);
  
      for await (const chunk of streamChatWithAgent(query)) {
        if (chunk) {
            res.write(`data: ${JSON.stringify({ output: chunk })}\n\n`);
        }
      }
      
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
  
    } catch (error) {
      console.error("[Chat Stream] Error:", error);
      res.write(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`);
      res.end();
    }
  });

  /**
 * @route GET /api/chat/health
 * @desc Health check endpoint for chat service
 * @access Public
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Health check response.
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
