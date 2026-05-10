import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate('bookId')
      .populate('sellerId', 'displayName email')
      .sort({ createdAt: -1 });
    
    const formatted = orders.map(o => ({ ...o._doc, id: o._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { bookId, amount, shippingAddress, sellerId } = req.body;
    
    const order = new Order({
      buyerId: req.user.id,
      sellerId,
      bookId,
      amount,
      shippingAddress
    });
    
    await order.save();

    // Update book status to sold
    await Book.findByIdAndUpdate(bookId, { status: 'sold' });

    // Update loyalty points
    await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyPoints: 10 } });

    res.status(201).json({ ...order._doc, id: order._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes
router.get('/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'displayName email')
      .populate('sellerId', 'displayName email')
      .populate('bookId', 'title price')
      .sort({ createdAt: -1 });
    const formatted = orders.map(o => ({ ...o._doc, id: o._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
