import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-jwt-secret-key';

// Admin authentication middleware
export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    if (!user.isAdmin()) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Permission-based middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      if (!req.user.hasPermission(permission)) {
        return res.status(403).json({ 
          message: `Access denied. ${permission} permission required.` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error.' });
    }
  };
};

// Super admin only middleware
export const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Access denied. Super admin privileges required.' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};