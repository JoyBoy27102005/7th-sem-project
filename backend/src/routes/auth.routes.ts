import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerUser, loginUser, forgotPassword, resetPassword, verifyOTP } from '../controllers/auth.controller';

const router = express.Router();

// Rate limiter for forgot password requests (max 3 requests per 15 minutes)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 forgot password requests per `window` (here, per 15 minutes)
  message: { message: 'Too many password reset requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General rate limiter for verifyOTP and resetPassword
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPasswordLimiter, forgotPassword);
router.post('/verifyotp', resetPasswordLimiter, verifyOTP);
router.post('/resetpassword', resetPasswordLimiter, resetPassword);

export default router;
