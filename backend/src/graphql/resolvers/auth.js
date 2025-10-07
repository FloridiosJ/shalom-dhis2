import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const authResolvers = {
  Mutation: {
    login: async (_, { input }) => {
      console.log('🔍 Login attempt with:', input.login);
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      // ✅ Import correct du modèle User
      const { User, Dispensaire } = await import('../../../models/index.js');

      // Chercher l'utilisateur
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { login: input.login },
            // Ajouter login seulement si le champ existe dans votre modèle
            // { login: input.login }
          ]
        },
        include: [
          {
            model: Dispensaire,
            as: 'dispensaire'
          }
        ]
      });
      
      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive');
        throw new AuthenticationError('Invalid credentials');
      }

      // ✅ Vérifier le mot de passe (adapter selon votre méthode)
      const valid = await user.comparePassword ? 
        await user.comparePassword(input.password) :
        await user.validPassword(input.password); // ou la méthode que vous utilisez
        
      if (!valid) {
        console.log('❌ Invalid password');
        throw new AuthenticationError('Invalid credentials');
      }

      // Mettre à jour la dernière connexion si la méthode existe
      if (user.updateLastLogin) {
        await user.updateLastLogin();
      }

      const token = jwt.sign(
        { 
          userId: user.id,
          login: user.login,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful');

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