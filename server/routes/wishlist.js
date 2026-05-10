import express from 'express';
import Wishlist from '../models/Wishlist.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'bookId',
        populate: { path: 'sellerId', select: 'displayName email' }
      })
      .sort({ createdAt: -1 });
    const formatted = items.map(i => ({ ...i._doc, id: i._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const existing = await Wishlist.findOne({ userId: req.user.id, bookId });
    if (existing) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }
    
    const item = new Wishlist({ userId: req.user.id, bookId });
    await item.save();
    
    // Return populated item
    const populatedItem = await Wishlist.findById(item._id).populate({
      path: 'bookId',
      populate: { path: 'sellerId', select: 'displayName email' }
    });
    
    res.status(201).json({ ...populatedItem._doc, id: item._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    // Delete by wishlist item ID or book ID? Usually by wishlist item ID
    // Check if passed ID is wishlist ID
    let item = await Wishlist.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) {
      // maybe they passed bookId
      item = await Wishlist.findOne({ bookId: req.params.id, userId: req.user.id });
    }
    if (!item) return res.status(404).json({ message: 'Wishlist item not found' });
    
    await Wishlist.findByIdAndDelete(item._id);
    res.json({ message: 'Removed from wishlist', id: item._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
