const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const searchRoutes = require("./routes/search");
const chatRoutes = require("./routes/chat");
const voiceRoutes = require("./routes/voice");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "5mb" }));

// static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/voice", voiceRoutes);

console.log("MONGODB_URI:", process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI)
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Initialize WebSocket server for voice agent
    const { initializeVoiceWebSocket } = require("./config/voiceWebSocket");
    initializeVoiceWebSocket(server);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
