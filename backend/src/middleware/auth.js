import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Middleware pour authentifier un token JWT
 */
export const authenticateToken = async (token) => {
  if (!token) {
    return null;
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token authentication error:', error.message);
    return null;
  }
};

/**
 * Middleware Express pour protéger les routes REST
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    const user = await authenticateToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid or expired token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

/**
 * Middleware pour vérifier le rôle
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User not authenticated' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

/**
 * Générer un token JWT
 */
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Vérifier si un utilisateur est admin
 */
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};

/**
 * Vérifier si un utilisateur peut accéder à un dispensaire
 */
export const canAccessDispensaire = (user, dispensaireId) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return user.dispensaireId === dispensaireId;
};