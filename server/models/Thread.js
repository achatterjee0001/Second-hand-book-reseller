import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  lastMessage: {
    type: String,
  },
  lastMessageTime: {
    type: Date,
  }
}, { timestamps: true });

export default mongoose.model('Thread', threadSchema);
