import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const authResolvers = {
  Query: {
    // ✅ AJOUTER la query me
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { User, Dispensaire } = await import('../../models/index.js');
      
      // Récupérer l'utilisateur avec ses relations
      const fullUser = await User.findByPk(user.id, {
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire'
          }
        ]
      });

      if (!fullUser) {
        throw new AuthenticationError('Utilisateur non trouvé');
      }

      return fullUser;
    }
  },

  Mutation: {
    login: async (_, { input }) => {
      console.log('🔍 Login attempt with:', input.login);
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const { User, Dispensaire } = await import('../../models/index.js');

      // ✅ CHERCHER par login OU email
      const user = await User.findOne({ 
        where: { 
          [Op.and]: [
            {
              [Op.or]: [
                { login: input.login },
                { email: input.login } // ✅ Ajouter la recherche par email
              ]
            },
            { isActive: true } // ✅ S'assurer que l'utilisateur est actif
          ]
        },
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire'
          }
        ]
      });
      
      if (!user) {
        console.log('❌ User not found or inactive');
        throw new AuthenticationError('Identifiants invalides');
      }

      // ✅ Vérifier le mot de passe
      const valid = await user.comparePassword(input.password);
        
      if (!valid) {
        console.log('❌ Invalid password for user:', user.login);
        throw new AuthenticationError('Identifiants invalides');
      }

      // Mettre à jour la dernière connexion
      await user.updateLastLogin();

      const token = jwt.sign(
        { 
          userId: user.id,
          login: user.login,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful for:', user.login);

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

export default authResolvers;