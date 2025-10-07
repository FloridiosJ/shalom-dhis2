import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const dispensaireResolvers = {
  // Resolvers de champs
  Dispensaire: {
    fullName: (dispensaire) => dispensaire.getFullName(),

    users: async (dispensaire, args, { dataloaders }) => {
      if (dataloaders && dataloaders.dispensaireUsersLoader) {
        return await dataloaders.dispensaireUsersLoader.load(dispensaire.id);
      }
      
      const { User } = await import('../../models/index.js');
      return await User.findAll({
        where: { dispensaireId: dispensaire.id },
        order: [['nom', 'ASC'], ['prenom', 'ASC']]
      });
    },

    dataEntries: async (dispensaire, args, { dataloaders }) => {
      if (dataloaders && dataloaders.dispensaireDataEntriesLoader) {
        return await dataloaders.dispensaireDataEntriesLoader.load(dispensaire.id);
      }
      
      const { DataEntry } = await import('../../models/index.js');
      return await DataEntry.findAll({
        where: { dispensaireId: dispensaire.id },
        order: [['createdAt', 'DESC']],
        limit: 100
      });
    },

    userCount: async (dispensaire) => {
      const { User } = await import('../../models/index.js');
      return await User.count({ where: { dispensaireId: dispensaire.id } });
    },

    activeUserCount: async (dispensaire) => {
      const { User } = await import('../../models/index.js');
      return await User.count({
        where: {
          dispensaireId: dispensaire.id,
          isActive: true
        }
      });
    }
  },

  Query: {
    dispensaire: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const { Dispensaire } = await import('../../models/index.js');
      const dispensaire = await Dispensaire.findByPk(id);
      
      if (!dispensaire) {
        throw new UserInputError('Dispensaire non trouvé');
      }
      
      // Vérification des permissions pour les agents
      if (user.role === 'agent' && user.dispensaireId !== id) {
        throw new ForbiddenError('Accès non autorisé à ce dispensaire');
      }
      
      return dispensaire;
    },

    dispensaires: async (parent, { filter, pagination }, { user }) => {
      requireAuth(user);
      
      const { Dispensaire } = await import('../../models/index.js');
      
      // Construction de la requête avec filtres
      const whereClause = {};
      
      if (filter) {
        if (filter.synoda) whereClause.synoda = filter.synoda;
        if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
        if (filter.search) {
          whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${filter.search}%` } },
            { fileovana: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }
      
      // Pour les agents, limiter aux dispensaires accessibles
      if (user.role === 'agent') {
        whereClause.id = user.dispensaireId;
      }
      
      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { rows: dispensaires, count: totalCount } = await Dispensaire.findAndCountAll({
        where: whereClause,
        order: [['name', 'ASC']],
        limit,
        offset
      });
      
      return {
        dispensaires,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    }
  },

  Mutation: {
    createDispensaire: async (parent, { input }, { user }) => {
      requireAuth(user);
      requireRole(user, ['admin', 'manager']);
      
      try {

        const { Dispensaire } = await import('../../../models/index.js');
        
        // Vérifier si un dispensaire avec le même nom existe déjà
        const existingName = await Dispensaire.findOne({
          where: { 
            name: input.name,
            isActive: true 
          }
        });
        
        if (existingName) {
          return {
            success: false,
            message: 'Un dispensaire avec ce nom existe déjà',
            errors: ['NAME_ALREADY_EXISTS']
          };
        }

        // Créer le dispensaire
        const dispensaire = await Dispensaire.create(input);
        
        console.log('✅ Dispensaire créé avec succès:', {
          id: dispensaire.id,
          name: dispensaire.name,
          fileovana: dispensaire.fileovana,
          synoda: dispensaire.synoda
        });
        
        return {
          dispensaire,
          success: true,
          message: 'Dispensaire créé avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur création dispensaire:', error);
        
        if (error.name === 'SequelizeValidationError') {
          return {
            success: false,
            message: 'Données invalides',
            errors: error.errors.map(err => err.message)
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création du dispensaire',
          errors: [error.message]
        };
      }
    },

    updateDispensaire: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      requireRole(user, ['admin', 'manager']);
      
      try {
        const { Dispensaire } = await import('../../models/index.js');
        
        const dispensaire = await Dispensaire.findByPk(id);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND']
          };
        }
        
        // Vérifier l'unicité du nom (si modifié)
        if (input.name && input.name !== dispensaire.name) {
          const existingName = await Dispensaire.findOne({
            where: { 
              name: input.name,
              id: { [Op.ne]: id },
              isActive: true 
            }
          });
          
          if (existingName) {
            return {
              success: false,
              message: 'Un autre dispensaire avec ce nom existe déjà',
              errors: ['NAME_ALREADY_EXISTS']
            };
          }
        }
        
        await dispensaire.update(input);
        
        return {
          dispensaire: await Dispensaire.findByPk(id),
          success: true,
          message: 'Dispensaire modifié avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur modification dispensaire:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message]
        };
      }
    },

    deleteDispensaire: async (parent, { id }, { user }) => {
      requireAuth(user);
      requireRole(user, ['admin']);
      
      try {
        const { Dispensaire, User } = await import('../../models/index.js');
        
        const dispensaire = await Dispensaire.findByPk(id);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND']
          };
        }
        
        // Vérifier s'il y a des utilisateurs associés
        const userCount = await User.count({ where: { dispensaireId: id } });
        if (userCount > 0) {
          return {
            success: false,
            message: `Impossible de supprimer : ${userCount} utilisateur(s) associé(s)`,
            errors: ['HAS_ASSOCIATED_USERS']
          };
        }
        
        // Soft delete
        await dispensaire.update({ isActive: false });
        
        return {
          dispensaire: await Dispensaire.findByPk(id),
          success: true,
          message: 'Dispensaire désactivé avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur suppression dispensaire:', error);
        return {
          success: false,
          message: 'Erreur lors de la suppression',
          errors: [error.message]
        };
      }
    }
  }
};

export default dispensaireResolvers;