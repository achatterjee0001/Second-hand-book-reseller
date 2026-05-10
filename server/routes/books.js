import express from 'express';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { sellerId, search, status, genre } = req.query;
    let query = {};
    if (sellerId) query.sellerId = sellerId;
    if (status) query.status = status;
    if (genre) query.genre = genre;
    if (search) query.title = { $regex: search, $options: 'i' };

    const books = await Book.find(query).populate('sellerId', 'displayName email').sort({ createdAt: -1 });
    // Format to match old Firebase structure
    const formatted = books.map(b => ({ ...b._doc, id: b._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('sellerId', 'displayName email photoURL');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ ...book._doc, id: book._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const book = new Book({
      ...req.body,
      sellerId: req.user.id
    });
    await book.save();
    res.status(201).json({ ...book._doc, id: book._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    if (book.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(book, req.body);
    await book.save();
    res.json({ ...book._doc, id: book._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
