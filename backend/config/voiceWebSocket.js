const WebSocket = require("ws");
const { handleVoiceConnection } = require("../services/voiceAgentService");

/**
 * Initialize WebSocket server for voice agent
 * @param {http.Server} server - HTTP server instance
 * @returns {WebSocket.Server} WebSocket server instance
 */
function initializeVoiceWebSocket(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: "/api/voice/ws"
  });

  wss.on("connection", (ws, req) => {
    console.log(`[Voice WebSocket] New connection from ${req.socket.remoteAddress}`);
    handleVoiceConnection(ws);
  });

  wss.on("error", (error) => {
    console.error("[Voice WebSocket] Server error:", error);
  });

  console.log("[Voice WebSocket] WebSocket server initialized at /api/voice/ws");
  
  return wss;
}

module.exports = { initializeVoiceWebSocket };
