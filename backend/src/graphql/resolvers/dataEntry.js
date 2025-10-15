import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const dataEntryResolvers = {
  // Resolvers de champs
  DataEntry: {
    summary: (dataEntry) => dataEntry.getSummary(),

    patient: async (dataEntry, args, { dataloaders }) => {
      if (dataloaders && dataloaders.patientLoader) {
        return await dataloaders.patientLoader.load(dataEntry.patientId);
      }
      
      const { Patient } = await import('../../models/index.js');
      return await Patient.findByPk(dataEntry.patientId);
    },

    user: async (dataEntry, args, { dataloaders }) => {
      if (dataloaders && dataloaders.userLoader) {
        return await dataloaders.userLoader.load(dataEntry.userId);
      }
      
      const { User } = await import('../../models/index.js');
      return await User.findByPk(dataEntry.userId);
    },

    dispensaire: async (dataEntry, args, { dataloaders }) => {
      if (dataloaders && dataloaders.dispensaireLoader) {
        return await dataloaders.dispensaireLoader.load(dataEntry.dispensaireId);
      }
      
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(dataEntry.dispensaireId);
    }
  },

  Query: {
    dataEntry: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const { DataEntry, Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const dataEntry = await DataEntry.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'user' },
          { model: Dispensaire, as: 'dispensaire' }
        ]
      });
      
      if (!dataEntry) {
        throw new UserInputError('Consultation non trouvée');
      }
      
      // Vérification des permissions
      if (user.role === 'agent' && dataEntry.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à cette consultation');
      }
      
      return dataEntry;
    },

    dataEntries: async (parent, { filter, sort, pagination }, { user }) => {
      requireAuth(user);
      
      const { DataEntry, Patient, User, Dispensaire } = await import('../../models/index.js');
      
      // Construction de la requête avec filtres
      const whereClause = {};
      
      if (filter) {
        if (filter.patientId) whereClause.patientId = filter.patientId;
        if (filter.userId) whereClause.userId = filter.userId;
        if (filter.dispensaireId) whereClause.dispensaireId = filter.dispensaireId;
        if (filter.status) whereClause.status = filter.status;
        
        if (filter.dateFrom || filter.dateTo) {
          whereClause.dateConsultation = {};
          if (filter.dateFrom) whereClause.dateConsultation[Op.gte] = filter.dateFrom;
          if (filter.dateTo) whereClause.dateConsultation[Op.lte] = filter.dateTo;
        }
        
        if (filter.search) {
          whereClause[Op.or] = [
            { diagnostic: { [Op.iLike]: `%${filter.search}%` } },
            { prescription: { [Op.iLike]: `%${filter.search}%` } },
            { notes: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }
      
      // Pour les agents, limiter aux consultations de leur dispensaire
      if (user.role === 'agent') {
        whereClause.dispensaireId = user.dispensaireId;
      }
      
      // Tri
      const order = [];
      if (sort) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['dateConsultation', 'DESC']);
      }
      
      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { rows: dataEntries, count: totalCount } = await DataEntry.findAndCountAll({
        where: whereClause,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order,
        limit,
        offset
      });
      
      return {
        dataEntries,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    },

    patientConsultations: async (parent, { patientId, limit }, { user }) => {
      requireAuth(user);
      
      const { DataEntry, Patient, User, Dispensaire } = await import('../../models/index.js');
      
      // Vérifier l'accès au patient
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        throw new UserInputError('Patient non trouvé');
      }
      
      if (user.role === 'agent' && patient.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé aux consultations de ce patient');
      }
      
      return await DataEntry.findAll({
        where: { patientId },
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'user' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order: [['dateConsultation', 'DESC']],
        limit
      });
    }
  },

  Mutation: {
    createDataEntry: async (parent, { input }, { user }) => {
      
      try {
        // Vérifications d'authentification
        requireAuth(user);
        
        
        const { DataEntry, Patient, Dispensaire } = await import('../../models/index.js');
        
        // ✅ Vérifier que le patient existe
        if (input.patientId) {

          console.log('🔍 AGNATINY patienID:', input.patientId);
          const patient = await Patient.findByPk(input.patientId);
          console.log('🔍 Patient check:', patient ? `✅ ${patient.nom}` : '❌ NULL');
          
          if (!patient) {
            return {
              success: false,
              message: 'Patient non trouvé',
              errors: ['PATIENT_NOT_FOUND'],
              dataEntry: null
            };
          }
        }
        
        // ✅ Vérifier que le dispensaire existe
        if (input.dispensaireId) {
          const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
          console.log('🔍 Dispensaire check:', dispensaire ? `✅ ${dispensaire.name}` : '❌ NULL');
          
          if (!dispensaire) {
            return {
              success: false,
              message: 'Dispensaire non trouvé',
              errors: ['DISPENSAIRE_NOT_FOUND'],
              dataEntry: null
            };
          }
        }
        
        // ✅ Préparer les données pour la création
        const dataEntryData = {
          patientId: input.patientId,
          diagnostic: input.diagnostic,
          prescription: input.prescription,
          notes: input.notes,
          dateConsultation: input.dateConsultation ? new Date(input.dateConsultation) : new Date(),
          dispensaireId: input.dispensaireId,
          userId: user.id, // ✅ IMPORTANT: Ajouter l'utilisateur créateur
          status: 'active', // Valeur par défaut
          isActive: true
        };
        
        console.log('🔄 Creating DataEntry with data:', dataEntryData);
        
        // ✅ Créer l'entrée de données
        const dataEntry = await DataEntry.create(dataEntryData);
        
        console.log('✅ DataEntry created successfully:', {
          id: dataEntry.id,
          patientId: dataEntry.patientId,
          diagnostic: dataEntry.diagnostic?.substring(0, 50) + '...'
        });
        
        // ✅ Récupérer l'entrée créée avec ses relations
        const createdDataEntry = await DataEntry.findByPk(dataEntry.id, {
          include: [
            {
              model: Patient,
              as: 'patient'
            },
            {
              model: Dispensaire,
              as: 'dispensaire'
            },
            {
              model: (await import('../../models/index.js')).User,
              as: 'createdBy'
            }
          ]
        });
        
        console.log('✅ DataEntry retrieved with relations:', createdDataEntry ? 'SUCCESS' : 'NULL');
        
        // ✅ Retourner la structure correcte
        const response = {
          success: true,
          message: 'Consultation créée avec succès',
          errors: [],
          dataEntry: createdDataEntry // ✅ IMPORTANT: Retourner l'objet complet
        };
        
        console.log('🚀 Returning response:', { 
          success: response.success, 
          dataEntryId: response.dataEntry?.id 
        });
        
        return response;
        
      } catch (error) {
        console.error('❌ Error in createDataEntry:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3)
        });
        
        // ✅ Gestion d'erreurs spécifiques
        if (error.name === 'SequelizeValidationError') {
          return {
            success: false,
            message: 'Données de validation invalides',
            errors: error.errors.map(err => `${err.path}: ${err.message}`),
            dataEntry: null
          };
        }
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return {
            success: false,
            message: 'Référence invalide (patient ou dispensaire inexistant)',
            errors: ['FOREIGN_KEY_CONSTRAINT'],
            dataEntry: null
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création de la consultation',
          errors: [error.message],
          dataEntry: null
        };
      }
    },

    updateDataEntry: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      
      try {
        const { DataEntry, Patient, User, Dispensaire } = await import('../../models/index.js');
        
        const dataEntry = await DataEntry.findByPk(id);
        if (!dataEntry) {
          return {
            success: false,
            message: 'Consultation non trouvée',
            errors: ['DATA_ENTRY_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canEdit = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && dataEntry.userId === user.id && dataEntry.dispensaireId === user.dispensaireId)
        );
        
        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes pour modifier cette consultation',
            errors: ['UNAUTHORIZED_EDIT']
          };
        }
        
        await dataEntry.update(input);
        
        // Récupérer la consultation mise à jour
        const updatedDataEntry = await DataEntry.findByPk(id, {
          include: [
            { model: Patient, as: 'patient' },
            { model: User, as: 'user' },
            { model: Dispensaire, as: 'dispensaire' }
          ]
        });
        
        return {
          dataEntry: updatedDataEntry,
          success: true,
          message: 'Consultation modifiée avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur modification consultation:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message]
        };
      }
    },

    completeConsultation: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      try {
        const { DataEntry } = await import('../../models/index.js');
        
        const dataEntry = await DataEntry.findByPk(id);
        if (!dataEntry) {
          return {
            success: false,
            message: 'Consultation non trouvée',
            errors: ['DATA_ENTRY_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canEdit = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && dataEntry.userId === user.id)
        );
        
        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes',
            errors: ['UNAUTHORIZED_EDIT']
          };
        }
        
        await dataEntry.markAsCompleted();
        
        return {
          dataEntry: await DataEntry.findByPk(id, {
            include: [
              { model: (await import('../../models/index.js')).Patient, as: 'patient' },
              { model: (await import('../../models/index.js')).User, as: 'user' },
              { model: (await import('../../models/index.js')).Dispensaire, as: 'dispensaire' }
            ]
          }),
          success: true,
          message: 'Consultation marquée comme terminée',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur completion consultation:', error);
        return {
          success: false,
          message: 'Erreur lors de la completion',
          errors: [error.message]
        };
      }
    }
  }
};

export default dataEntryResolvers;