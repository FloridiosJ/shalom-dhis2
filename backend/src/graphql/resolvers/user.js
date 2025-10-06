import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { User, Dispensaire } from '../../../models/index.js';

const userResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findByPk(user.userId, {
        include: ['dispensaire']
      });
    },

    users: async (_, { role, dispensaireId }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Unauthorized access');
      }

      const whereClause = {};
      if (role) whereClause.role = role;
      if (dispensaireId) whereClause.dispensaireId = dispensaireId;

      // Manager can only see agents
      if (user.role === 'manager') {
        whereClause.role = 'agent';
      }

      return await User.findAll({
        where: whereClause,
        include: ['dispensaire'],
        order: [['createdAt', 'DESC']]
      });
    },

    user: async (_, { id }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Unauthorized access');
      }

      const targetUser = await User.findByPk(id, {
        include: ['dispensaire']
      });

      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Manager can only see agents
      if (user.role === 'manager' && targetUser.role !== 'agent') {
        throw new ForbiddenError('Unauthorized access to this user');
      }

      return targetUser;
    },

    searchUsers: async (_, { query, role }, { user }) => {
      if (!user || !['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Unauthorized access');
      }

      const whereClause = {
        [Op.or]: [
          { nom: { [Op.iLike]: `%${query}%` } },
          { prenom: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { login: { [Op.iLike]: `%${query}%` } }
        ]
      };

      if (role) whereClause.role = role;
      if (user.role === 'manager') {
        whereClause.role = 'agent';
      }

      return await User.findAll({
        where: whereClause,
        include: ['dispensaire'],
        limit: 20
      });
    }
  },

  Mutation: {
    createUser: async (_, { input }, { user: currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('You must be logged in');
      }

      // Role-based authorization
      if (input.role === 'admin' && currentUser.role !== 'admin') {
        throw new ForbiddenError('Only admin can create admin users');
      }

      if (input.role === 'manager' && currentUser.role !== 'admin') {
        throw new ForbiddenError('Only admin can create manager users');
      }

      if (input.role === 'agent' && !['admin', 'manager'].includes(currentUser.role)) {
        throw new ForbiddenError('Only admin and manager can create agent users');
      }

      // Validate dispensaire if provided
      if (input.dispensaireId) {
        const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
        if (!dispensaire) {
          throw new UserInputError('Dispensaire not found');
        }
      }

      try {
        const newUser = await User.create(input);
        return await User.findByPk(newUser.id, {
          include: ['dispensaire']
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new UserInputError('Email or login already exists');
        }
        throw error;
      }
    },

    updateUser: async (_, { id, input }, { user: currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('You must be logged in');
      }

      const targetUser = await User.findByPk(id);
      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      // Authorization check
      if (currentUser.role === 'manager' && targetUser.role !== 'agent') {
        throw new ForbiddenError('Manager can only update agent users');
      }

      if (currentUser.userId !== id && !['admin', 'manager'].includes(currentUser.role)) {
        throw new ForbiddenError('You can only update your own profile');
      }

      await targetUser.update(input);
      return await User.findByPk(id, {
        include: ['dispensaire']
      });
    },

    deleteUser: async (_, { id }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new ForbiddenError('Only admin can delete users');
      }

      if (currentUser.userId === id) {
        throw new UserInputError('You cannot delete your own account');
      }

      const user = await User.findByPk(id);
      if (!user) {
        throw new UserInputError('User not found');
      }

      await user.destroy();
      return true;
    },

    changePassword: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const currentUser = await User.findByPk(user.userId);
      const isCurrentPasswordValid = await currentUser.comparePassword(input.currentPassword);
      
      if (!isCurrentPasswordValid) {
        throw new UserInputError('Current password is incorrect');
      }

      await currentUser.update({ password: input.newPassword });
      return true;
    },

    resetUserPassword: async (_, { userId }, { user: currentUser }) => {
      if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
        throw new ForbiddenError('Unauthorized access');
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      if (currentUser.role === 'manager' && targetUser.role !== 'agent') {
        throw new ForbiddenError('Manager can only reset agent passwords');
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      await targetUser.update({ password: tempPassword });

      return {
        success: true,
        temporaryPassword: tempPassword,
        message: 'Password reset successfully'
      };
    },

    toggleUserStatus: async (_, { userId }, { user: currentUser }) => {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new ForbiddenError('Only admin can toggle user status');
      }

      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        throw new UserInputError('User not found');
      }

      if (currentUser.userId === userId) {
        throw new UserInputError('You cannot deactivate your own account');
      }

      await targetUser.update({ isActive: !targetUser.isActive });
      return await User.findByPk(userId, {
        include: ['dispensaire']
      });
    }
  },

  // Field resolvers
  User: {
    specialite: (user) => {
      // Handle legacy data conversion
      if (user.specialite === 'sage femme') return 'sage_femme';
      if (user.specialite === 'infirmière') return 'infirmiere';
      return user.specialite;
    }
  }
};

export default userResolvers;