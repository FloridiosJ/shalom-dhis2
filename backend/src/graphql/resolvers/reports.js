import { Op } from 'sequelize';
import { AuthenticationError } from 'apollo-server-express';

const reportsResolvers = {
  Query: {

    reports: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Patient, Dispensaire, User } = await import('../../models/index.js');

      // Si l'utilisateur est un agent, limiter aux données du dispensaire de l'agent
      if (user.role === 'agent' && user.dispensaireId) {
        const dispensaireId = user.dispensaireId;

        const [totalPatients, totalConsultations, totalDispensaires, totalUsers] = await Promise.all([
          Patient.count({ where: { dispensaireId, isActive: true } }),
          DataEntry.count({ where: { dispensaireId, isActive: true } }),
          Dispensaire.count({ where: { id: dispensaireId, isActive: true } }),
          User.count({ where: { dispensaireId, isActive: true } })
        ]);

        return {
          totalPatients,
          totalConsultations,
          totalDispensaires,
          totalUsers
        };
      }

      // Pour admin/manager : totaux globaux
      const [totalPatients, totalConsultations, totalDispensaires, totalUsers] = await Promise.all([
        Patient.count({ where: { isActive: true } }),
        DataEntry.count({ where: { isActive: true } }),
        Dispensaire.count({ where: { isActive: true } }),
        User.count({ where: { isActive: true } })
      ]);

      return {
        totalPatients,
        totalConsultations,
        totalDispensaires,
        totalUsers
      };
    },

    /**
     * Top diagnostics avec filtres
     * Utilise prioritairement les catégories structurées (categoriesWithMeta.categorieMaladieId)
     * avec fallback sur le champ diagnostic texte si nécessaire.
     * 
     * @param {number} limit - Nombre maximum de résultats (défaut: 10)
     * @param {string} dispensaireId - ID du dispensaire (optionnel)
     * @param {string} startDate - Date de début (format ISO, optionnel)
     * @param {string} endDate - Date de fin (format ISO, optionnel)
     * @returns {Array<{diagnostic: string, count: number, percentage: number}>}
     */
    topDiagnostics: async (_, { limit = 10, dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, CategorieMaladie, DataEntryCategorieMaladie } = await import('../../models/index.js');

      // Construction de la clause WHERE pour filtrer les DataEntries
      const whereClause = { isActive: true };
      
      if (dispensaireId) {
        whereClause.dispensaireId = dispensaireId;
      }
      
      if (startDate && endDate) {
        whereClause.dateConsultation = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Étape 1: Obtenir les statistiques basées sur les catégories structurées
      // Utilise la table de jointure DataEntryCategorieMaladie pour aggréger
      const validDataEntryIds = await DataEntry.findAll({
        where: whereClause,
        attributes: ['id'],
        raw: true
      });

      const validIds = validDataEntryIds.map(entry => entry.id);

      if (validIds.length === 0) {
        return [];
      }

      // Statistiques par catégorie (données structurées)
      const categoryStats = await DataEntryCategorieMaladie.findAll({
        where: {
          dataEntryId: { [Op.in]: validIds },
          isPrincipal: true // On compte uniquement les catégories principales
        },
        attributes: [
          'categorieMaladieId',
          [DataEntry.sequelize.fn('COUNT', DataEntry.sequelize.col('dataEntryId')), 'count']
        ],
        include: [{
          model: CategorieMaladie,
          as: 'categorie',
          attributes: ['nom', 'code', 'niveau'],
          where: { isActive: true }
        }],
        group: ['categorieMaladieId', 'categorie.id'],
        order: [[DataEntry.sequelize.literal('count'), 'DESC']],
        // Ne pas limiter ici - on limitera après avoir combiné avec les diagnostics texte
        raw: false
      });

      // Étape 2: Vérifier si certaines consultations n'ont pas de catégorie structurée
      const consultationsWithCategories = await DataEntryCategorieMaladie.count({
        where: {
          dataEntryId: { [Op.in]: validIds },
          isPrincipal: true
        },
        distinct: true,
        col: 'dataEntryId'
      });

      const totalConsultations = validIds.length;
      const consultationsWithoutCategories = totalConsultations - consultationsWithCategories;

      // Avertir si des données non structurées sont présentes
      if (consultationsWithoutCategories > 0) {
        console.warn(`⚠️  ${consultationsWithoutCategories} consultation(s) sur ${totalConsultations} n'ont pas de catégorie structurée assignée`);
      }

      // Étape 3: Pour les consultations sans catégorie, faire un fallback sur le texte diagnostic
      let textDiagnostics = [];
      if (consultationsWithoutCategories > 0) {
        const entriesWithoutCategories = await DataEntry.findAll({
          where: {
            id: { [Op.in]: validIds }
          },
          attributes: ['id', 'diagnostic'],
          include: [{
            model: DataEntryCategorieMaladie,
            as: 'categoriesAssociations',
            required: false,
            where: { isPrincipal: true }
          }]
        });

        // Filtrer celles qui n'ont vraiment pas de catégorie principale
        const entriesWithoutCat = entriesWithoutCategories.filter(
          entry => !entry.categoriesAssociations || entry.categoriesAssociations.length === 0
        );

        // Grouper par diagnostic texte
        const diagCounts = {};
        entriesWithoutCat.forEach(entry => {
          const diag = entry.diagnostic.trim();
          diagCounts[diag] = (diagCounts[diag] || 0) + 1;
        });

        textDiagnostics = Object.entries(diagCounts)
          .map(([diagnostic, count]) => ({ diagnostic, count }))
          .sort((a, b) => b.count - a.count);
      }

      // Étape 4: Combiner les résultats structurés et non structurés
      let combinedResults = [
        ...categoryStats.map(stat => ({
          diagnostic: stat.categorie.nom,
          count: parseInt(stat.get('count')),
          isStructured: true,
          code: stat.categorie.code
        })),
        ...textDiagnostics.map(d => ({
          diagnostic: d.diagnostic,
          count: d.count,
          isStructured: false
        }))
      ];

      // Trier par count décroissant et limiter
      combinedResults.sort((a, b) => b.count - a.count);
      combinedResults = combinedResults.slice(0, limit);

      // Calculer le total pour les pourcentages
      const total = combinedResults.reduce((sum, d) => sum + d.count, 0);

      // Formater les résultats finaux
      return combinedResults.map(d => ({
        diagnostic: d.diagnostic,
        count: d.count,
        percentage: total > 0 ? parseFloat(((d.count / total) * 100).toFixed(2)) : 0
      }));
    },

    /**
     * Top medications avec filtres
     * Utilise les prescriptionItems structurés pour agréger les médicaments prescrits.
     * Ignore le champ prescription libre (texte).
     * 
     * @param {number} limit - Nombre maximum de résultats (défaut: 10)
     * @param {string} dispensaireId - ID du dispensaire (optionnel)
     * @param {string} startDate - Date de début (format ISO, optionnel)
     * @param {string} endDate - Date de fin (format ISO, optionnel)
     * @returns {Array<{medicament: string, count: number, avgDuree: string, totalDuree: string}>}
     */
    topMedications: async (_, { limit = 10, dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, PrescriptionItem } = await import('../../models/index.js');

      // Construction de la clause WHERE pour filtrer les DataEntries
      const whereClause = { isActive: true };
      
      if (dispensaireId) {
        whereClause.dispensaireId = dispensaireId;
      }
      
      if (startDate && endDate) {
        whereClause.dateConsultation = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Étape 1: Obtenir les IDs des consultations valides
      const validDataEntryIds = await DataEntry.findAll({
        where: whereClause,
        attributes: ['id'],
        raw: true
      });

      const validIds = validDataEntryIds.map(entry => entry.id);

      if (validIds.length === 0) {
        return [];
      }

      // Étape 2: Agréger les prescriptionItems par médicament
      // On utilise une requête brute pour faire les agrégations SQL complexes
      const medicationStats = await PrescriptionItem.sequelize.query(`
        SELECT 
          medicament,
          COUNT(*) as count,
          ARRAY_AGG(duree) FILTER (WHERE duree IS NOT NULL AND duree != '') as durees
        FROM prescription_items
        WHERE 
          "dataEntryId" IN (:validIds)
          AND "isActive" = true
          AND medicament IS NOT NULL
          AND medicament != ''
        GROUP BY medicament
        ORDER BY count DESC
        LIMIT :limit
      `, {
        replacements: { validIds, limit },
        type: DataEntry.sequelize.QueryTypes.SELECT
      });

      // Étape 3: Calculer les durées moyennes et totales
      const results = medicationStats.map(stat => {
        const durees = stat.durees || [];
        
        // Parser les durées en jours (on essaie de normaliser les formats)
        const dureesInDays = durees.map(d => {
          if (!d) return null;
          
          // Extraire les nombres et les unités
          const match = d.toLowerCase().match(/(\d+)\s*(j|jour|jours|d|day|days|semaine|semaines|s|w|week|weeks|mois|m|month|months)?/);
          if (!match) return null;
          
          const value = parseInt(match[1]);
          const unit = match[2];
          
          if (!unit || unit.startsWith('j') || unit.startsWith('d')) {
            return value; // jours
          } else if (unit.startsWith('s') || unit.startsWith('w')) {
            return value * 7; // semaines -> jours
          } else if (unit.startsWith('m')) {
            return value * 30; // mois -> jours (approximatif)
          }
          
          return value; // par défaut, considérer comme jours
        }).filter(d => d !== null);
        
        let avgDuree = null;
        let totalDuree = null;
        
        if (dureesInDays.length > 0) {
          const total = dureesInDays.reduce((sum, d) => sum + d, 0);
          const avg = total / dureesInDays.length;
          
          totalDuree = `${total}j`;
          avgDuree = `${Math.round(avg)}j`;
        }
        
        return {
          medicament: stat.medicament,
          count: parseInt(stat.count),
          avgDuree,
          totalDuree
        };
      });

      return results;
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
            dateFrom = new Date(now);
            dateFrom.setDate(now.getDate() - 30);
            break;
          case 'week':
            dateFrom = new Date(now);
            dateFrom.setDate(now.getDate() - 12 * 7);
            break;
          case 'month':
            dateFrom = new Date(now);
            dateFrom.setMonth(now.getMonth() - 12);
            break;
          case 'year':
            dateFrom = new Date(now);
            dateFrom.setFullYear(now.getFullYear() - 5);
            break;
          default:
            dateFrom = new Date(now);
            dateFrom.setMonth(now.getMonth() - 12);
        }
        dateTo = new Date();
      }

      whereClause.dateConsultation = {
        [Op.between]: [dateFrom, dateTo]
      };

      // Format Postgres pour to_char
      let pgFormat;
      switch (period) {
        case 'day':
          pgFormat = 'YYYY-MM-DD';
          break;
        case 'week':
          pgFormat = 'IYYY-"W"IW';
          break;
        case 'month':
          pgFormat = 'YYYY-MM';
          break;
        case 'year':
          pgFormat = 'YYYY';
          break;
        default:
          pgFormat = 'YYYY-MM';
      }

      const periodExpr = DataEntry.sequelize.fn('to_char', DataEntry.sequelize.col('dateConsultation'), pgFormat);

      const evolution = await DataEntry.findAll({
        where: whereClause,
        attributes: [
          [periodExpr, 'period'],
          [DataEntry.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: [DataEntry.sequelize.literal(`to_char("dateConsultation", '${pgFormat}')`)],
        order: [[DataEntry.sequelize.literal(`to_char("dateConsultation", '${pgFormat}')`), 'ASC']],
        raw: true
      });

      return evolution.map(e => ({
        period: e.period,
        date: e.period,
        count: parseInt(e.count, 10)
      }));
    },

    /**
     * Statistiques par dispensaire
     */
    dispensaireStats: async (_, { dispensaireId, startDate, endDate }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, Patient, CategorieMaladie } = await import('../../models/index.js');

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

      // ✅ SOLUTION: Utiliser Sequelize ORM au lieu de SQL brut
      // Récupérer les associations via l'ORM
      const consultationsWithCategories = await DataEntry.findAll({
        where: whereClause,
        include: [{
          model: CategorieMaladie,
          as: 'categories',
          through: { attributes: [] },
          attributes: ['id', 'nom', 'code']
        }],
        attributes: ['id']
      });

      // Compter les catégories manuellement
      const categoryCounts = {};
      consultationsWithCategories.forEach(consultation => {
        consultation.categories.forEach(cat => {
          const key = cat.id;
          if (!categoryCounts[key]) {
            categoryCounts[key] = {
              id: cat.id,
              nom: cat.nom,
              code: cat.code,
              count: 0
            };
          }
          categoryCounts[key].count++;
        });
      });

      // Trier et prendre le top 5
      const topCategories = Object.values(categoryCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(cat => ({
          categorie: {
            id: cat.id,
            nom: cat.nom,
            code: cat.code
          },
          nombreConsultations: cat.count
        }));

      console.log('🏥 Top catégories (ORM):', topCategories);

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
        topCategories
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
     * Exporter un rapport en CSV ou PDF
     */
    exportReport: async (_, { format, filters }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      try {
        const { DataEntry, Patient, Dispensaire, User } = await import('../../models/index.js');
        const { generateCSV } = await import('../../utils/export/csvGenerator.js');
        const { generatePDF } = await import('../../utils/export/pdfGenerator.js');

        // Validate format
        const validFormats = ['csv', 'pdf', 'CSV', 'PDF'];
        if (!validFormats.includes(format)) {
          return {
            success: false,
            message: `Format non supporté: ${format}. Formats acceptés: CSV, PDF`,
            url: null,
            fileName: null
          };
        }

        const normalizedFormat = format.toLowerCase();

        // Build where clause based on filters
        const whereClause = { isActive: true };
        
        if (filters.dispensaireId) {
          whereClause.dispensaireId = filters.dispensaireId;
        }
        
        if (filters.startDate && filters.endDate) {
          whereClause.dateConsultation = {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          };
        }
        
        if (filters.typeConsultation) {
          whereClause.typeConsultation = filters.typeConsultation;
        }

        // Fetch data from database
        const consultations = await DataEntry.findAll({
          where: whereClause,
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['nom', 'prenom', 'numeroPatient']
            },
            {
              model: Dispensaire,
              as: 'dispensaire',
              attributes: ['name']
            },
            {
              model: User,
              as: 'createdBy',
              attributes: ['nom', 'prenom']
            }
          ],
          order: [['dateConsultation', 'DESC']],
          limit: 1000 // Limit to prevent too large exports
        });

        // Transform data for export
        const exportData = consultations.map(consultation => ({
          id: consultation.id,
          dateConsultation: consultation.dateConsultation,
          patientName: consultation.patient 
            ? `${consultation.patient.nom} ${consultation.patient.prenom || ''}`.trim()
            : 'N/A',
          numeroPatient: consultation.patient?.numeroPatient || 'N/A',
          typeConsultation: consultation.typeConsultation,
          diagnostic: consultation.diagnostic,
          prescription: consultation.prescription || '',
          dispensaireName: consultation.dispensaire?.name || 'N/A',
          agentName: consultation.createdBy
            ? `${consultation.createdBy.nom} ${consultation.createdBy.prenom || ''}`.trim()
            : 'N/A',
          status: consultation.status
        }));

        // Check if we have data
        if (exportData.length === 0) {
          return {
            success: false,
            message: 'Aucune donnée disponible pour les filtres sélectionnés',
            url: null,
            fileName: null
          };
        }

        // Generate file based on format
        let result;
        if (normalizedFormat === 'csv') {
          result = await generateCSV(exportData, filters);
        } else if (normalizedFormat === 'pdf') {
          result = await generatePDF(exportData, filters);
        }

        // Get base URL from environment or construct it
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
        const downloadUrl = `${baseUrl}/download/${result.fileName}`;

        return {
          success: true,
          message: `Rapport ${normalizedFormat.toUpperCase()} généré avec succès (${exportData.length} consultation${exportData.length > 1 ? 's' : ''})`,
          url: downloadUrl,
          fileName: result.fileName
        };

      } catch (error) {
        console.error('Error exporting report:', error);
        return {
          success: false,
          message: `Erreur lors de la génération du rapport: ${error.message}`,
          url: null,
          fileName: null
        };
      }
    }
  }
};

export default reportsResolvers;