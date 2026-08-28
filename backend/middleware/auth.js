import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.js';

// Protect routes by verifying JWT token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          message: 'Server configuration error: JWT Secret is missing.'
        });
      }
      const decoded = jwt.verify(token, jwtSecret);

      req.user = await findUserById(decoded.id);
      if (req.user) req.user._id = req.user.id;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found',
          error: 'Unauthorized'
        });
      }

      return next();
    } catch (error) {
      console.error('JWT Verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: 'Unauthorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
      error: 'Unauthorized'
    });
  }
};

// Optional auth middleware (populates req.user if token is present, but allows unauthenticated requests)
export const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = await findUserById(decoded.id);
        if (req.user) req.user._id = req.user.id;
      }
    } catch (error) {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};

// Authorize based on roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
        error: 'Forbidden'
      });
    }
    next();
  };
};

export const citizenOnly = authorize('citizen');

