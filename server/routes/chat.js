import express from 'express';
import Thread from '../models/Thread.js';
import Message from '../models/Message.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get user threads
router.get('/threads', auth, async (req, res) => {
  try {
    const threads = await Thread.find({ participants: req.user.id })
      .populate('participants', 'displayName photoURL email')
      .populate('bookId', 'title')
      .sort({ lastMessageTime: -1 });
    
    const formatted = threads.map(t => ({ ...t._doc, id: t._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or get thread
router.post('/threads', auth, async (req, res) => {
  try {
    const { participantId, bookId } = req.body;
    let thread = await Thread.findOne({
      participants: { $all: [req.user.id, participantId] },
      bookId
    });

    if (!thread) {
      thread = new Thread({
        participants: [req.user.id, participantId],
        bookId,
        lastMessage: 'Started a conversation',
        lastMessageTime: new Date()
      });
      await thread.save();
    }
    
    const populatedThread = await Thread.findById(thread._id)
      .populate('participants', 'displayName photoURL email')
      .populate('bookId', 'title');

    res.json({ ...populatedThread._doc, id: thread._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages for a thread
router.get('/threads/:threadId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ threadId: req.params.threadId })
      .sort({ createdAt: 1 });
    const formatted = messages.map(m => ({ ...m._doc, id: m._id.toString() }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/threads/:threadId/messages', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const message = new Message({
      threadId: req.params.threadId,
      senderId: req.user.id,
      text
    });
    await message.save();

    await Thread.findByIdAndUpdate(req.params.threadId, {
      lastMessage: text,
      lastMessageTime: new Date()
    });

    res.status(201).json({ ...message._doc, id: message._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
