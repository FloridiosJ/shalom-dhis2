import { Organisation } from '../../../models/index.js';
import { checkRole } from '../../utils/auth-utils.js';

export const organisationResolvers = {
  Query: {
    organisations: async () => await Organisation.findAll()
  },

  Mutation: {
    createOrganisation: async (_, { name, parentId, type }, context) => {
      checkRole(context, ['admin']);
      return await Organisation.create({ name, parentId, type });
    },

    updateOrganisation: async (_, { id, ...input }, context) => {
      checkRole(context, ['admin']);
      const org = await Organisation.findByPk(id);
      if (!org) throw new Error('Organisation not found');
      return await org.update(input);
    },

    deleteOrganisation: async (_, { id }, context) => {
      checkRole(context, ['admin']);
      const org = await Organisation.findByPk(id);
      if (!org) throw new Error('Organisation not found');
      await org.destroy();
      return true;
    }
  },

  Organisation: {
    children: async (organisation) => {
      return await Organisation.findAll({
        where: { parentId: organisation.id }
      });
    }
  }
};