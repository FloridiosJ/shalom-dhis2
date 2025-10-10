import { UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const patientResolvers = {
  // Resolvers de champs
  Patient: {
    displayName: (patient) => patient.getDisplayName(),
    categorieAge: (patient) => patient.getCategorieAge(),
    isMineur: (patient) => patient.isMineur(),

    createdBy: async (patient, args, { dataloaders }) => {
      if (dataloaders && dataloaders.userLoader) {
        return await dataloaders.userLoader.load(patient.userId);
      }
      
      const { User } = await import('../../models/index.js');
      return await User.findByPk(patient.userId);
    },

    dispensaire: async (patient, args, { dataloaders }) => {
      if (dataloaders && dataloaders.dispensaireLoader) {
        return await dataloaders.dispensaireLoader.load(patient.dispensaireId);
      }
      
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(patient.dispensaireId);
    },

    consultations: async (patient, args, { dataloaders }) => {
      const { DataEntry } = await import('../../models/index.js');
      return await DataEntry.findAll({
        where: { patientId: patient.id },
        order: [['createdAt', 'DESC']],
        limit: 50 // Limiter pour éviter les requêtes trop lourdes
      });
    }
  },

  Query: {
    patient: async (parent, { id }, { user }) => {
      requireAuth(user);
      
      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const patient = await Patient.findByPk(id, {
        include: [
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' }
        ]
      });
      
      if (!patient) {
        throw new UserInputError('Patient non trouvé');
      }
      
      // Vérification des permissions
      if (user.role === 'agent' && patient.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à ce patient');
      }
      
      return patient;
    },

    patientByNumero: async (parent, { numero }, { user }) => {
      requireAuth(user);
      
      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const patient = await Patient.findOne({
        where: { numeroPatient: numero },
        include: [
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' }
        ]
      });
      
      if (!patient) {
        throw new UserInputError('Patient non trouvé');
      }
      
      // Vérification des permissions
      if (user.role === 'agent' && patient.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à ce patient');
      }
      
      return patient;
    },

    patients: async (parent, { filter, sort, pagination }, { user }) => {
      requireAuth(user);
      
      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      // Construction de la requête avec filtres
      const whereClause = {};
      
      if (filter) {
        if (filter.dispensaireId) whereClause.dispensaireId = filter.dispensaireId;
        if (filter.religion) whereClause.religion = filter.religion;
        if (filter.sexe) whereClause.sexe = filter.sexe;
        if (filter.village) whereClause.village = { [Op.iLike]: `%${filter.village}%` };
        if (filter.ageMin !== undefined) whereClause.age = { [Op.gte]: filter.ageMin };
        if (filter.ageMax !== undefined) {
          whereClause.age = whereClause.age 
            ? { ...whereClause.age, [Op.lte]: filter.ageMax }
            : { [Op.lte]: filter.ageMax };
        }
        if (filter.isActive !== undefined) whereClause.isActive = filter.isActive;
        if (filter.search) {
          whereClause[Op.or] = [
            { nom: { [Op.iLike]: `%${filter.search}%` } },
            { village: { [Op.iLike]: `%${filter.search}%` } },
            { numeroPatient: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }
      
      // Pour les agents, limiter aux patients de leur dispensaire
      if (user.role === 'agent') {
        whereClause.dispensaireId = user.dispensaireId;
      }
      
      // Tri
      const order = [];
      if (sort) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['nom', 'ASC']);
      }
      
      // Pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { rows: patients, count: totalCount } = await Patient.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order,
        limit,
        offset
      });
      
      return {
        patients,
        totalCount,
        hasNextPage: offset + limit < totalCount,
        hasPreviousPage: page > 1
      };
    },

    searchPatients: async (parent, { query, dispensaireId, limit }, { user }) => {
      requireAuth(user);
      
      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const whereClause = {
        [Op.or]: [
          { nom: { [Op.iLike]: `%${query}%` } },
          { village: { [Op.iLike]: `%${query}%` } },
          { numeroPatient: { [Op.iLike]: `%${query}%` } }
        ]
      };
      
      if (dispensaireId && (user.role !== 'agent' || user.dispensaireId === dispensaireId)) {
        whereClause.dispensaireId = dispensaireId;
      } else if (user.role === 'agent') {
        whereClause.dispensaireId = user.dispensaireId;
      }
      
      return await Patient.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' }
        ],
        order: [['nom', 'ASC']],
        limit
      });
    }
  },

  Mutation: {
    createPatient: async (parent, { input }, { user }) => {
      requireAuth(user);
      
      try {

        const { Patient, Dispensaire } = await import('../../models/index.js');
        
        // Vérifier que le dispensaire existe
        const dispensaire = await Dispensaire.findByPk(input.dispensaireId);

        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        if (user.role === 'agent' && user.dispensaireId !== input.dispensaireId) {
          return {
            success: false,
            message: 'Vous ne pouvez créer des patients que pour votre dispensaire',
            errors: ['UNAUTHORIZED_DISPENSAIRE']
          };
        }
        
        // Créer le patient
        const patient = await Patient.create({
          ...input,
          userId: user.id
        });
        // Récupérer le patient créé avec ses relations
        const createdPatient = await Patient.findByPk(patient.id, {
          include: [
            { model: (await import('../../models/index.js')).User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' }
          ]
        });
        
        return {
          patient: createdPatient,
          success: true,
          message: 'Patient créé avec succès',
          generatedNumero: patient.numeroPatient,
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur création patient:', error);
        
        if (error.name === 'SequelizeValidationError') {
          return {
            success: false,
            message: 'Données invalides',
            errors: error.errors.map(err => err.message)
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création du patient',
          errors: [error.message]
        };
      }
    },

    updatePatient: async (parent, { id, input }, { user }) => {
      requireAuth(user);
      
      try {
        const { Patient, User, Dispensaire } = await import('../../models/index.js');
        
        const patient = await Patient.findByPk(id);
        if (!patient) {
          return {
            success: false,
            message: 'Patient non trouvé',
            errors: ['PATIENT_NOT_FOUND']
          };
        }
        
        // Vérification des permissions
        const canEdit = (
          user.role === 'admin' ||
          user.role === 'manager' ||
          (user.role === 'agent' && patient.dispensaireId === user.dispensaireId)
        );
        
        if (!canEdit) {
          return {
            success: false,
            message: 'Permissions insuffisantes pour modifier ce patient',
            errors: ['UNAUTHORIZED_EDIT']
          };
        }
        
        await patient.update(input);
        
        // Récupérer le patient mis à jour
        const updatedPatient = await Patient.findByPk(id, {
          include: [
            { model: User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' }
          ]
        });
        
        return {
          patient: updatedPatient,
          success: true,
          message: 'Patient modifié avec succès',
          errors: []
        };
        
      } catch (error) {
        console.error('❌ Erreur modification patient:', error);
        return {
          success: false,
          message: 'Erreur lors de la modification',
          errors: [error.message]
        };
      }
    }
  }
};

export default patientResolvers;