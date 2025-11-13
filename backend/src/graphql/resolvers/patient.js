import { AuthenticationError, UserInputError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';

const patientResolvers = {
  Query: {
    patient: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

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
      
      if (user.role === 'agent' && patient.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à ce patient');
      }
      
      return patient;
    },

    patientByNumero: async (_, { numero }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

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
      
      if (user.role === 'agent' && patient.dispensaireId !== user.dispensaireId) {
        throw new ForbiddenError('Accès non autorisé à ce patient');
      }
      
      return patient;
    },

    patients: async (_, { filter = {}, sort, pagination = {} }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const whereClause = { isActive: true };
      
      if (filter.dispensaireId) {
        whereClause.dispensaireId = filter.dispensaireId;
      }
      
      if (filter.religion) {
        whereClause.religion = filter.religion;
      }
      
      if (filter.sexe) {
        whereClause.sexe = filter.sexe;
      }
      
      if (filter.village) {
        whereClause.village = { [Op.iLike]: `%${filter.village}%` };
      }
      
      if (filter.ageMin !== undefined) {
        whereClause.age = { [Op.gte]: filter.ageMin };
      }
      
      if (filter.ageMax !== undefined) {
        whereClause.age = whereClause.age
          ? { ...whereClause.age, [Op.lte]: filter.ageMax }
          : { [Op.lte]: filter.ageMax };
      }
      
      if (filter.search) {
        whereClause[Op.or] = [
          { nom: { [Op.iLike]: `%${filter.search}%` } },
          { prenom: { [Op.iLike]: `%${filter.search}%` } },
          { village: { [Op.iLike]: `%${filter.search}%` } },
          { numeroPatient: { [Op.iLike]: `%${filter.search}%` } }
        ];
      }
      
      // Restriction par dispensaire si agent
      if (user.role === 'agent') {
        whereClause.dispensaireId = user.dispensaireId;
      }
      
      const order = [];
      if (sort?.field && sort?.direction) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['nom', 'ASC']);
      }
      
      const limit = pagination.limit || 50;
      const offset = pagination.offset || 0;
      
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
        hasPreviousPage: offset > 0
      };
    },

    searchPatients: async (_, { query, dispensaireId, limit = 10 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Patient, User, Dispensaire } = await import('../../models/index.js');
      
      const whereClause = {
        isActive: true,
        [Op.or]: [
          { nom: { [Op.iLike]: `%${query}%` } },
          { prenom: { [Op.iLike]: `%${query}%` } },
          { village: { [Op.iLike]: `%${query}%` } },
          { numeroPatient: { [Op.iLike]: `%${query}%` } }
        ]
      };
      
      if (dispensaireId) {
        if (user.role === 'agent' && user.dispensaireId !== dispensaireId) {
          throw new ForbiddenError('Accès non autorisé à ce dispensaire');
        }
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
    createPatient: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { Patient, Dispensaire, User } = await import('../../models/index.js');
        
        console.log('📋 Creating patient with input:', input);
        console.log('👤 User:', user.id, user.role);

        // Vérifier que le dispensaire existe
        const dispensaire = await Dispensaire.findByPk(input.dispensaireId);
        if (!dispensaire) {
          return {
            success: false,
            message: 'Dispensaire non trouvé',
            errors: ['DISPENSAIRE_NOT_FOUND'],
            patient: null
          };
        }

        // Vérification des permissions
        if (user.role === 'agent' && user.dispensaireId !== input.dispensaireId) {
          return {
            success: false,
            message: 'Vous ne pouvez créer des patients que pour votre dispensaire',
            errors: ['UNAUTHORIZED_DISPENSAIRE'],
            patient: null
          };
        }

        // Validate that either dateNaissance or age is provided
        if (!input.dateNaissance && !input.age) {
          return {
            success: false,
            message: 'La date de naissance est obligatoire',
            errors: ['DATE_NAISSANCE_REQUIRED'],
            patient: null
          };
        }

        // Calculate age from dateNaissance if provided
        let calculatedAge = input.age;
        if (input.dateNaissance) {
          const birthDate = new Date(input.dateNaissance);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          calculatedAge = Math.max(0, calculatedAge);
        }

        // Créer le patient (le hook beforeValidate générera le numeroPatient)
        const patientData = {
          ...input,
          age: calculatedAge, // Store calculated age for backward compatibility
          userId: user.id
        };

        console.log('💾 Creating patient with data:', patientData);

        const patient = await Patient.create(patientData);

        console.log('✅ Patient created:', patient.id, patient.numeroPatient);

        // Récupérer le patient avec ses relations
        const createdPatient = await Patient.findByPk(patient.id, {
          include: [
            { model: User, as: 'createdBy' },
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
            errors: error.errors.map(err => err.message),
            patient: null
          };
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
          return {
            success: false,
            message: 'Ce numéro patient existe déjà',
            errors: ['NUMERO_PATIENT_ALREADY_EXISTS'],
            patient: null
          };
        }
        
        return {
          success: false,
          message: 'Erreur lors de la création du patient',
          errors: [error.message],
          patient: null
        };
      }
    },

    updatePatient: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { Patient, User, Dispensaire } = await import('../../models/index.js');
        
        const patient = await Patient.findByPk(id);
        if (!patient) {
          return {
            success: false,
            message: 'Patient non trouvé',
            errors: ['PATIENT_NOT_FOUND'],
            patient: null
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
            errors: ['UNAUTHORIZED_EDIT'],
            patient: null
          };
        }

        await patient.update(input);

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
          errors: [error.message],
          patient: null
        };
      }
    },

    deletePatient: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      if (!['admin', 'manager'].includes(user.role)) {
        throw new ForbiddenError('Seuls les administrateurs et managers peuvent supprimer des patients');
      }

      try {
        const { Patient } = await import('../../models/index.js');
        
        const patient = await Patient.findByPk(id);
        if (!patient) {
          return {
            success: false,
            message: 'Patient non trouvé',
            errors: ['PATIENT_NOT_FOUND'],
            patient: null
          };
        }

        // Soft delete
        await patient.update({ isActive: false });

        return {
          success: true,
          message: 'Patient supprimé avec succès',
          errors: [],
          patient: null
        };
      } catch (error) {
        console.error('❌ Erreur suppression patient:', error);
        return {
          success: false,
          message: 'Erreur lors de la suppression',
          errors: [error.message],
          patient: null
        };
      }
    }
  },

  // Field resolvers
  Patient: {
    createdBy: async (patient) => {
      const { User } = await import('../../models/index.js');
      return await User.findByPk(patient.userId);
    },

    dispensaire: async (patient) => {
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(patient.dispensaireId);
    },

    consultations: async (patient) => {
      const { DataEntry } = await import('../../models/index.js');
      return await DataEntry.findAll({
        where: { 
          patientId: patient.id,
          isActive: true 
        },
        order: [['dateConsultation', 'DESC']],
        limit: 10
      });
    },

    vaccinations: async (patient) => {
      const { Vaccination } = await import('../../models/index.js');
      return await Vaccination.findAll({
        where: { 
          patientId: patient.id,
          isActive: true 
        },
        order: [['dateVaccination', 'DESC']],
        limit: 20
      });
    },

    displayName: (patient) => {
      return patient.prenom 
        ? `${patient.nom} ${patient.prenom}` 
        : patient.nom;
    },

    // Calculate age dynamically from dateNaissance
    age: (patient) => {
      if (patient.dateNaissance) {
        const birthDate = new Date(patient.dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return Math.max(0, age);
      }
      
      // Fallback to stored age if dateNaissance not available
      return patient.age || 0;
    },

    categorieAge: (patient) => {
      // Use the age field resolver to get calculated age
      const age = patient.dateNaissance ? (() => {
        const birthDate = new Date(patient.dateNaissance);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        return Math.max(0, calculatedAge);
      })() : (patient.age || 0);
      
      if (age < 1) return 'Nourrisson';
      if (age < 5) return 'Jeune enfant';
      if (age < 12) return 'Enfant';
      if (age < 18) return 'Adolescent';
      if (age < 60) return 'Adulte';
      return 'Senior';
    },

    isMineur: (patient) => {
      // Use the age field resolver to get calculated age
      const age = patient.dateNaissance ? (() => {
        const birthDate = new Date(patient.dateNaissance);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        return Math.max(0, calculatedAge);
      })() : (patient.age || 0);
      
      return age < 18;
    }
  }
};

export default patientResolvers;