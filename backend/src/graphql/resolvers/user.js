import { User } from '../../models/index.js';
import { checkRole } from '../../utils/auth-utils.js';
import jwt from 'jsonwebtoken';

export const userResolvers = {
  Query: {
    users: async (_, __, context) => {
      checkRole(context, ['admin']);
      return await User.findAll();
    },
    me: async (_, __, context) => {
      if (!context.userId) return null;
      return await User.findByPk(context.userId);
    }
  },

  Mutation: {
    register: async (_, { email, password, role = 'user' }, context) => {
      checkRole(context, ['admin']);
      return await User.create({ email, password, role });
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ where: { email } });
      if (!user || !await user.comparePassword(password)) {
        throw new Error('Invalid credentials');
      }

      return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    }
  }
};