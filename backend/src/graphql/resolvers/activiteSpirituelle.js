import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';

const activiteSprituelleResolvers = {
  Query: {
    /**
     * Récupérer une activité spirituelle par ID
     */
    activiteSpirituelle: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { ActiviteSpirituelle, User, Dispensaire } = await import('../../models/index.js');

      const activite = await ActiviteSpirituelle.findByPk(id, {
        include: [
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom', 'role']
          },
          {
            model: Dispensaire,
            as: 'dispensaire',
            attributes: ['id', 'name', 'fileovana', 'synoda']
          }
        ]
      });

      if (!activite) {
        throw new UserInputError('Activité spirituelle non trouvée');
      }

      // Vérifier les permissions
      if (user.role === 'agent' && activite.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à cette activité');
      }

      return activite;
    },

    /**
     * Liste des activités spirituelles avec filtres
     */
    activitesSpiritulles: async (_, { filter = {}, sort, pagination = {} }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { ActiviteSpirituelle, User, Dispensaire } = await import('../../models/index.js');

      const where = { isActive: true };

      // Filtres
      if (filter.dispensaireId) {
        where.dispensaireId = filter.dispensaireId;
      } else if (user.role === 'agent') {
        // Les agents voient seulement les activités de leur dispensaire
        where.dispensaireId = user.dispensaireId;
      }

      if (filter.agentId) {
        where.agentId = filter.agentId;
      }

      if (filter.typeActivite) {
        where.typeActivite = filter.typeActivite;
      }

      if (filter.dateFrom && filter.dateTo) {
        where.date = {
          [Op.between]: [new Date(filter.dateFrom), new Date(filter.dateTo)]
        };
      } else if (filter.dateFrom) {
        where.date = {
          [Op.gte]: new Date(filter.dateFrom)
        };
      } else if (filter.dateTo) {
        where.date = {
          [Op.lte]: new Date(filter.dateTo)
        };
      }

      if (filter.search) {
        where[Op.or] = [
          { theme: { [Op.iLike]: `%${filter.search}%` } },
          { precheur: { [Op.iLike]: `%${filter.search}%` } },
          { versetPreche: { [Op.iLike]: `%${filter.search}%` } }
        ];
      }

      if (filter.isActive !== undefined) {
        where.isActive = filter.isActive;
      }

      // Tri
      const order = [];
      if (sort?.field && sort?.direction) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['date', 'DESC']);
      }

      // Pagination
      const limit = pagination.limit || 50;
      const offset = pagination.offset || 0;

      const { count, rows } = await ActiviteSpirituelle.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom', 'role']
          },
          {
            model: Dispensaire,
            as: 'dispensaire',
            attributes: ['id', 'name', 'fileovana']
          }
        ],
        order,
        limit,
        offset
      });

      return {
        activites: rows,
        totalCount: count,
        hasNextPage: offset + limit < count,
        hasPreviousPage: offset > 0
      };
    },

    /**
     * Activités d'un dispensaire
     */
    dispensaireActivites: async (_, { dispensaireId, limit = 50 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { ActiviteSpirituelle, Dispensaire } = await import('../../models/index.js');

      // Vérifier l'accès au dispensaire
      const dispensaire = await Dispensaire.findByPk(dispensaireId);
      if (!dispensaire) {
        throw new UserInputError('Dispensaire non trouvé');
      }

      if (user.role === 'agent' && dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à ce dispensaire');
      }

      return await ActiviteSpirituelle.getByDispensaire(dispensaireId, limit);
    },

    /**
     * Activités récentes
     */
    recentesActivitesSpiritulles: async (_, { limit = 20 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { ActiviteSpirituelle, User, Dispensaire } = await import('../../models/index.js');

      const where = { isActive: true };

      // Restriction par dispensaire si agent
      if (user.role === 'agent') {
        where.dispensaireId = user.dispensaireId;
      }

      return await ActiviteSpirituelle.findAll({
        where,
        include: [
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom']
          },
          {
            model: Dispensaire,
            as: 'dispensaire',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC']],
        limit
      });
    },

    /**
     * Statistiques d'activités spirituelles
     */
    activitesSpirituellesStats: async (_, { dispensaireId, dateFrom, dateTo }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { ActiviteSpirituelle } = await import('../../models/index.js');

      const filters = {};

      if (dispensaireId) {
        if (user.role === 'agent' && dispensaireId !== user.dispensaireId) {
          throw new ForbiddenError('Accès non autorisé à ce dispensaire');
        }
        filters.dispensaireId = dispensaireId;
      } else if (user.role === 'agent') {
        filters.dispensaireId = user.dispensaireId;
      }

      if (dateFrom && dateTo) {
        filters.dateFrom = dateFrom;
        filters.dateTo = dateTo;
      }

      return await ActiviteSpirituelle.getStats(filters);
    }
  },

  Mutation: {
    /**
     * Créer une activité spirituelle
     */
    createActiviteSpirituelle: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { ActiviteSpirituelle, Dispensaire, User } = await import('../../models/index.js');

        // Vérifier que le dispensaire existe
        const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND'],
            activite: null
          };
        }

        // Vérifier les permissions
        if (user.role === 'agent' && input.dispensaireId !== user.dispensaireId) {
          return {
            success: false,
            message: 'Vous ne pouvez créer des activités que pour votre dispensaire',
            errors: ['UNAUTHORIZED_DISPENSAIRE'],
            activite: null
          };
        }

        // Créer l'activité
        const activite = await ActiviteSpirituelle.create({
          ...input,
          agentId: user.id
        });

        // Recharger avec les relations
        await activite.reload({
          include: [
            {
              model: User,
              as: 'agent',
              attributes: ['id', 'nom', 'prenom']
            },
            {
              model: Dispensaire,
              as: 'dispensaire',
              attributes: ['id', 'name', 'fileovana']
            }
          ]
        });

        return {
          activite,
          success: true,
          message: 'Activité spirituelle créée avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Error creating activite spirituelle:', error);

        if (error.name === 'SequelizeValidationError') {
          return {
            success: false,
            message: 'Données invalides',
            errors: error.errors.map(err => err.message),
            activite: null
          };
        }

        return {
          success: false,
          message: 'Erreur lors de la création de l\'activité',
          errors: [error.message],
          activite: null
        };
      }
    },

    /**
     * Modifier une activité spirituelle
     */
    updateActiviteSpirituelle: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { ActiviteSpirituelle, User, Dispensaire } = await import('../../models/index.js');

        const activite = await ActiviteSpirituelle.findByPk(id);
        if (!activite) {
          return {
            success: false,
            message: 'Activité spirituelle non trouvée',
            errors: ['ACTIVITE_NOT_FOUND'],
            activite: null
          };
        }

        // Vérifier les permissions
        const canEdit = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && activite.dispensaireId === user.dispensaireId)
        );

        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['UNAUTHORIZED_EDIT'],
            activite: null
          };
        }

        // Mettre à jour
        await activite.update(input);

        // Recharger avec les relations
        await activite.reload({
          include: [
            {
              model: User,
              as: 'agent'
            },
            {
              model: Dispensaire,
              as: 'dispensaire'
            }
          ]
        });

        return {
          activite,
          success: true,
          message: 'Activité spirituelle modifiée avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Error updating activite spirituelle:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message],
          activite: null
        };
      }
    },

    /**
     * Supprimer une activité spirituelle (soft delete)
     */
    deleteActiviteSpirituelle: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      if (!['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Seuls les administrateurs et managers peuvent supprimer des activités');
      }

      try {
        const { ActiviteSpirituelle } = await import('../../models/index.js');

        const activite = await ActiviteSpirituelle.findByPk(id);
        if (!activite) {
          return {
            success: false,
            message: 'Activité spirituelle non trouvée',
            errors: ['ACTIVITE_NOT_FOUND'],
            activite: null
          };
        }

        // Soft delete
        await activite.update({ isActive: false });

        return {
          success: true,
          message: 'Activité spirituelle supprimée avec succès',
          errors: [],
          activite: null
        };
      } catch (error) {
        console.error('❌ Error deleting activite spirituelle:', error);
        return {
          success: false,
          message: 'Erreur lors de la suppression',
          errors: [error.message],
          activite: null
        };
      }
    }
  },

  // Field resolvers
  ActiviteSpirituelle: {
    dispensaire: async (activite) => {
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(activite.dispensaireId);
    },

    agent: async (activite) => {
      const { User } = await import('../../models/index.js');
      return await User.findByPk(activite.agentId);
    },

    typeLabel: (activite) => {
      return activite.getTypeLabel();
    },

    summary: (activite) => {
      return activite.getSummary();
    },

    isRecent: (activite) => {
      return activite.isRecent();
    },

    isToday: (activite) => {
      return activite.isToday();
    },

    isUpcoming: (activite) => {
      return activite.isUpcoming();
    }
  }
};

export default activiteSprituelleResolvers;