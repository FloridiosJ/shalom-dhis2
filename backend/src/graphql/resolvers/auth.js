import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User } from '../../../models/index.js';

const authResolvers = {
  Mutation: {
    // CORRECTION: Utiliser le paramètre 'login' au lieu de 'email'
    login: async (_, { login, password }) => {
      console.log('🔍 Login attempt with:', login);
      
      // Verify JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Find user by login OR email
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: login },
            { login: login }
          ]
        },
        include: ['dispensaire']
      });
      
      if (!user) {
        console.log('❌ User not found');
        throw new AuthenticationError('Invalid credentials');
      }

      if (!user.isActive) {
        console.log('❌ User inactive');
        throw new AuthenticationError('Account is disabled');
      }

      // Verify password
      const valid = await user.comparePassword(password);
      if (!valid) {
        console.log('❌ Invalid password');
        throw new AuthenticationError('Invalid credentials');
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,  // CORRECTION: userId au lieu de id
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful');

      // Return complete user object
      return {
        token,
        user
      };
    },

    logout: async () => {
      return true;
    }
  }
};

// CORRECTION: Export par défaut
export default authResolvers;