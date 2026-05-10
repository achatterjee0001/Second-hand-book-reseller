import express from 'express';
import Review from '../models/Review.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { bookId } = req.query;
    let query = {};
    if (bookId) query.bookId = bookId;

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    const formatted = reviews.map(r => ({ ...r._doc, id: r._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { toUserId, bookId, rating, comment } = req.body;
    const review = new Review({
      fromUserId: req.user.id,
      toUserId,
      bookId,
      rating,
      comment
    });
    await review.save();
    res.status(201).json({ ...review._doc, id: review._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
