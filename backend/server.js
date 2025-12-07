const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");
require("dotenv").config(); // Simply load .env if present

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const searchRoutes = require("./routes/search");
const chatRoutes = require("./routes/chat");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "5mb" }));

// static uploads - might fail on vercel if dir missing, keep simple
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("api/auth", authRoutes);
app.use("api/users", userRoutes);
app.use("api/products", productRoutes);
app.use("api/cart", cartRoutes);
app.use("api/search", searchRoutes);
app.use("api/chat", chatRoutes);
app.use("api/orders", require("./routes/orders"));

// Health check
app.get("/", (req, res) => res.send("API Running. Use /api/ endpoints."));

const PORT = process.env.PORT || 5000;
console.log("MONGODB_URI Defined:", !!process.env.MONGODB_URI);

// Connect to DB if URI is present
if (process.env.MONGODB_URI) {
    connectDB(process.env.MONGODB_URI).catch(err => console.error("MongoDB Connection Error:", err));
} else {
    console.warn("MONGODB_URI is not defined in environment variables.");
}

// Start server only if running directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
