import { PrescriptionItem, DataEntry } from '../../models/index.js';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

const prescriptionItemResolvers = {
  Query: {
    prescriptionItems: async (_, { dataEntryId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const items = await PrescriptionItem.findAll({
        where: { 
          dataEntryId,
          isActive: true 
        },
        order: [['ordre', 'ASC'], ['createdAt', 'ASC']]
      });

      return items;
    }
  },

  PrescriptionItem: {
    dataEntry: async (parent) => {
      return await DataEntry.findByPk(parent.dataEntryId);
    },
    formattedPrescription: (parent) => {
      return parent.getFormattedPrescription();
    }
  }
};

export default prescriptionItemResolvers;
