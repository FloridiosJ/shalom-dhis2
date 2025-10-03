import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';

export const authMiddleware = async ({ req }) => {
  // Get the auth token from headers
  const authHeader = req.headers.authorization;
  
  // Initialize context
  const context = {};

  if (authHeader) {
    try {
      // Extract token from "Bearer <token>"
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user info to context
      context.userId = decoded.id;
      context.role = decoded.role;
      
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  return context;
};

// Middleware pour protéger les resolvers qui nécessitent une authentification
export const isAuthenticated = (next) => (root, args, context, info) => {
  if (!context.userId) {
    throw new AuthenticationError('You must be logged in');
  }
  return next(root, args, context, info);
};

// Middleware pour vérifier le rôle admin
export const isAdmin = (next) => (root, args, context, info) => {
  if (context.role !== 'admin') {
    throw new AuthenticationError('Admin access required');
  }
  return next(root, args, context, info);
};