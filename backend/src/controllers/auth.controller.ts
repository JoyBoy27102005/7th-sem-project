import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/emailService';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password as string))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Generic success message to prevent user enumeration
      return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP for DB
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordOTP = await bcrypt.hash(otp, salt);
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    const textMessage = `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\nRegards,\nNextStep.ai Team`;
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">NextStep.ai</h2>
        <h3 style="color: #333;">Reset Your NextStep.ai Password</h3>
        <p style="color: #555; line-height: 1.6;">Hello,</p>
        <p style="color: #555; line-height: 1.6;">We received a request to reset your NextStep.ai account password.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #555;">Your verification code is:</p>
          <h1 style="margin: 10px 0; color: #4f46e5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #555; line-height: 1.6;">This code will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #555; line-height: 1.6;">If you did not request this password reset, please ignore this email. Your account remains secure.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
        <p style="color: #888; font-size: 12px; text-align: center;">Regards,<br/>NextStep.ai Team</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset Your NextStep.ai Password',
        text: textMessage,
        html: htmlMessage,
      });

      res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    } catch (err) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      // Even on email error, we might want to return generic or 500. Let's return generic to avoid leaking existance.
      return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character' });
    }

    const user = await User.findOne({
      email,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log(`Password reset successfully for user: ${user.email}`);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verifyotp
// @access  Public
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const user = await User.findOne({
      email,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTP);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
