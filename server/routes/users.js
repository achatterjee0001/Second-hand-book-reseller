import express from 'express';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const formatted = users.map(u => ({ ...u._doc, id: u._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/profile', auth, async (req, res) => {
  try {
    const { displayName, photoURL, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { displayName, photoURL, location },
      { returnDocument: 'after' }
    ).select('-password');
    res.json({ ...user._doc, id: user._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
