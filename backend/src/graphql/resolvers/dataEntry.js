// filepath: /home/jacob/WORK_SPACE/Floridios/shalom-dhis2/backend/src/graphql/resolvers/dataEntry.js
import { DataEntry, Patient, User, Dispensaire, TypeConsultation } from '../../models/index.js';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Op } from 'sequelize';

const dataEntryResolvers = {
  Query: {
    dataEntry: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const entry = await DataEntry.findByPk(id, {
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' },
          { model: TypeConsultation, as: 'typeConsultationDetails' }
        ]
      });

      if (!entry) {
        throw new UserInputError('Consultation non trouvée');
      }

      return entry;
    },

    dataEntries: async (_, { filter, sort, pagination }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = { isActive: true };

      if (filter) {
        if (filter.typeConsultation) {
          where.typeConsultation = filter.typeConsultation;
        }
        if (filter.patientId) {
          where.patientId = filter.patientId;
        }
        if (filter.dispensaireId) {
          where.dispensaireId = filter.dispensaireId;
        }
        if (filter.userId) {
          where.userId = filter.userId;
        }
        if (filter.status) {
          where.status = filter.status;
        }
        if (filter.dateFrom && filter.dateTo) {
          where.dateConsultation = {
            [Op.between]: [new Date(filter.dateFrom), new Date(filter.dateTo)]
          };
        }
        if (filter.search) {
          where[Op.or] = [
            { diagnostic: { [Op.iLike]: `%${filter.search}%` } },
            { prescription: { [Op.iLike]: `%${filter.search}%` } },
            { notes: { [Op.iLike]: `%${filter.search}%` } }
          ];
        }
      }

      if (user.role !== 'ADMIN' && user.dispensaireId) {
        where.dispensaireId = user.dispensaireId;
      }

      const limit = pagination?.limit || 20;
      const offset = pagination?.offset || 0;

      const order = sort 
        ? [[sort.field, sort.direction]]
        : [['dateConsultation', 'DESC']];

      const { count, rows } = await DataEntry.findAndCountAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' },
          { model: TypeConsultation, as: 'typeConsultationDetails' }
        ],
        order,
        limit,
        offset
      });

      return {
        dataEntries: rows,
        totalCount: count,
        hasNextPage: offset + limit < count,
        hasPreviousPage: offset > 0
      };
    },

    patientConsultations: async (_, { patientId, limit }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      return await DataEntry.findAll({
        where: { 
          patientId,
          isActive: true 
        },
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' },
          { model: TypeConsultation, as: 'typeConsultationDetails' }
        ],
        order: [['dateConsultation', 'DESC']],
        limit: limit || 10
      });
    },

    consultationStatsByType: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const types = await TypeConsultation.findAll({
        where: { isActive: true }
      });

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const stats = await Promise.all(
        types.map(async (type) => {
          const where = { 
            typeConsultation: type.code,
            isActive: true
          };

          if (user.role !== 'ADMIN' && user.dispensaireId) {
            where.dispensaireId = user.dispensaireId;
          }

          const [total, thisMonth, thisWeek, statusCounts] = await Promise.all([
            DataEntry.count({ where }),
            DataEntry.count({
              where: {
                ...where,
                dateConsultation: { [Op.gte]: startOfMonth }
              }
            }),
            DataEntry.count({
              where: {
                ...where,
                dateConsultation: { [Op.gte]: startOfWeek }
              }
            }),
            DataEntry.findAll({
              where,
              attributes: [
                'status',
                [DataEntry.sequelize.fn('COUNT', '*'), 'count']
              ],
              group: ['status'],
              raw: true
            })
          ]);

          return {
            typeConsultation: type,
            total,
            thisMonth,
            thisWeek,
            byStatus: statusCounts.map(s => ({
              status: s.status,
              count: parseInt(s.count)
            }))
          };
        })
      );

      return stats;
    },

    consultationStats: async (_, { dispensaireId, userId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = { isActive: true };

      if (dispensaireId) {
        where.dispensaireId = dispensaireId;
      } else if (user.role !== 'ADMIN' && user.dispensaireId) {
        where.dispensaireId = user.dispensaireId;
      }

      if (userId) {
        where.userId = userId;
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [
        totalConsultations,
        consultationsThisMonth,
        consultationsToday,
        patientsSeen,
        consultationsByStatus,
        consultationsByType
      ] = await Promise.all([
        DataEntry.count({ where }),
        DataEntry.count({
          where: {
            ...where,
            dateConsultation: { [Op.gte]: startOfMonth }
          }
        }),
        DataEntry.count({
          where: {
            ...where,
            dateConsultation: { [Op.gte]: startOfDay }
          }
        }),
        DataEntry.count({
          where,
          distinct: true,
          col: 'patientId'
        }),
        DataEntry.findAll({
          where,
          attributes: [
            'status',
            [DataEntry.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['status'],
          raw: true
        }),
        dataEntryResolvers.Query.consultationStatsByType(_, __, { user })
      ]);

      return {
        totalConsultations,
        consultationsThisMonth,
        consultationsToday,
        patientsSeen,
        consultationsByStatus: consultationsByStatus.map(s => ({
          status: s.status,
          count: parseInt(s.count)
        })),
        consultationsByType
      };
    },

    recentConsultations: async (_, { dispensaireId, limit }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const where = { isActive: true };

      if (dispensaireId) {
        where.dispensaireId = dispensaireId;
      } else if (user.role !== 'ADMIN' && user.dispensaireId) {
        where.dispensaireId = user.dispensaireId;
      }

      return await DataEntry.findAll({
        where,
        include: [
          { model: Patient, as: 'patient' },
          { model: User, as: 'createdBy' },
          { model: Dispensaire, as: 'dispensaire' },
          { model: TypeConsultation, as: 'typeConsultationDetails' }
        ],
        order: [['createdAt', 'DESC']],
        limit: limit || 10
      });
    }
  },

  Mutation: {
    createDataEntry: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }
        
        const { DataEntry, Patient, User, Dispensaire, TypeConsultation, DataEntryCatégorieMaladie } = await import('../../models/index.js');

        // Valider le type de consultation
        const typeConsultation = await TypeConsultation.findOne({
          where: { code: input.typeConsultation }
        });
        
        if (!typeConsultation) {
          return {
            dataEntry: null,
            success: false,
            message: `Type de consultation '${input.typeConsultation}' non trouvé. Types disponibles : CURATIF, PREVENTIF, CPN, CPON, ACCOUCHEMENT, VACCINATION, NUTRITION, PLANIFICATION, IST, PALUDISME, TUBERCULOSE, URGENCE`,
            errors: ['TYPE_NOT_FOUND']
          };
        }
        
        if (!typeConsultation.isActive) {
          return {
            dataEntry: null,
            success: false,
            message: `Le type de consultation '${typeConsultation.libelle}' n'est plus actif`,
            errors: ['TYPE_INACTIVE']
          };
        }

        // Valider le patient
        const patient = await Patient.findByPk(input.patientId);
        if (!patient) {
          return {
            dataEntry: null,
            success: false,
            message: 'Patient non trouvé',
            errors: ['PATIENT_NOT_FOUND']
          };
        }

        // Créer la consultation
        const entry = await DataEntry.create({
          patientId: input.patientId,
          typeConsultation: input.typeConsultation,
          diagnostic: input.diagnostic,
          prescription: input.prescription,
          notes: input.notes,
          dateConsultation: input.dateConsultation || new Date(),
          dispensaireId: input.dispensaireId || user.dispensaireId,
          userId: user.id,
          status: 'active'
        });

        // Gérer les catégories avec métadonnées
        if (input.categories && input.categories.length > 0) {
          for (const cat of input.categories) {
            await DataEntryCatégorieMaladie.addCategorie(
              entry.id,
              cat.categorieMaladieId,
              {
                isPrincipal: cat.isPrincipal || false,
                notes: cat.notes || null
              }
            );
          }
        }
        // Gérer les catégories simples (rétrocompatibilité)
        else if (input.categorieIds && input.categorieIds.length > 0) {
          for (let i = 0; i < input.categorieIds.length; i++) {
            await DataEntryCatégorieMaladie.addCategorie(
              entry.id,
              input.categorieIds[i],
              {
                isPrincipal: i === 0,
                notes: null
              }
            );
          }
        }

        // Récupérer l'entrée complète avec toutes les relations
        const createdEntry = await DataEntry.findByPk(entry.id, {
          include: [
            { model: Patient, as: 'patient' },
            { model: User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' },
            { model: TypeConsultation, as: 'typeConsultationDetails' }
          ]
        });

        return {
          dataEntry: createdEntry,
          success: true,
          message: 'Consultation créée avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Error creating dataEntry:', error);
        return {
          dataEntry: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    updateDataEntry: async (_, { id, input }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const { DataEntry, Patient, User, Dispensaire, TypeConsultation, DataEntryCatégorieMaladie } = await import('../../models/index.js');

        const entry = await DataEntry.findByPk(id);
        if (!entry) {
          return {
            dataEntry: null,
            success: false,
            message: 'Consultation non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        if (user.role !== 'admin' && entry.userId !== user.id) {
          return {
            dataEntry: null,
            success: false,
            message: 'Vous ne pouvez modifier que vos propres consultations',
            errors: ['FORBIDDEN']
          };
        }

        if (input.typeConsultation) {
          const typeConsultation = await TypeConsultation.findOne({
            where: { code: input.typeConsultation }
          });
          if (!typeConsultation || !typeConsultation.isActive) {
            return {
              dataEntry: null,
              success: false,
              message: 'Type de consultation invalide',
              errors: ['INVALID_TYPE']
            };
          }
        }

        // Mettre à jour les champs de base
        await entry.update({
          diagnostic: input.diagnostic || entry.diagnostic,
          prescription: input.prescription !== undefined ? input.prescription : entry.prescription,
          notes: input.notes !== undefined ? input.notes : entry.notes,
          dateConsultation: input.dateConsultation || entry.dateConsultation,
          status: input.status || entry.status
        });

        // Mettre à jour les catégories avec métadonnées si fourni
        if (input.categories && input.categories.length > 0) {
          // Supprimer les anciennes associations
          await DataEntryCatégorieMaladie.destroy({
            where: { dataEntryId: id }
          });

          // Ajouter les nouvelles
          for (const cat of input.categories) {
            await DataEntryCatégorieMaladie.addCategorie(
              entry.id,
              cat.categorieMaladieId,
              {
                isPrincipal: cat.isPrincipal || false,
                notes: cat.notes || null
              }
            );
          }
        }
        // Ou mettre à jour avec la méthode simple
        else if (input.categorieIds && input.categorieIds.length > 0) {
          await DataEntryCatégorieMaladie.destroy({
            where: { dataEntryId: id }
          });

          for (let i = 0; i < input.categorieIds.length; i++) {
            await DataEntryCatégorieMaladie.addCategorie(
              entry.id,
              input.categorieIds[i],
              {
                isPrincipal: i === 0,
                notes: null
              }
            );
          }
        }

        const updatedEntry = await DataEntry.findByPk(id, {
          include: [
            { model: Patient, as: 'patient' },
            { model: User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' },
            { model: TypeConsultation, as: 'typeConsultationDetails' }
          ]
        });

        return {
          dataEntry: updatedEntry,
          success: true,
          message: 'Consultation mise à jour avec succès',
          errors: []
        };
      } catch (error) {
        console.error('❌ Error updating dataEntry:', error);
        return {
          dataEntry: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    deleteDataEntry: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const entry = await DataEntry.findByPk(id);
        if (!entry) {
          return {
            dataEntry: null,
            success: false,
            message: 'Consultation non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        if (user.role !== 'ADMIN' && entry.userId !== user.id) {
          return {
            dataEntry: null,
            success: false,
            message: 'Accès refusé',
            errors: ['FORBIDDEN']
          };
        }

        await entry.update({ isActive: false });

        return {
          dataEntry: null,
          success: true,
          message: 'Consultation supprimée avec succès',
          errors: []
        };
      } catch (error) {
        return {
          dataEntry: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    completeConsultation: async (_, { id }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const entry = await DataEntry.findByPk(id);
        if (!entry) {
          return {
            dataEntry: null,
            success: false,
            message: 'Consultation non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        await entry.update({ status: 'completed' });

        const updatedEntry = await DataEntry.findByPk(id, {
          include: [
            { model: Patient, as: 'patient' },
            { model: User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' },
            { model: TypeConsultation, as: 'typeConsultationDetails' }
          ]
        });

        return {
          dataEntry: updatedEntry,
          success: true,
          message: 'Consultation marquée comme terminée',
          errors: []
        };
      } catch (error) {
        return {
          dataEntry: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    },

    requireFollowUp: async (_, { id, notes }, { user }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Non authentifié');
        }

        const entry = await DataEntry.findByPk(id);
        if (!entry) {
          return {
            dataEntry: null,
            success: false,
            message: 'Consultation non trouvée',
            errors: ['NOT_FOUND']
          };
        }

        const updateData = { status: 'suivi_requis' };
        if (notes) {
          updateData.notes = entry.notes 
            ? `${entry.notes}\n\n[SUIVI REQUIS] ${notes}`
            : `[SUIVI REQUIS] ${notes}`;
        }

        await entry.update(updateData);

        const updatedEntry = await DataEntry.findByPk(id, {
          include: [
            { model: Patient, as: 'patient' },
            { model: User, as: 'createdBy' },
            { model: Dispensaire, as: 'dispensaire' },
            { model: TypeConsultation, as: 'typeConsultationDetails' }
          ]
        });

        return {
          dataEntry: updatedEntry,
          success: true,
          message: 'Suivi requis enregistré',
          errors: []
        };
      } catch (error) {
        return {
          dataEntry: null,
          success: false,
          message: error.message,
          errors: [error.message]
        };
      }
    }
  },

  // Field resolvers
  DataEntry: {
    patient: async (dataEntry) => {
      const { Patient } = await import('../../models/index.js');
      return await Patient.findByPk(dataEntry.patientId);
    },

    createdBy: async (dataEntry) => {
      const { User } = await import('../../models/index.js');
      return await User.findByPk(dataEntry.userId);
    },

    dispensaire: async (dataEntry) => {
      const { Dispensaire } = await import('../../models/index.js');
      return await Dispensaire.findByPk(dataEntry.dispensaireId);
    },

    typeConsultationDetails: async (dataEntry) => {
      const { TypeConsultation } = await import('../../models/index.js');
      return await TypeConsultation.findOne({
        where: { code: dataEntry.typeConsultation }
      });
    },

    categories: async (dataEntry) => {
      const categories = await dataEntry.getCategories();
      return categories || [];
    },

    categoriesWithMeta: async (dataEntry) => {
      return await dataEntry.getCategoriesWithMeta();
    },

    principalCategorie: async (dataEntry) => {
      return await dataEntry.getPrincipalCategorie();
    },

    vaccinations: async (dataEntry) => {
      const { Vaccination } = await import('../../models/index.js');
      return await Vaccination.findAll({
        where: { 
          dataEntryId: dataEntry.id,
          isActive: true 
        }
      });
    },

    summary: (dataEntry) => {
      const dateStr = new Date(dataEntry.dateConsultation).toLocaleDateString('fr-FR');
      return `${dataEntry.typeConsultation} - ${dateStr} - ${dataEntry.diagnostic.substring(0, 50)}${dataEntry.diagnostic.length > 50 ? '...' : ''}`;
    }
  }
};

export default dataEntryResolvers;