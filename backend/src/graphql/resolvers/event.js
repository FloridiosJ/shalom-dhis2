import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const eventResolvers = {
  // Resolvers de champs
  Event: {
    fullTitle: (event) => event.getFullTitle(),
    isToday: (event) => event.isToday(),
    isUpcoming: (event) => event.isUpcoming(),

    organisateur: async (event, args, { dataloaders }) => {
      if (dataloaders && dataloaders.userLoader) {
        return await dataloaders.userLoader.load(event.userId);
      }
      
      const { User } = await import('../../models/index.js');
      return await User.findByPk(event.userId);
    },

    dispensaire: async (event, args, { dataloaders }) => {
      if (!event.dispensaireId) return null;
      
      if (dataloaders && dataloaders.dispensaireLoader) {
        return await dataloaders.dispensaireLoader.load(event.dispensaireId);
      }
      
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(event.dispensaireId);
    }
  },

  Query: {
    event: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const { Event, User, Dispensaire } = await import('../../models/index.js');
      
      const event = await Event.findByPk(id, {
        include: [
          { model: User, as: 'organisateur' },
          { model: Dispensaire, as: 'dispensaire' }
        ]
      });
      
      if (!event) {
        throw new UserInputError('Événement non trouvé');
      }
      
      // Vérification des permissions
      if (user.role === 'agent' && event.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à cet événement');
      }
      
      return event;
    },

    events: async (parent, { filter, sort, pagination }, { user }) => {
      requireAuth(user);
      
      const { Event, User, Dispensaire } = await import('../../models/index.js');
      
      // Construction de la requête avec filtres
      const whereClause = {};
      
      if (filter) {
        if (filter.type_event) whereClause.type_event = { [Op.iLike]: `%${filter.type_event}%` };
        if (filter.outils) whereClause.outils = filter.outils;
        if (filter.status) whereClause.status = filter.status;
        if (filter.userId) whereClause.userId = filter.userId;
        if (filter.dispensaireId) whereClause.dispensaireId = filter.dispensaireId;
        if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
        
        if (filter.dateFrom || filter.dateTo) {
          whereClause.date = {};
          if (filter.dateFrom) whereClause.date[Op.gte] = filter.dateFrom;
          if (filter.dateTo) whereClause.date[Op.lte] = filter.dateTo;
        }
        
        if (filter.search) {
          whereClause[Op.or] = [
            { type_event: { [Op.iLike]: `%${filter.search}%` } },
            { participant: { [Op.iLike]: `%${filter.search}%` } },
            { description: { [Op.iLike]: `%${filter.search}%` } },
            { lieu: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }
      
      // Pour les agents, limiter aux événements de leur dispensaire
      if (user.role === 'agent') {
        whereClause[Op.or] = [
          { dispensaireId: user.dispensaireId },
          { userId: user.id } // Événements créés par l'agent
        ];
      }
      
      // Tri
      const order = [];
      if (sort) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['date', 'ASC']);
      }
      
      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { rows: events, count: totalCount } = await Event.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'organisateur' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order,
        limit,
        offset
      });
      
      return {
        events,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    },

    upcomingEvents: async (parent, { dispensaireId, limit }, { user }) => {
      requireAuth(user);
      
      const { Event, User, Dispensaire } = await import('../../models/index.js');
      
      const whereClause = {
        date: { [Op.gt]: new Date() },
        status: ['planifie', 'en_cours'],
        isActive: true
      };
      
      if (dispensaireId && (user.role !== 'agent' || user.dispensaireId === dispensaireId)) {
        whereClause.dispensaireId = dispensaireId;
      } else if (user.role === 'agent') {
        whereClause[Op.or] = [
          { dispensaireId: user.dispensaireId },
          { userId: user.id }
        ];
      }
      
      return await Event.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'organisateur' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order: [['date', 'ASC']],
        limit
      });
    },

    todayEvents: async (parent, { dispensaireId }, { user }) => {
      requireAuth(user);
      
      const { Event, User, Dispensaire } = await import('../../models/index.js');
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const whereClause = {
        date: {
          [Op.gte]: today.setHours(0, 0, 0, 0),
          [Op.lt]: tomorrow.setHours(0, 0, 0, 0)
        },
        isActive: true
      };
      
      if (dispensaireId && (user.role !== 'agent' || user.dispensaireId === dispensaireId)) {
        whereClause.dispensaireId = dispensaireId;
      } else if (user.role === 'agent') {
        whereClause[Op.or] = [
          { dispensaireId: user.dispensaireId },
          { userId: user.id }
        ];
      }
      
      return await Event.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'organisateur' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order: [['date', 'ASC']]
      });
    }
  },

  Mutation: {
    createEvent: async (parent, { input }, { user }) => {
      requireAuth(user);
      
      try {
        console.log('🔄 Création événement:', { 
          type_event: input.type_event, 
          date: input.date,
          outils: input.outils 
        });

        const { Event, Dispensaire } = await import('../../models/index.js');
        
        // Vérifier que le dispensaire existe (si spécifié)
        if (input.dispensaireId) {
          const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
          if (!dispensaire) {
            return {
              success: false,
              message: 'Dispensaire non trouvé',
              errors: ['DISPENSAIRE_NOT_FOUND']
            };
          }
        }
        
        // Vérification des permissions pour dispensaire
        if (input.dispensaireId && user.role === 'agent' && user.dispensaireId !== input.dispensaireId) {
          return {
            success: false,
            message: 'Vous ne pouvez créer des événements que pour votre dispensaire',
            errors: ['UNAUTHORIZED_DISPENSAIRE']
          };
        }
        
        // Créer l'événement
        const event = await Event.create({
          ...input,
          userId: user.id
        });
        
        // Récupérer l'événement créé avec ses relations
        const createdEvent = await Event.findByPk(event.id, {
          include: [
            { model: (await import('../../models/index.js')).User, as: 'organisateur' },
            { model: Dispensaire, as: 'dispensaire' }
          ]
        });
        
        console.log('✅ Événement créé avec succès:', {
          id: event.id,
          type_event: event.type_event,
          date: event.date,
          outils: event.outils
        });
        
        return {
          event: createdEvent,
          success: true,
          message: 'Événement créé avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur création événement:', error);
        
        if (error.name === 'SequelizeValidationError') {
          return {
            success: false,
            message: 'Données invalides',
            errors: error.errors.map(err => err.message)
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création de l\'événement',
          errors: [error.message]
        };
      }
    },

    updateEvent: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      
      try {
        const { Event, User, Dispensaire } = await import('../../models/index.js');
        
        const event = await Event.findByPk(id);
        if (!event) {
          return {
            success: false,
            message: 'Événement non trouvé',
            errors: ['EVENT_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canEdit = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && event.userId === user.id)
        );
        
        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes pour modifier cet événement',
            errors: ['UNAUTHORIZED_EDIT']
          };
        }
        
        await event.update(input);
        
        // Récupérer l'événement mis à jour
        const updatedEvent = await Event.findByPk(id, {
          include: [
            { model: User, as: 'organisateur' },
            { model: Dispensaire, as: 'dispensaire' }
          ]
        });
        
        return {
          event: updatedEvent,
          success: true,
          message: 'Événement modifié avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur modification événement:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message]
        };
      }
    },

    startEvent: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      try {
        const { Event } = await import('../../models/index.js');
        
        const event = await Event.findByPk(id);
        if (!event) {
          return {
            success: false,
            message: 'Événement non trouvé',
            errors: ['EVENT_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canStart = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && event.userId === user.id)
        );
        
        if (!canStart) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['UNAUTHORIZED_START']
          };
        }
        
        await event.start();
        
        return {
          event: await Event.findByPk(id, {
            include: [
              { model: (await import('../../models/index.js')).User, as: 'organisateur' },
              { model: (await import('../../models/index.js')).Dispensaire, as: 'dispensaire' }
            ]
          }),
          success: true,
          message: 'Événement démarré avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur démarrage événement:', error);
        return {
          success: false,
          message: 'Erreur lors du démarrage',
          errors: [error.message]
        };
      }
    },

    completeEvent: async (parent, { id, nombreParticipants }, { user }) => {
      requireAuth(user);
      
      try {
        const { Event } = await import('../../models/index.js');
        
        const event = await Event.findByPk(id);
        if (!event) {
          return {
            success: false,
            message: 'Événement non trouvé',
            errors: ['EVENT_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canComplete = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && event.userId === user.id)
        );
        
        if (!canComplete) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['UNAUTHORIZED_COMPLETE']
          };
        }
        
        await event.complete(nombreParticipants);
        
        return {
          event: await Event.findByPk(id, {
            include: [
              { model: (await import('../../models/index.js')).User, as: 'organisateur' },
              { model: (await import('../../models/index.js')).Dispensaire, as: 'dispensaire' }
            ]
          }),
          success: true,
          message: 'Événement terminé avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur completion événement:', error);
        return {
          success: false,
          message: 'Erreur lors de la completion',
          errors: [error.message]
        };
      }
    }
  }
};

export default eventResolvers;