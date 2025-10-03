import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { User } from '../../models/index.js';
import { isAuthenticated, isAdmin } from '../../middleware/auth.js';

export const authResolvers = {
  Mutation: {
    register: isAdmin(async (_, { email, password, role }, { user }) => {
      // Check if requester is admin
      if (!user || user.role !== 'admin') {
        throw new ForbiddenError('Only admins can register new users');
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AuthenticationError('User already exists');
      }

      // Create new user
      const newUser = await User.create({
        email,
        password, // Will be hashed by User model hooks
        role
      });

      return {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      };
    }),

    login: async (_, { email, password }) => {
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Verify password
      const valid = await user.comparePassword(password);
      if (!valid) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    },

    createOrganisation: isAuthenticated(async (_, args, context) => {
      // L'utilisateur doit être connecté
      // ...existing code...
    })
  }
};