const SystemStat = require("../models/SystemStat");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

/**
 * Ensures the stats document exists. If not, creates it with initial calculations.
 */
async function ensureStats() {
    let stats = await SystemStat.findOne({ docId: "stats_v1" });
    if (!stats) {
        // Initial Calculation (expensive but one-time)
        console.log("Initializing System Stats...");
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments({ isAdmin: false }); // Only customers
        const orders = await Order.find({}, 'totalAmount status'); // Fetch minimal fields
        
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        stats = await SystemStat.create({
            docId: "stats_v1",
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue
        });
        console.log("System Stats Initialized:", stats);
    }
    return stats;
}

/**
 * Increment or decrement stats safely.
 * @param {string} field - 'totalProducts', 'totalUsers', 'totalOrders', 'totalRevenue'
 * @param {number} amount - Positive to increment, negative to decrement
 */
async function updateStat(field, amount) {
    try {
        await SystemStat.findOneAndUpdate(
            { docId: "stats_v1" },
            { $inc: { [field]: amount }, lastUpdated: Date.now() },
            { upsert: true, new: true }
        );
    } catch (err) {
        console.error(`Failed to update stat ${field}:`, err);
    }
}

/**
 * Get current stats.
 */
async function getStats() {
    try {
        let stats = await SystemStat.findOne({ docId: "stats_v1" });
        if (!stats) {
            stats = await ensureStats();
        }
        return stats;
    } catch (err) {
        console.error("Failed to get stats:", err);
        return { totalProducts: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 };
    }
}

module.exports = { ensureStats, updateStat, getStats };
