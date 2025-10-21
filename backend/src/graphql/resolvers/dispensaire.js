import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';

const dispensaireResolvers = {
  Query: {
    dispensaire: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
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

    dispensaires: async (_, { filter = {}, pagination = {} }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
      try {
        const { Dispensaire } = await import('../../models/index.js');
        
        // Construction de la requête avec filtres
        const whereClause = {};
        
        if (filter.synoda) {
          whereClause.synoda = filter.synoda;
        }
        
        if (filter.isActive !== undefined) {
          whereClause.isActive = filter.isActive;
        }
        
        if (filter.search) {
          whereClause[Op.or] = [
            { name: { [Op.iLike]: `%${filter.search}%` } },
            { fileovana: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
        
        // Pour les agents, limiter aux dispensaires accessibles
        if (user.role === 'agent' && user.dispensaireId) {
          whereClause.id = user.dispensaireId;
        }
        
        // Pagination
        const limit = pagination.limit || 50;
        const offset = pagination.offset || 0;
        
        const { rows: dispensaires, count: totalCount } = await Dispensaire.findAndCountAll({
          where: whereClause,
          order: [['name', 'ASC']],
          limit,
          offset
        });
        
        console.log(`✅ Found ${dispensaires.length} dispensaires (total: ${totalCount})`);
        
        return {
          dispensaires,
          totalCount,
          hasNextPage: offset + limit < totalCount,
          hasPreviousPage: offset > 0
        };
      } catch (error) {
        console.error('❌ Error in dispensaires query:', error);
        throw new Error(`Erreur lors de la récupération des dispensaires: ${error.message}`);
      }
    }
  },

  Mutation: {
    createDispensaire: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
      if (!['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Accès refusé : rôle insuffisant');
      }
      
      try {
        const { Dispensaire } = await import('../../models/index.js');
        
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
            errors: ['NAME_ALREADY_EXISTS'],
            dispensaire: null
          };
        }

        // Créer le dispensaire
        const dispensaire = await Dispensaire.create(input);
        
        console.log('✅ Dispensaire créé:', dispensaire.name);
        
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
            errors: error.errors.map(err => err.message),
            dispensaire: null
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création du dispensaire',
          errors: [error.message],
          dispensaire: null
        };
      }
    },

    updateDispensaire: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
      if (!['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Accès refusé : rôle insuffisant');
      }
      
      try {
        const { Dispensaire } = await import('../../models/index.js');
        
        const dispensaire = await Dispensaire.findByPk(id);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND'],
            dispensaire: null
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
              errors: ['NAME_ALREADY_EXISTS'],
              dispensaire: null
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
          errors: [error.message],
          dispensaire: null
        };
      }
    },

    deleteDispensaire: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }
      
      if (user.role !== 'admin') {
        throw new ForbiddenError('Seuls les administrateurs peuvent supprimer des dispensaires');
      }
      
      try {
        const { Dispensaire, User, Patient, DataEntry } = await import('../../models/index.js');
        
        const dispensaire = await Dispensaire.findByPk(id);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND'],
            dispensaire: null
          };
        }
        
        // Vérifier s'il y a des utilisateurs associés
        const userCount = await User.count({ where: { dispensaireId: id } });
        if (userCount > 0) {
          return {
            success: false,
            message: `Impossible de supprimer : ${userCount} utilisateur(s) associé(s)`,
            errors: ['HAS_ASSOCIATED_USERS'],
            dispensaire: null
          };
        }
        
        // Vérifier s'il y a des patients associés
        const patientCount = await Patient.count({ where: { dispensaireId: id } });
        if (patientCount > 0) {
          return {
            success: false,
            message: `Impossible de supprimer : ${patientCount} patient(s) associé(s)`,
            errors: ['HAS_ASSOCIATED_PATIENTS'],
            dispensaire: null
          };
        }
        
        // Soft delete
        await dispensaire.update({ isActive: false });
        
        return {
          success: true,
          message: 'Dispensaire supprimé avec succès',
          errors: [],
          dispensaire: null
        };
      } catch (error) {
        console.error('❌ Erreur suppression dispensaire:', error);
        return {
          success: false,
          message: 'Erreur lors de la suppression',
          errors: [error.message],
          dispensaire: null
        };
      }
    }
  },

  // Field resolvers
  Dispensaire: {
    users: async (dispensaire) => {
      const { User } = await import('../../models/index.js');
      return await User.findAll({
        where: { 
          dispensaireId: dispensaire.id,
          isActive: true 
        },
        order: [['nom', 'ASC'], ['prenom', 'ASC']]
      });
    },

    dataEntries: async (dispensaire) => {
      const { DataEntry } = await import('../../models/index.js');
      return await DataEntry.findAll({
        where: { 
          dispensaireId: dispensaire.id,
          isActive: true 
        },
        order: [['dateConsultation', 'DESC']],
        limit: 100
      });
    },

    userCount: async (dispensaire) => {
      const { User } = await import('../../models/index.js');
      return await User.count({ 
        where: { dispensaireId: dispensaire.id } 
      });
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
  }
};

export default dispensaireResolvers;