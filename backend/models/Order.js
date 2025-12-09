const mongoose = require('mongoose');

/**
 * Order Schema
 * @param {Object} user - The user object, linked from user model
 * @param {Array} items - The items in the order, linked from product model
 * @param {Object} shippingDetails - The shipping details
 * @param {String} paymentMethod - The payment method
 * @param {Number} totalAmount - The total amount
 * @param {String} status - The status of the order
 * @param {Date} createdAt - The creation date of the order
 */
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  /**
   * Shipping Details
   * @param {String} fullName - The full name of the shipping address
   * @param {String} email - The email of the shipping address
   * @param {String} phone - The phone number of the shipping address
   * @param {String} address - The address of the shipping address
   * @param {String} city - The city of the shipping address
   * @param {String} zip - The zip code of the shipping address
   * @param {String} country - The country of the shipping address
   */
  shippingDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['cod'], 
    default: 'cod'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'dispatched'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
