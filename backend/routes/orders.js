const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { updateStat } = require('../services/statsService');

/**
 * @route POST /api/orders
 * @desc Create a new order
 * @access Private
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 201 - New order object.
 * @returns {object} 400 - No items in order.
 * @returns {object} 500 - Server error.
 */
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingDetails, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const order = new Order({
      user: req.user.id,
      items: items.map(item => ({
        product: item.id || item._id, // Handle both id formats
        quantity: item.quantity,
        price: item.price
      })),
      shippingDetails,
      paymentMethod,
      totalAmount,
      status: 'pending'
    });

    const savedOrder = await order.save();
    
    // Update dashboard stats
    await updateStat('totalOrders', 1);
    await updateStat('totalRevenue', totalAmount);

    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

/**
 * @route GET /api/orders/my-orders
 * @desc Get user's orders
 * @access Private
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - User's orders.
 * @returns {object} 500 - Server error.
 */
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

/**
 * @route GET /api/orders/admin/all
 * @desc Get all orders (Admin only)
 * @access Private
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - All orders.
 * @returns {object} 500 - Server error.
 */
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Admin fetch orders error:", error);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
});

/**
 * @route PUT /api/orders/admin/:id/status
 * @desc Update order status (Admin only)
 * @access Private
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Updated order.
 * @returns {object} 500 - Server error.
 */
router.put('/admin/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Admin update status error:", error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

/**
 * @route DELETE /api/orders/admin/:id
 * @desc Delete order (Admin only)
 * @access Private
 * @middleware adminOnly - Ensures the user is an admin.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {object} 200 - Order deleted successfully.
 * @returns {object} 500 - Server error.
 */
router.delete('/admin/:id', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error("Admin delete order error:", error);
    res.status(500).json({ message: 'Server error deleting order' });
  }
});

module.exports = router;
