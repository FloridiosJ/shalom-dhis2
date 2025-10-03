import { User } from '../../../models/index.js';
import { checkRole } from '../../utils/auth-utils.js';

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
  }
};