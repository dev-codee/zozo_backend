import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

export const protectUser = async (req, res, next) => {
  let token = req.cookies?.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await User.findById(decoded._id).select('-password');
      req.sessionId = decoded.sessionId;
      return next();
    } catch (error) {
      console.error('User Auth Middleware Error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

import { AdminUser } from '../models/AdminUser.model.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const adminUser = await AdminUser.findById(decoded._id);
      if (!adminUser || !adminUser.isActive) {
        return res.status(403).json({ success: false, message: 'Not authorized as admin, user inactive or not found' });
      }

      req.adminUser = adminUser;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.adminUser || !roles.includes(req.adminUser.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role permissions' });
    }
    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.adminUser.role === 'SUPER_ADMIN') {
      return next();
    }
    if (!req.adminUser.permissions.includes(permission)) {
      return res.status(403).json({ success: false, message: `Forbidden: Missing permission ${permission}` });
    }
    next();
  };
};
