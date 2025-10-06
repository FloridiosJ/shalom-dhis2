import { DataEntry, Dispensaire } from '../../../models/index.js';
import { checkRole } from '../../utils/auth-utils.js';

const dataEntryResolvers = {
  Query: {
    dataEntries: async () => await DataEntry.findAll()
  },

  Mutation: {
    createDataEntry: async (_, { input }, context) => {
      checkRole(context, ['admin', 'user']);
      return await DataEntry.create(input);
    },

    updateDataEntry: async (_, { id, input }, context) => {
      checkRole(context, ['admin', 'user']);
      const entry = await DataEntry.findByPk(id);
      if (!entry) throw new Error('Data entry not found');
      return await entry.update(input);
    },

    deleteDataEntry: async (_, { id }, context) => {
      checkRole(context, ['admin']);
      const entry = await DataEntry.findByPk(id);
      if (!entry) throw new Error('Data entry not found');
      await entry.destroy();
      return true;
    },

    syncDataEntries: async (_, { entries }, context) => {
      checkRole(context, ['admin', 'user']);
      const createdEntries = await Promise.all(
        entries.map(entry => DataEntry.create(entry))
      );
      return createdEntries;
    }
  },

  DataEntry: {
    dispensaire: async (dataEntry) => {
      return await Dispensaire.findByPk(dataEntry.dispensaireId);
    }
  }
};

export default dataEntryResolvers;