import { Dispensaire } from '../../../models/index.js';
import { checkRole } from '../../utils/auth-utils.js';

const dispensaireResolvers = {
  Query: {
    dispensaires: async () => await Dispensaire.findAll()
  },

  Mutation: {
    createDispensaire: async (_, { input }, context) => {
      checkRole(context, ['admin']);
      return await Dispensaire.create(input);
    },

    updateDispensaire: async (_, { id, input }, context) => {
      checkRole(context, ['admin']);
      const dispensaire = await Dispensaire.findByPk(id);
      if (!dispensaire) throw new Error('Dispensaire not found');
      return await dispensaire.update(input);
    },

    deleteDispensaire: async (_, { id }, context) => {
      checkRole(context, ['admin']);
      const dispensaire = await Dispensaire.findByPk(id);
      if (!dispensaire) throw new Error('Dispensaire not found');
      await dispensaire.destroy();
      return true;
    }
  },

};

export default dispensaireResolvers;