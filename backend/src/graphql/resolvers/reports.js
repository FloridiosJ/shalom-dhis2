import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { Op } from 'sequelize';

const reportsResolvers = {
  Query: {
    /**
     * Statistiques globales du système
     */
    reports: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { Patient, DataEntry, Dispensaire, User } = await import('../../models/index.js');

        // Construction des filtres selon le rôle
        const patientFilter = { isActive: true };
        const dataEntryFilter = { isActive: true };
        const dispensaireFilter = { isActive: true };
        const userFilter = { isActive: true };

        // Pour les agents, filtrer par leur dispensaire
        if (user.role === 'agent' && user.dispensaireId) {
          patientFilter.dispensaireId = user.dispensaireId;
          dataEntryFilter.dispensaireId = user.dispensaireId;
          dispensaireFilter.id = user.dispensaireId;
          userFilter.dispensaireId = user.dispensaireId;
        }

        // Compter les totaux en parallèle
        const [
          totalPatients,
          totalConsultations,
          totalDispensaires,
          totalUsers
        ] = await Promise.all([
          Patient.count({ where: patientFilter }),
          DataEntry.count({ where: dataEntryFilter }),
          Dispensaire.count({ where: dispensaireFilter }),
          User.count({ where: userFilter })
        ]);

        console.log('✅ Statistiques globales récupérées:', {
          totalPatients,
          totalConsultations,
          totalDispensaires,
          totalUsers,
          requestedBy: user.email,
          role: user.role
        });

        return {
          totalPatients,
          totalConsultations,
          totalDispensaires,
          totalUsers
        };
      } catch (error) {
        console.error('❌ Erreur récupération statistiques globales:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
    },

    /**
     * Statistiques détaillées par dispensaire
     */
    reportsByDispensaire: async (_, { dispensaireId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // Vérification d'accès pour les agents
      if (user.role === 'agent' && user.dispensaireId !== dispensaireId) {
        throw new ForbiddenError('Accès refusé à ce dispensaire');
      }

      try {
        const { Patient, DataEntry, User, Dispensaire } = await import('../../models/index.js');

        // Vérifier que le dispensaire existe
        const dispensaire = await Dispensaire.findByPk(dispensaireId);
        if (!dispensaire) {
          throw new Error('Dispensaire non trouvé');
        }

        const filter = {
          dispensaireId,
          isActive: true
        };

        const [
          totalPatients,
          totalConsultations,
          totalUsers,
          activeUsers
        ] = await Promise.all([
          Patient.count({ where: filter }),
          DataEntry.count({ where: filter }),
          User.count({ where: { dispensaireId, isActive: true } }),
          User.count({ where: { dispensaireId, isActive: true, lastLoginAt: { [Op.ne]: null } } })
        ]);

        return {
          dispensaire,
          totalPatients,
          totalConsultations,
          totalUsers,
          activeUsers
        };
      } catch (error) {
        console.error('❌ Erreur statistiques dispensaire:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
    },

    /**
     * Statistiques par période
     */
    reportsByPeriod: async (_, { dateFrom, dateTo, dispensaireId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // Vérification d'accès pour les agents
      if (user.role === 'agent' && dispensaireId && user.dispensaireId !== dispensaireId) {
        throw new ForbiddenError('Accès refusé à ce dispensaire');
      }

      try {
        const { DataEntry, Patient } = await import('../../models/index.js');

        const dataEntryFilter = {
          isActive: true,
          dateConsultation: {}
        };

        const patientFilter = {
          isActive: true,
          createdAt: {}
        };

        // Appliquer les filtres de date
        if (dateFrom) {
          dataEntryFilter.dateConsultation[Op.gte] = new Date(dateFrom);
          patientFilter.createdAt[Op.gte] = new Date(dateFrom);
        }

        if (dateTo) {
          dataEntryFilter.dateConsultation[Op.lte] = new Date(dateTo);
          patientFilter.createdAt[Op.lte] = new Date(dateTo);
        }

        // Filtrer par dispensaire si spécifié
        if (dispensaireId) {
          dataEntryFilter.dispensaireId = dispensaireId;
          patientFilter.dispensaireId = dispensaireId;
        } else if (user.role === 'agent') {
          dataEntryFilter.dispensaireId = user.dispensaireId;
          patientFilter.dispensaireId = user.dispensaireId;
        }

        const [
          consultationsPeriod,
          newPatientsPeriod,
          consultationsByStatus
        ] = await Promise.all([
          DataEntry.count({ where: dataEntryFilter }),
          Patient.count({ where: patientFilter }),
          DataEntry.findAll({
            where: dataEntryFilter,
            attributes: [
              'status',
              [DataEntry.sequelize.fn('COUNT', DataEntry.sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
          })
        ]);

        return {
          dateFrom: dateFrom ? new Date(dateFrom) : null,
          dateTo: dateTo ? new Date(dateTo) : null,
          consultationsPeriod,
          newPatientsPeriod,
          consultationsByStatus: consultationsByStatus.map(item => ({
            status: item.status,
            count: parseInt(item.count)
          }))
        };
      } catch (error) {
        console.error('❌ Erreur statistiques par période:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
    },

    /**
     * Statistiques par type de consultation
     */
    reportsByConsultationType: async (_, { dateFrom, dateTo, dispensaireId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // Vérification d'accès pour les agents
      if (user.role === 'agent' && dispensaireId && user.dispensaireId !== dispensaireId) {
        throw new ForbiddenError('Accès refusé à ce dispensaire');
      }

      try {
        const { DataEntry, TypeConsultation } = await import('../../models/index.js');

        const filter = {
          isActive: true
        };

        // Appliquer les filtres de date
        if (dateFrom || dateTo) {
          filter.dateConsultation = {};
          if (dateFrom) filter.dateConsultation[Op.gte] = new Date(dateFrom);
          if (dateTo) filter.dateConsultation[Op.lte] = new Date(dateTo);
        }

        // Filtrer par dispensaire
        if (dispensaireId) {
          filter.dispensaireId = dispensaireId;
        } else if (user.role === 'agent') {
          filter.dispensaireId = user.dispensaireId;
        }

        const consultationsByType = await DataEntry.findAll({
          where: filter,
          attributes: [
            'typeConsultation',
            [DataEntry.sequelize.fn('COUNT', DataEntry.sequelize.col('DataEntry.id')), 'count']
          ],
          include: [
            {
              model: TypeConsultation,
              as: 'typeConsultationDetails',
              attributes: ['code', 'libelle', 'description']
            }
          ],
          group: ['typeConsultation', 'typeConsultationDetails.code'],
          raw: false
        });

        return consultationsByType.map(item => ({
          typeConsultation: item.typeConsultation,
          typeDetails: item.typeConsultationDetails,
          count: parseInt(item.dataValues.count)
        }));
      } catch (error) {
        console.error('❌ Erreur statistiques par type:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
    },

    /**
     * Dashboard complet
     */
    dashboard: async (_, { dispensaireId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // Vérification d'accès pour les agents
      if (user.role === 'agent' && dispensaireId && user.dispensaireId !== dispensaireId) {
        throw new ForbiddenError('Accès refusé à ce dispensaire');
      }

      try {
        const { Patient, DataEntry, User, Dispensaire, Event } = await import('../../models/index.js');

        const filter = { isActive: true };
        
        // Appliquer le filtre dispensaire
        if (dispensaireId) {
          filter.dispensaireId = dispensaireId;
        } else if (user.role === 'agent') {
          filter.dispensaireId = user.dispensaireId;
        }

        // Date du jour
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Début du mois
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Récupérer toutes les statistiques en parallèle
        const [
          totalPatients,
          totalConsultations,
          consultationsToday,
          consultationsThisMonth,
          newPatientsThisMonth,
          upcomingEvents,
          recentConsultations
        ] = await Promise.all([
          Patient.count({ where: filter }),
          DataEntry.count({ where: filter }),
          DataEntry.count({
            where: {
              ...filter,
              dateConsultation: {
                [Op.gte]: today,
                [Op.lt]: tomorrow
              }
            }
          }),
          DataEntry.count({
            where: {
              ...filter,
              dateConsultation: {
                [Op.gte]: startOfMonth
              }
            }
          }),
          Patient.count({
            where: {
              ...filter,
              createdAt: {
                [Op.gte]: startOfMonth
              }
            }
          }),
          Event.findAll({
            where: {
              ...(dispensaireId ? { dispensaireId } : user.role === 'agent' ? { dispensaireId: user.dispensaireId } : {}),
              date: {
                [Op.gte]: today
              },
              isActive: true
            },
            order: [['date', 'ASC']],
            limit: 5,
            include: [
              { model: User, as: 'organisateur', attributes: ['id', 'nom', 'prenom'] },
              { model: Dispensaire, as: 'dispensaire', attributes: ['id', 'name'] }
            ]
          }),
          DataEntry.findAll({
            where: filter,
            order: [['dateConsultation', 'DESC']],
            limit: 10,
            include: [
              { 
                model: Patient, 
                as: 'patient', 
                attributes: ['id', 'nom', 'prenom', 'numeroPatient'] 
              },
              { 
                model: User, 
                as: 'createdBy', 
                attributes: ['id', 'nom', 'prenom'] 
              }
            ]
          })
        ]);

        return {
          totalPatients,
          totalConsultations,
          consultationsToday,
          consultationsThisMonth,
          newPatientsThisMonth,
          upcomingEvents,
          recentConsultations
        };
      } catch (error) {
        console.error('❌ Erreur dashboard:', error);
        throw new Error(`Erreur lors de la récupération du dashboard: ${error.message}`);
      }
    },

    /**
     * Statistiques globales des consultations
     */
    consultationStats: async (_, { dispensaireId, userId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // Vérification d'accès pour les agents
      if (user.role === 'agent') {
        if (dispensaireId && user.dispensaireId !== dispensaireId) {
          throw new ForbiddenError('Accès refusé à ce dispensaire');
        }
        if (userId && user.id !== userId) {
          throw new ForbiddenError('Accès refusé à cet utilisateur');
        }
      }

      try {
        const { DataEntry, CategorieMaladie, TypeConsultation, Patient, User } = await import('../../models/index.js');

        const baseFilter = { isActive: true };

        // Appliquer les filtres selon le contexte
        if (dispensaireId) {
          baseFilter.dispensaireId = dispensaireId;
        } else if (user.role === 'agent') {
          baseFilter.dispensaireId = user.dispensaireId;
        }

        if (userId) {
          baseFilter.userId = userId;
        }

        // Dates de référence
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // ✅ CORRECTION : Utiliser Sequelize pour la requête des catégories
        let topCategories = [];
        try {
          // Récupérer les associations DataEntry <-> CategorieMaladie
          const categoriesData = await DataEntry.findAll({
            where: baseFilter,
            attributes: [],
            include: [
              {
                model: CategorieMaladie,
                as: 'categories',
                attributes: ['id', 'nom', 'code'],
                through: { attributes: [] }
              }
            ],
            raw: false
          });

          // Compter les occurrences de chaque catégorie
          const categoryCounts = new Map();
          const totalConsultations = categoriesData.length;

          categoriesData.forEach(entry => {
            if (entry.categories && entry.categories.length > 0) {
              entry.categories.forEach(cat => {
                const count = categoryCounts.get(cat.id) || 0;
                categoryCounts.set(cat.id, count + 1);
              });
            }
          });

          // Récupérer les détails des catégories et calculer les pourcentages
          const categoriesWithCounts = await Promise.all(
            Array.from(categoryCounts.entries()).map(async ([catId, count]) => {
              const categorie = await CategorieMaladie.findByPk(catId);
              return {
                id: catId,
                nom: categorie?.nom || 'Inconnu',
                code: categorie?.code || '',
                count: count,
                percentage: totalConsultations > 0 ? ((count / totalConsultations) * 100).toFixed(2) : 0
              };
            })
          );

          // Trier par nombre de consultations et prendre les 10 premiers
          topCategories = categoriesWithCounts
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        } catch (catError) {
          console.error('⚠️ Erreur récupération top catégories:', catError);
          // Continuer même si les catégories échouent
          topCategories = [];
        }

        // Requêtes en parallèle
        const [
          total,
          thisMonth,
          thisWeek,
          today,
          byStatus,
          byType,
          recentConsultations
        ] = await Promise.all([
          // Total
          DataEntry.count({ where: baseFilter }),

          // Ce mois
          DataEntry.count({
            where: {
              ...baseFilter,
              dateConsultation: { [Op.gte]: startOfMonth }
            }
          }),

          // Cette semaine
          DataEntry.count({
            where: {
              ...baseFilter,
              dateConsultation: { [Op.gte]: startOfWeek }
            }
          }),

          // Aujourd'hui
          DataEntry.count({
            where: {
              ...baseFilter,
              dateConsultation: { [Op.gte]: startOfToday }
            }
          }),

          // Par statut
          DataEntry.findAll({
            where: baseFilter,
            attributes: [
              'status',
              [DataEntry.sequelize.fn('COUNT', DataEntry.sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
          }),

          // Par type
          DataEntry.findAll({
            where: baseFilter,
            attributes: [
              'typeConsultation',
              [DataEntry.sequelize.fn('COUNT', DataEntry.sequelize.col('DataEntry.id')), 'count']
            ],
            include: [
              {
                model: TypeConsultation,
                as: 'typeConsultationDetails',
                attributes: ['code', 'libelle', 'description']
              }
            ],
            group: ['typeConsultation', 'typeConsultationDetails.code'],
            raw: false
          }),

          // Consultations récentes
          DataEntry.findAll({
            where: baseFilter,
            order: [['dateConsultation', 'DESC']],
            limit: 10,
            include: [
              {
                model: Patient,
                as: 'patient',
                attributes: ['id', 'nom', 'prenom', 'numeroPatient']
              },
              {
                model: User,
                as: 'createdBy',
                attributes: ['id', 'nom', 'prenom']
              }
            ]
          })
        ]);

        // Calculer les moyennes
        const averagePerDay = total > 0 ? (thisMonth / new Date().getDate()).toFixed(2) : 0;
        const averagePerWeek = total > 0 ? (thisMonth / Math.ceil(new Date().getDate() / 7)).toFixed(2) : 0;
        const averagePerMonth = total > 0 ? (total / ((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 30))).toFixed(2) : 0;

        return {
          total,
          thisMonth,
          thisWeek,
          today,
          byStatus: byStatus.map(item => ({
            status: item.status,
            count: parseInt(item.count)
          })),
          byType: byType.map(item => ({
            typeConsultation: item.typeConsultation,
            typeDetails: item.typeConsultationDetails,
            count: parseInt(item.dataValues.count)
          })),
          averagePerDay: parseFloat(averagePerDay),
          averagePerWeek: parseFloat(averagePerWeek),
          averagePerMonth: parseFloat(averagePerMonth),
          topCategories: topCategories.map(cat => ({
            categorie: {
              id: cat.id,
              nom: cat.nom,
              code: cat.code
            },
            nombreConsultations: parseInt(cat.count),
            pourcentage: parseFloat(cat.percentage),
            tendance: null // À implémenter si besoin
          })),
          recentConsultations
        };
      } catch (error) {
        console.error('❌ Erreur statistiques consultations:', error);
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
    }
  }
};

export default reportsResolvers;