const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create a new order
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

    // Optional: Clear user's cart after successful order if it wasn't a "Buy Now" (single item)
    // For now, we can just clear the cart regardless or let the frontend handle it.
    // A robust implementation would check if this order came from the cart.
    // Let's assume typical flow clears cart.
    await Cart.findOneAndDelete({ user: req.user.id });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('items.product');
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// --- Admin Routes ---

// Get all orders (Admin only)
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

// Update order status (Admin only)
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

// Delete order (Admin only)
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
