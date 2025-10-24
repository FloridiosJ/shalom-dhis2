import { Op } from 'sequelize';
import { AuthenticationError } from 'apollo-server-express';

const reportsResolvers = {
  Query: {

    /**
     * Top diagnostics avec filtres
     */
    topDiagnostics: async (_, { limit = 10, dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry } = await import('../../models/index.js');

      const whereClause = { isActive: true };
      
      if (dispensaireId) {
        whereClause.dispensaireId = dispensaireId;
      }
      
      if (startDate && endDate) {
        whereClause.dateConsultation = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const diagnostics = await DataEntry.findAll({
        where: whereClause,
        attributes: [
          'diagnostic',
          [DataEntry.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['diagnostic'],
        order: [[DataEntry.sequelize.literal('count'), 'DESC']],
        limit,
        raw: true
      });

      const total = diagnostics.reduce((sum, d) => sum + parseInt(d.count), 0);

      return diagnostics.map(d => ({
        diagnostic: d.diagnostic,
        count: parseInt(d.count),
        percentage: total > 0 ? ((parseInt(d.count) / total) * 100).toFixed(2) : 0
      }));
    },

    /**
     * Évolution des consultations
     */
    consultationsEvolution: async (_, { period, dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry } = await import('../../models/index.js');

      const whereClause = { isActive: true };
      
      if (dispensaireId) {
        whereClause.dispensaireId = dispensaireId;
      }

      // Déterminer la plage de dates selon la période
      let dateFrom, dateTo;
      const now = new Date();

      if (startDate && endDate) {
        dateFrom = new Date(startDate);
        dateTo = new Date(endDate);
      } else {
        switch (period) {
          case 'day':
            dateFrom = new Date(now.setDate(now.getDate() - 30));
            break;
          case 'week':
            dateFrom = new Date(now.setDate(now.getDate() - 12 * 7));
            break;
          case 'month':
            dateFrom = new Date(now.setMonth(now.getMonth() - 12));
            break;
          case 'year':
            dateFrom = new Date(now.setFullYear(now.getFullYear() - 5));
            break;
          default:
            dateFrom = new Date(now.setMonth(now.getMonth() - 12));
        }
        dateTo = new Date();
      }

      whereClause.dateConsultation = {
        [Op.between]: [dateFrom, dateTo]
      };

      // Format de groupement selon la période
      let dateFormat;
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-W%U';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'year':
          dateFormat = '%Y';
          break;
        default:
          dateFormat = '%Y-%m';
      }

      const evolution = await DataEntry.findAll({
        where: whereClause,
        attributes: [
          [DataEntry.sequelize.fn('DATE_FORMAT', DataEntry.sequelize.col('dateConsultation'), dateFormat), 'period'],
          [DataEntry.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: [DataEntry.sequelize.fn('DATE_FORMAT', DataEntry.sequelize.col('dateConsultation'), dateFormat)],
        order: [[DataEntry.sequelize.fn('DATE_FORMAT', DataEntry.sequelize.col('dateConsultation'), dateFormat), 'ASC']],
        raw: true
      });

      return evolution.map(e => ({
        period: e.period,
        date: e.period,
        count: parseInt(e.count)
      }));
    },

    /**
     * Statistiques par dispensaire
     */
    dispensaireStats: async (_, { dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, Patient } = await import('../../models/index.js');

      const dispensaire = await Dispensaire.findByPk(dispensaireId);
      if (!dispensaire) {
        throw new Error('Dispensaire non trouvé');
      }

      console.log('✅ Dispensaire trouvé:', dispensaire.name);

      const whereClause = { 
        isActive: true,
        dispensaireId 
      };
      
      if (startDate && endDate) {
        whereClause.dateConsultation = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      console.log('🔍 Where clause:', whereClause);

      const totalConsultations = await DataEntry.count({ where: whereClause });
      console.log('📈 Total consultations:', totalConsultations);

      const totalPatients = await Patient.count({ 
        where: { dispensaireId, isActive: true } 
      });
      console.log('👥 Total patients:', totalPatients);

      // Par type
      const consultationsByType = await DataEntry.findAll({
        where: whereClause,
        attributes: [
          'typeConsultation',
          [DataEntry.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['typeConsultation'],
        raw: true
      });

      console.log('📊 Consultations par type:', consultationsByType);

      // ✅ CORRECTION: Utiliser le nom correct de la table
      // Récupérer le nom réel de la table depuis le modèle
      const tableNameDataEntry = DataEntry.getTableName();
      const tableNameCategories = (await import('../../models/index.js')).CategorieMaladie.getTableName();
      
      console.log('📋 Table DataEntry:', tableNameDataEntry);
      console.log('📋 Table CategorieMaladie:', tableNameCategories);

      // Top catégories pour ce dispensaire - REQUÊTE CORRIGÉE
      const topCategories = await DataEntry.sequelize.query(`
        SELECT 
          cm.id,
          cm.nom,
          cm.code,
          COUNT(DISTINCT de.id) as "nombreConsultations"
        FROM ${tableNameDataEntry} de
        INNER JOIN "DataEntryCategorieMaladies" decm ON de.id = decm."dataEntryId"
        INNER JOIN ${tableNameCategories} cm ON decm."categorieMaladieId" = cm.id
        WHERE de."isActive" = true
        AND de."dispensaireId" = :dispensaireId
        ${startDate && endDate ? 'AND de."dateConsultation" BETWEEN :startDate AND :endDate' : ''}
        GROUP BY cm.id, cm.nom, cm.code
        ORDER BY "nombreConsultations" DESC
        LIMIT 5
      `, {
        replacements: { dispensaireId, startDate, endDate },
        type: DataEntry.sequelize.QueryTypes.SELECT
      });

      console.log('🏥 Top catégories:', topCategories);

      const result = {
        dispensaire,
        totalConsultations,
        totalPatients,
        consultationsByType: consultationsByType.map(item => ({
          type: item.typeConsultation,
          count: parseInt(item.count),
          pourcentage: totalConsultations > 0 
            ? parseFloat(((parseInt(item.count) / totalConsultations) * 100).toFixed(2))
            : 0
        })),
        topCategories: topCategories.map(cat => ({
          categorie: cat,
          nombreConsultations: parseInt(cat.nombreConsultations)
        }))
      };

      console.log('✅ Résultat final structure:', {
        dispensaire: result.dispensaire.name,
        totalConsultations: result.totalConsultations,
        totalPatients: result.totalPatients,
        consultationsByTypeCount: result.consultationsByType.length,
        topCategoriesCount: result.topCategories.length
      });

      return result;
    }
  },

  Mutation: {
    /**
     * Exporter un rapport (placeholder)
     */
    exportReport: async (_, { format, filters }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      // TODO: Implémenter l'export PDF/Excel
      return {
        success: true,
        message: `Export ${format} en cours de développement`,
        url: null,
        fileName: null
      };
    }
  }
};

export default reportsResolvers;