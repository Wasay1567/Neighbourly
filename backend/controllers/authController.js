const User = require('../models/users');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const { sendOTP } = require('../utils/mailer'); // You'll need to create this utility

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper to generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, phone, role, firstName, lastName, bio } = req.body;
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }
    
    // Create OTP and Expiry (10 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    // Create user (Note: set status to 'pending' or similar if your logic requires)
    const user = await User.create({
      email, 
      password, 
      phone, 
      role, 
      firstName, 
      lastName, 
      bio,
      //status: 'pending_verification', // Use the exact string from your DB enum
      otp_code: otp,
      otp_expires_at: otpExpires
    });
    
    // Send OTP via Resend
    await sendOTP(email, otp);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify the OTP sent to your email.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate new OTP for login
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    // Save OTP to user record
    await User.updateOTP(user.id, otp, otpExpires);
    
    // Send OTP via Resend
    await sendOTP(email, otp);
    
    res.json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete login.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // 1. Find the user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // 2. Generate a fresh 6-digit OTP
    const newOtp = generateOTP();
    // 3. Reset expiry to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60000);

    // 4. Update the database using your existing updateOTP helper
    await User.updateOTP(user.id, newOtp, otpExpires);

    // 5. Send the new code via email
    await sendOTP(email, newOtp);

    // 6. Send success response
    res.status(200).json({
      success: true,
      message: 'A new verification code has been sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP (New Method)
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Validate OTP and Expiration
    const isOtpValid = user.otp_code === otp;
    const isNotExpired = new Date() < new Date(user.otp_expires_at);

    if (!isOtpValid || !isNotExpired) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Clear OTP and activate user
    await User.clearOTPAndVerify(user.id);
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Generate Final JWT
    const token = generateToken(user.id);
    
    // Clean up sensitive data before response
    delete user.password_hash;
    delete user.otp_code;
    delete user.otp_expires_at;

    res.json({
      success: true,
      message: 'Verification successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, avatarUrl } = req.body;
    
    const updatedProfile = await User.updateProfile(req.user.id, {
      firstName, lastName, bio, avatarUrl
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: updatedProfile }
    });
  } catch (error) {
    next(error);
  }
};