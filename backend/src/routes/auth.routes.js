const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user.model');

const router = express.Router();

// Check email credentials
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('Email credentials missing:', {
    user: EMAIL_USER ? 'set' : 'missing',
    pass: EMAIL_PASS ? 'set' : 'missing'
  });
  throw new Error('Email credentials not properly configured');
}

console.log('Configuring email transport with:', {
  user: EMAIL_USER,
  pass: EMAIL_PASS ? '[HIDDEN]' : 'missing'
});

// Email transporter with updated Gmail settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  debug: true,
  logger: true
});

// Test email configuration immediately
const testEmailConfig = async () => {
  try {
    console.log('Testing email configuration...');
    const verify = await transporter.verify();
    console.log('Email configuration verified:', verify);
    
    console.log('Sending test email...');
    const testInfo = await transporter.sendMail({
      from: {
        name: 'Smart Parking System',
        address: EMAIL_USER
      },
      to: EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test email to verify the email configuration.'
    });
    console.log('Test email sent successfully:', testInfo.messageId);
  } catch (error) {
    console.error('Email configuration error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });
    throw error;
  }
};

// Test email configuration on startup
testEmailConfig().catch(error => {
  console.error('Failed to initialize email configuration:', error);
});

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', {
      email: req.body.email,
      hasPassword: !!req.body.password
    });

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      email,
      password,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    await user.save();
    console.log('User saved to database:', user._id);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    console.log('Attempting to send verification email:', {
      to: email,
      verificationUrl
    });

    try {
      const info = await transporter.sendMail({
        from: {
          name: 'Smart Parking System',
          address: EMAIL_USER
        },
        to: email,
        subject: 'Verify Your Email - Smart Parking System',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333;">Welcome to Smart Parking System!</h2>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't create an account, you can safely ignore this email.
              This link will expire in 24 hours.
            </p>
          </div>
        `,
        text: `Welcome to Smart Parking System!\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`
      });

      console.log('Verification email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });

      res.status(201).json({ 
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user._id
      });
    } catch (emailError) {
      console.error('Detailed email error:', {
        name: emailError.name,
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        stack: emailError.stack
      });

      // Delete the user if email fails
      await User.findByIdAndDelete(user._id);
      throw new Error(`Failed to send verification email: ${emailError.message}`);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: error.message || 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify email
router.get('/verify/:token', async (req, res) => {
  try {
    console.log('Verification request received for token:', req.params.token);
    
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.log('Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('User verified successfully');
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      console.log('Unverified user attempt:', email);
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log('Successful login for user:', email);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      userId: user._id,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
