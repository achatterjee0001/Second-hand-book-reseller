import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: 'Collector',
  },
  photoURL: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
