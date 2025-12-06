const express = require("express");
const router = express.Router();
const { chatWithAgent, streamChatWithAgent } = require("../services/chatService");
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
            // Send chunk as a JSON string prefixed with "data: " and two newlines
            // We verify chunk is string (which we ensured in service)
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
