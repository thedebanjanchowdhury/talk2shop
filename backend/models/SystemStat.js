const mongoose = require("mongoose");

const systemStatSchema = new mongoose.Schema({
  docId: { type: String, default: "stats_v1", unique: true }, // Singleton document
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SystemStat", systemStatSchema);
