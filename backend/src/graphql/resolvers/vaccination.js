import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';

const vaccinationResolvers = {
  Query: {
    /**
     * Récupérer une vaccination par ID
     */
    vaccination: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient, User, DataEntry } = await import('../../models/index.js');

      const vaccination = await Vaccination.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'nom', 'prenom', 'numeroPatient', 'age', 'sexe']
          },
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom', 'specialite', 'role']
          },
          {
            model: DataEntry,
            as: 'dataEntry',
            attributes: ['id', 'diagnostic', 'dateConsultation']
          }
        ]
      });

      if (!vaccination) {
        throw new UserInputError('Vaccination non trouvée');
      }

      // Vérifier les permissions
      if (user.role !== 'admin' && vaccination.agentId !== user.id) {
        const patient = await Patient.findByPk(vaccination.patientId);
        if (patient.dispensaireId !== user.dispensaireId) {
          throw new AuthenticationError('Accès non autorisé');
        }
      }

      return vaccination;
    },

    /**
     * Liste des vaccinations avec filtres
     */
    vaccinations: async (_, { filter = {}, sort, pagination = {} }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient, User, DataEntry } = await import('../../models/index.js');

      const where = { isActive: true };

      // Filtres
      if (filter.patientId) {
        where.patientId = filter.patientId;
      }

      if (filter.agentId) {
        where.agentId = filter.agentId;
      }

      if (filter.typeVaccin) {
        where.typeVaccin = filter.typeVaccin;
      }

      if (filter.dateFrom && filter.dateTo) {
        where.dateVaccination = {
          [Op.between]: [new Date(filter.dateFrom), new Date(filter.dateTo)]
        };
      } else if (filter.dateFrom) {
        where.dateVaccination = {
          [Op.gte]: new Date(filter.dateFrom)
        };
      } else if (filter.dateTo) {
        where.dateVaccination = {
          [Op.lte]: new Date(filter.dateTo)
        };
      }

      if (filter.isActive !== undefined) {
        where.isActive = filter.isActive;
      }

      // Restriction par dispensaire si non admin
      if (user.role !== 'admin') {
        const patients = await Patient.findAll({
          where: { dispensaireId: user.dispensaireId },
          attributes: ['id']
        });
        where.patientId = {
          [Op.in]: patients.map(p => p.id)
        };
      }

      // Tri
      const order = [];
      if (sort?.field && sort?.direction) {
        order.push([sort.field, sort.direction]);
      } else {
        order.push(['dateVaccination', 'DESC']);
      }

      // Pagination
      const limit = pagination.limit || 50;
      const offset = pagination.offset || 0;

      const { count, rows } = await Vaccination.findAndCountAll({
        where,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'nom', 'prenom', 'numeroPatient', 'age', 'sexe']
          },
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom', 'specialite']
          },
          {
            model: DataEntry,
            as: 'dataEntry',
            attributes: ['id', 'diagnostic', 'dateConsultation']
          }
        ],
        order,
        limit,
        offset
      });

      return {
        vaccinations: rows,
        totalCount: count,
        hasNextPage: offset + limit < count,
        hasPreviousPage: offset > 0
      };
    },

    /**
     * Historique de vaccination d'un patient
     */
    patientVaccinations: async (_, { patientId, limit = 50 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient, User } = await import('../../models/index.js');

      // Vérifier l'accès au patient
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        throw new UserInputError('Patient non trouvé');
      }

      if (user.role !== 'admin' && patient.dispensaireId !== user.dispensaireId) {
        throw new AuthenticationError('Accès non autorisé');
      }

      return await Vaccination.getPatientHistory(patientId, limit);
    },

    /**
     * Vaccinations récentes
     */
    recentVaccinations: async (_, { limit = 20 }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient, User } = await import('../../models/index.js');

      const where = { isActive: true };

      // Restriction par dispensaire si non admin
      if (user.role !== 'admin') {
        const patients = await Patient.findAll({
          where: { dispensaireId: user.dispensaireId },
          attributes: ['id']
        });
        where.patientId = {
          [Op.in]: patients.map(p => p.id)
        };
      }

      return await Vaccination.findAll({
        where,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'nom', 'prenom', 'numeroPatient']
          },
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'nom', 'prenom']
          }
        ],
        order: [['dateVaccination', 'DESC']],
        limit
      });
    },

    /**
     * Statistiques de vaccination
     */
    vaccinationStats: async (_, { agentId, dateFrom, dateTo }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination } = await import('../../models/index.js');

      const filters = {};

      if (agentId) {
        if (user.role !== 'admin' && agentId !== user.id) {
          throw new AuthenticationError('Accès non autorisé');
        }
        filters.agentId = agentId;
      } else if (user.role !== 'admin') {
        filters.agentId = user.id;
      }

      if (dateFrom && dateTo) {
        filters.dateFrom = dateFrom;
        filters.dateTo = dateTo;
      }

      const stats = await Vaccination.getStats(filters);

      // Calculer le total pour les pourcentages
      const total = stats.reduce((sum, stat) => sum + stat.count, 0);

      return stats.map(stat => ({
        ...stat,
        pourcentage: total > 0 ? (stat.count / total) * 100 : 0
      }));
    },

    /**
     * Couverture vaccinale
     */
    couvertureVaccinale: async (_, { dispensaireId, dateFrom, dateTo }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient } = await import('../../models/index.js');
      const { sequelize } = await import('../../config/db.js');

      const targetDispensaireId = dispensaireId || user.dispensaireId;

      if (user.role !== 'admin' && targetDispensaireId !== user.dispensaireId) {
        throw new AuthenticationError('Accès non autorisé');
      }

      // Compter les patients du dispensaire
      const totalPatients = await Patient.count({
        where: {
          dispensaireId: targetDispensaireId,
          isActive: true
        }
      });

      // Filtres pour les vaccinations
      const vaccinWhere = { isActive: true };

      if (dateFrom && dateTo) {
        vaccinWhere.dateVaccination = {
          [Op.between]: [new Date(dateFrom), new Date(dateTo)]
        };
      }

      // Compter les vaccinations
      const patients = await Patient.findAll({
        where: { dispensaireId: targetDispensaireId },
        attributes: ['id']
      });

      vaccinWhere.patientId = {
        [Op.in]: patients.map(p => p.id)
      };

      const totalVaccinations = await Vaccination.count({
        where: vaccinWhere
      });

      // Statistiques par type de vaccin
      const statsByType = await Vaccination.findAll({
        where: vaccinWhere,
        attributes: [
          'typeVaccin',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['typeVaccin'],
        raw: true
      });

      const parVaccin = statsByType.map(stat => {
        const vaccination = new Vaccination({ typeVaccin: stat.typeVaccin });
        return {
          typeVaccin: stat.typeVaccin,
          label: vaccination.getVaccinLabel(),
          count: parseInt(stat.count),
          pourcentage: totalVaccinations > 0 
            ? (parseInt(stat.count) / totalVaccinations) * 100 
            : 0
        };
      });

      return {
        totalPatients,
        totalVaccinations,
        parVaccin,
        tauxCouverture: totalPatients > 0 
          ? (totalVaccinations / totalPatients) * 100 
          : 0
      };
    }
  },

  Mutation: {
    /**
     * Créer une vaccination
     */
    createVaccination: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient, DataEntry } = await import('../../models/index.js');

      try {
        // Vérifier que le patient existe
        const patient = await Patient.findByPk(input.patientId);
        if (!patient) {
          throw new UserInputError('Patient non trouvé');
        }

        // Vérifier les permissions
        if (user.role !== 'admin' && patient.dispensaireId !== user.dispensaireId) {
          throw new AuthenticationError('Accès non autorisé');
        }

        // Vérifier la consultation si fournie
        if (input.dataEntryId) {
          const dataEntry = await DataEntry.findByPk(input.dataEntryId);
          if (!dataEntry) {
            throw new UserInputError('Consultation non trouvée');
          }
          if (dataEntry.patientId !== input.patientId) {
            throw new UserInputError('La consultation ne correspond pas au patient');
          }
        }

        // Vérifier qu'il n'existe pas déjà une vaccination identique
        const existing = await Vaccination.findOne({
          where: {
            patientId: input.patientId,
            typeVaccin: input.typeVaccin,
            dateVaccination: input.dateVaccination,
            isActive: true
          }
        });

        if (existing) {
          throw new UserInputError('Cette vaccination existe déjà pour ce patient');
        }

        // Créer la vaccination
        const vaccination = await Vaccination.create({
          ...input,
          agentId: user.id
        });

        // Recharger avec les relations
        await vaccination.reload({
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'nom', 'prenom', 'numeroPatient']
            },
            {
              model: await import('../../models/user.js').then(m => m.default),
              as: 'agent',
              attributes: ['id', 'nom', 'prenom', 'specialite']
            }
          ]
        });

        return {
          vaccination,
          success: true,
          message: 'Vaccination enregistrée avec succès',
          errors: []
        };
      } catch (error) {
        console.error('Error creating vaccination:', error);
        return {
          vaccination: null,
          success: false,
          message: 'Erreur lors de l\'enregistrement de la vaccination',
          errors: [error.message]
        };
      }
    },

    /**
     * Modifier une vaccination
     */
    updateVaccination: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient } = await import('../../models/index.js');

      try {
        const vaccination = await Vaccination.findByPk(id);
        if (!vaccination) {
          throw new UserInputError('Vaccination non trouvée');
        }

        // Vérifier les permissions
        const patient = await Patient.findByPk(vaccination.patientId);
        if (user.role !== 'admin' && 
            vaccination.agentId !== user.id &&
            patient.dispensaireId !== user.dispensaireId) {
          throw new AuthenticationError('Accès non autorisé');
        }

        // Mettre à jour
        await vaccination.update(input);

        // Recharger avec les relations
        await vaccination.reload({
          include: [
            {
              model: Patient,
              as: 'patient'
            },
            {
              model: await import('../../models/user.js').then(m => m.default),
              as: 'agent'
            }
          ]
        });

        return {
          vaccination,
          success: true,
          message: 'Vaccination mise à jour avec succès',
          errors: []
        };
      } catch (error) {
        console.error('Error updating vaccination:', error);
        return {
          vaccination: null,
          success: false,
          message: 'Erreur lors de la mise à jour',
          errors: [error.message]
        };
      }
    },

    /**
     * Supprimer une vaccination (soft delete)
     */
    deleteVaccination: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Vaccination, Patient } = await import('../../models/index.js');

      try {
        const vaccination = await Vaccination.findByPk(id);
        if (!vaccination) {
          throw new UserInputError('Vaccination non trouvée');
        }

        // Vérifier les permissions
        const patient = await Patient.findByPk(vaccination.patientId);
        if (user.role !== 'admin' && patient.dispensaireId !== user.dispensaireId) {
          throw new AuthenticationError('Accès non autorisé');
        }

        // Soft delete
        await vaccination.update({ isActive: false });

        return {
          vaccination: null,
          success: true,
          message: 'Vaccination supprimée avec succès',
          errors: []
        };
      } catch (error) {
        console.error('Error deleting vaccination:', error);
        return {
          vaccination: null,
          success: false,
          message: 'Erreur lors de la suppression',
          errors: [error.message]
        };
      }
    }
  },

  // Field resolvers
  Vaccination: {
    patient: async (vaccination) => {
      const { Patient } = await import('../../models/index.js');
      return await Patient.findByPk(vaccination.patientId);
    },

    agent: async (vaccination) => {
      const { User } = await import('../../models/index.js');
      return await User.findByPk(vaccination.agentId);
    },

    dataEntry: async (vaccination) => {
      if (!vaccination.dataEntryId) return null;
      const { DataEntry } = await import('../../models/index.js');
      return await DataEntry.findByPk(vaccination.dataEntryId);
    },

    vaccinLabel: (vaccination) => {
      return vaccination.getVaccinLabel();
    },

    summary: (vaccination) => {
      return vaccination.getSummary();
    },

    isRecent: (vaccination) => {
      return vaccination.isRecent();
    }
  }
};

export default vaccinationResolvers;