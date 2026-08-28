import express from 'express';
import {
  registerCitizen,
  loginCitizen,
  getMe,
  forgotPassword,
  resetPassword,
  supabaseOauth,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Citizen Authentication Routes
router.post('/citizen/register', registerCitizen);
router.post('/citizen/login', loginCitizen);
router.post('/supabase-oauth', supabaseOauth);

// Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected User Profile
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
