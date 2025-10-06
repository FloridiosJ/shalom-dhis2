import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../../../models/user.js';

const authResolvers = {
  Mutation: {
    login: async (_, { login, password }) => {
      console.log('🔍 Login attempt with:', login);
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // CORRECTION : Chercher sans include d'abord
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: login },
            { login: login }
          ]
        }
        // Temporairement sans include: ['dispensaire']
      });
      
      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive');
        throw new AuthenticationError('Invalid credentials');
      }

      const valid = await user.comparePassword(password);
      if (!valid) {
        console.log('❌ Invalid password');
        throw new AuthenticationError('Invalid credentials');
      }

      await user.updateLastLogin();

      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful');

      // Récupérer le dispensaire séparément si nécessaire
      let dispensaire = null;
      if (user.dispensaireId) {
        try {
          const Dispensaire = (await import('../../../models/dispensaire.js')).default;
          dispensaire = await Dispensaire.findByPk(user.dispensaireId);
        } catch (error) {
          console.log('Warning: Could not load dispensaire', error.message);
        }
      }

      // Retourner l'utilisateur avec le dispensaire
      const userWithDispensaire = {
        ...user.toJSON(),
        dispensaire
      };

      return { 
        token, 
        user: userWithDispensaire 
      };
    },

    logout: async () => {
      return true;
    }
  }
};

export default authResolvers;