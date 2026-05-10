import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user = new User({
      email,
      password: hashedPassword,
      role: email === 'ashutoshchatterjee0003@gmail.com' ? 'admin' : 'user',
      otp,
      otpExpires,
      isVerified: false
    });
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Your Verification Code',
      message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: 'Verification code sent to email', requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Your Verification Code',
      message: `Your login verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: 'Verification code sent to email', requiresOtp: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid verification code' });
    if (new Date() > user.otpExpires) return res.status(400).json({ message: 'Verification code expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const payload = { id: user.id, role: user.role, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key_change_me', { expiresIn: '7d' });

    res.json({ token, user: { uid: user.id, email: user.email, role: user.role, displayName: user.displayName, photoURL: user.photoURL, location: user.location } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Verification Code',
      message: `Your password reset verification code is: ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: 'Verification code sent to email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid verification code' });
    if (new Date() > user.otpExpires) return res.status(400).json({ message: 'Verification code expired' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ uid: user.id, email: user.email, role: user.role, displayName: user.displayName, photoURL: user.photoURL, loyaltyPoints: user.loyaltyPoints, location: user.location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
