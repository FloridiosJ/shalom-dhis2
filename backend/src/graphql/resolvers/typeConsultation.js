import { TypeConsultation, DataEntry } from '../../models/index.js';
import { AuthenticationError } from 'apollo-server-express';

export const typeConsultationResolvers = {
  Query: {
    typeConsultations: async (_, { isActive }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = isActive !== undefined ? { isActive } : {};
      return await TypeConsultation.findAll({
        where,
        order: [['label', 'ASC']]
      });
    },
    
    typeConsultation: async (_, { code }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const type = await TypeConsultation.findByPk(code);
      if (!type) {
        throw new Error(`Type de consultation '${code}' non trouvé`);
      }
      return type;
    }
  },

  Mutation: {
    updateTypeConsultation: async (_, { code, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      if (user.role !== 'ADMIN') {
        throw new AuthenticationError('Accès refusé. Rôle ADMIN requis.');
      }

      const type = await TypeConsultation.findByPk(code);
      if (!type) {
        throw new Error(`Type de consultation '${code}' non trouvé`);
      }
      
      await type.update(input);
      return type;
    }
  },

  TypeConsultation: {
    dataEntriesCount: async (parent) => {
      return await DataEntry.count({
        where: { 
          typeConsultation: parent.code,
          isActive: true 
        }
      });
    }
  }
};

export default typeConsultationResolvers;