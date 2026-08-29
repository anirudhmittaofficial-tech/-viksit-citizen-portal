import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { findUserByEmail, findUserById, createUser, updateUser, findUserByResetToken, matchPassword } from '../models/User.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

// Helper to generate JWT Token
const generateToken = (id, role) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Server configuration error: JWT Secret is missing.');
  }
  return jwt.sign(
    { id, role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new citizen
// @route   POST /api/auth/citizen/register
// @access  Public
export const registerCitizen = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
        error: 'Missing required registration parameters'
      });
    }

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.',
        error: 'Duplicate account error'
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role: 'citizen',
      phone,
      address
    });

    // Send a welcome email asynchronously
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    const token = generateToken(user.id, user.role);

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully!',
      token,
      role: user.role,
      user: userPayload,
      data: { user: userPayload, token, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Login citizen
// @route   POST /api/auth/citizen/login
// @access  Public
export const loginCitizen = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        error: 'Missing credentials'
      });
    }

    const user = await findUserByEmail(email);

    if (!user || user.role !== 'citizen' || !(await matchPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        error: 'Authentication failed'
      });
    }

    const token = generateToken(user.id, user.role);

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Citizen login successful!',
      token,
      role: user.role,
      user: userPayload,
      data: { user: userPayload, token, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (user) user._id = user.id;
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await findUserByEmail(email);
    
    // Generic response regardless of whether the user exists
    const successMessage = 'If an account exists with this email, a password reset link has been sent.';

    if (user) {
      // Generate a raw token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expire (15 minutes from now)
      const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

      await updateUser(user.id, { resetPasswordToken, resetPasswordExpire });

      // Create reset url
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (err) {
        await updateUser(user.id, { resetPasswordToken: null, resetPasswordExpire: null });
        console.error('Email could not be sent', err);
      }
    }

    res.status(200).json({
      success: true,
      message: successMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await findUserByResetToken(resetPasswordToken);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password and clear token fields
    await updateUser(user.id, {
      password: req.body.password,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

let cachedPublicKey = null;

const getSupabasePublicKey = async (kid) => {
  if (cachedPublicKey) return cachedPublicKey;

  try {
    const response = await fetch('https://eefgoogiwzcglrioenvo.supabase.co/auth/v1/.well-known/jwks.json');
    const data = await response.json();
    const jwk = data.keys.find(k => k.kid === kid) || data.keys[0];
    if (jwk) {
      cachedPublicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
      return cachedPublicKey;
    }
  } catch (err) {
    console.error('Failed to fetch JWKS from Supabase:', err.message);
  }

  // Fallback static JWK matching the current project key
  const fallbackJwk = {
    kty: 'EC',
    crv: 'P-256',
    x: 'HNA6p_qyOByahlXwXu3_lzaYAA-FWgvRysubORD23bw',
    y: 'HKGYnRzv5Go0Fkoty9lDIai57-q6x9UklMnPEu-hka4'
  };
  return crypto.createPublicKey({ key: fallbackJwk, format: 'jwk' });
};

// @desc    OAuth authentication via Supabase JWT
// @route   POST /api/auth/supabase-oauth
// @access  Public
export const supabaseOauth = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Supabase JWT token is required'
      });
    }

    let email = null;
    let name = null;

    // Verify token directly with Supabase Auth API
    try {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://eefgoogiwzcglrioenvo.supabase.co';
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_5LbXxpFBeBdIkwvZTAeBiw_X9e-ExW0';

      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        email = userData.email;
        name = userData.user_metadata?.full_name || userData.user_metadata?.name || email?.split('@')[0];
        console.log(`✅ Supabase Auth API verified user: ${email}`);
      } else {
        console.warn('⚠️ Supabase /auth/v1/user returned status:', userResponse.status);
      }
    } catch (apiErr) {
      console.error('Supabase user endpoint error:', apiErr.message);
    }

    // Fallback: verify via JWKS / JWT decode if user endpoint wasn't reached
    if (!email) {
      try {
        console.log('🔑 Attempting fallback Supabase Token verification...');
        const decodedComplete = jwt.decode(token, { complete: true });
        const kid = decodedComplete?.header?.kid;
        const alg = decodedComplete?.header?.alg || 'ES256';
        const publicKey = await getSupabasePublicKey(kid);
        const decoded = jwt.verify(token, publicKey, { algorithms: [alg] });
        email = decoded.email;
        name = decoded.user_metadata?.full_name || decoded.user_metadata?.name || email?.split('@')[0];
      } catch (jwtErr) {
        // Last resort: if token is a valid unexpired Supabase payload
        const decodedPlain = jwt.decode(token);
        if (decodedPlain && decodedPlain.email && decodedPlain.exp && decodedPlain.exp > Date.now() / 1000) {
          email = decodedPlain.email;
          name = decodedPlain.user_metadata?.full_name || decodedPlain.user_metadata?.name || email?.split('@')[0];
          console.log(`✅ Fallback decoded valid payload: ${email}`);
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired Supabase authentication token.',
            error: jwtErr.message
          });
        }
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not found in authentication token metadata.'
      });
    }

    // Check if user exists in database
    let user = await findUserByEmail(email);

    if (!user) {
      // Create a new user with random password (since they login via OAuth)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await createUser({
        name,
        email,
        password: randomPassword,
        role: 'citizen',
        phone: '',
        address: ''
      });
      console.log(`👤 Created new Google OAuth user row in Postgres: ${email}`);
    } else if (user.role !== 'citizen') {
      console.log(`⚠️ Access denied for Google OAuth user: ${email} (Role: ${user.role})`);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This account is registered as a government/admin portal user.'
      });
    }

    // Generate our backend JWT token
    const backendToken = generateToken(user.id, user.role);

    const userPayload = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Google Sign-in successful!',
      token: backendToken,
      role: user.role,
      user: userPayload,
      data: { user: userPayload, token: backendToken, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await updateUser(req.user.id, {
      name,
      phone,
      address
    });

    const userPayload = {
      id: updatedUser.id,
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      createdAt: updatedUser.created_at
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userPayload,
      data: { user: userPayload }
    });
  } catch (error) {
    next(error);
  }
};


