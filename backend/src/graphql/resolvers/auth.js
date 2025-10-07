import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const authResolvers = {
  Mutation: {
    // ✅ CORRIGER pour utiliser input au lieu de login/password séparés
    login: async (_, { input }) => {
      console.log('🔍 Login attempt with:', input.login);
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Importer User dynamiquement
      const { User } = await import('../../models/index.js');

      // Chercher l'utilisateur
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: input.login },
            { login: input.login }
          ]
        }
      });
      
      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive');
        throw new AuthenticationError('Invalid credentials');
      }

      const valid = await user.comparePassword(input.password);
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
          const { Dispensaire } = await import('../../models/index.js');
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