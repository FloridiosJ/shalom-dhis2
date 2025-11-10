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
      // Always ensure we return a valid response object
      try {
        if (!user) {
          return {
            success: false,
            message: 'Non authentifié. Veuillez vous connecter.',
            url: null,
            fileName: null
          };
        }

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
        } else {
          // This should never happen due to validation above, but just in case
          return {
            success: false,
            message: `Format non supporté: ${normalizedFormat}`,
            url: null,
            fileName: null
          };
        }

        // Ensure result is valid
        if (!result || !result.fileName) {
          throw new Error('La génération du fichier a échoué');
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
        console.error('Error stack:', error.stack);
        
        // Always return a valid response object, never null
        return {
          success: false,
          message: `Erreur lors de la génération du rapport: ${error.message || 'Erreur inconnue'}`,
          url: null,
          fileName: null
        };
      }
    },

    /**
     * Export quarterly Tatitra report for CSB Loterana
     */
    exportTatitraReport: async (_, { quarter, year, dispensaireId }, { user }) => {
      try {
        if (!user) {
          return {
            success: false,
            message: 'Non authentifié. Veuillez vous connecter.',
            url: null,
            fileName: null
          };
        }

        const { DataEntry, Patient, Dispensaire, CategorieMaladie, DataEntryCategorieMaladie } = await import('../../models/index.js');
        const { generateTatitraPDF } = await import('../../utils/export/tatitraPdfGenerator.js');

        // Validate quarter
        const validQuarters = ['VOALOHANY', 'FAHAROA', 'FAHATELO', 'EFATRA'];
        if (!validQuarters.includes(quarter)) {
          return {
            success: false,
            message: `Trimestre invalide: ${quarter}. Trimestres acceptés: ${validQuarters.join(', ')}`,
            url: null,
            fileName: null
          };
        }

        // Calculate date range for the quarter
        const quarterMap = {
          'VOALOHANY': { start: 1, end: 3 },   // Q1: Jan-Mar
          'FAHAROA': { start: 4, end: 6 },     // Q2: Apr-Jun
          'FAHATELO': { start: 7, end: 9 },    // Q3: Jul-Sep
          'EFATRA': { start: 10, end: 12 }     // Q4: Oct-Dec
        };

        const months = quarterMap[quarter];
        const startDate = new Date(year, months.start - 1, 1);
        const endDate = new Date(year, months.end, 0, 23, 59, 59);

        // Build where clause
        const whereClause = {
          isActive: true,
          dateConsultation: {
            [Op.between]: [startDate, endDate]
          }
        };

        if (dispensaireId) {
          whereClause.dispensaireId = dispensaireId;
        }

        // Fetch dispensaires (zones) data
        const dispensaires = dispensaireId 
          ? await Dispensaire.findAll({ where: { id: dispensaireId, isActive: true } })
          : await Dispensaire.findAll({ where: { isActive: true } });

        const zones = dispensaires.map(d => d.name);

        // Fetch consultation data
        const consultations = await DataEntry.findAll({
          where: whereClause,
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['age', 'sexe']
            },
            {
              model: Dispensaire,
              as: 'dispensaire',
              attributes: ['name']
            }
          ]
        });

        // Aggregate data for Section 1: Births by age group and zone
        const birthsData = aggregateBirthsByZone(consultations, zones);

        // Aggregate data for Section 2: Diseases by zone
        const medicalData = await aggregateDiseasesByZone(
          DataEntry,
          CategorieMaladie,
          DataEntryCategorieMaladie,
          whereClause,
          zones
        );

        // Section 1 statistics
        const section1Data = {
          prayerMeetings: 19, // This could be fetched from ActiviteSpirituelle table
          visitorsReceived: consultations.length,
          birthsByZone: birthsData
        };

        const section2Data = {
          diseasesByZone: medicalData
        };

        // Prepare report data
        const reportData = {
          zones: zones,
          section1: section1Data,
          section2: section2Data,
          period: {
            quarter,
            year,
            startDate: startDate.toLocaleDateString('fr-FR'),
            endDate: endDate.toLocaleDateString('fr-FR')
          }
        };

        // Generate PDF
        const result = await generateTatitraPDF(reportData, { quarter, year });

        if (!result || !result.fileName) {
          throw new Error('La génération du fichier Tatitra a échoué');
        }

        const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
        const downloadUrl = `${baseUrl}/download/${result.fileName}`;

        return {
          success: true,
          message: `Rapport Tatitra Q${quarter} ${year} généré avec succès`,
          url: downloadUrl,
          fileName: result.fileName
        };

      } catch (error) {
        console.error('Error exporting Tatitra report:', error);
        console.error('Error stack:', error.stack);
        
        return {
          success: false,
          message: `Erreur lors de la génération du rapport Tatitra: ${error.message || 'Erreur inconnue'}`,
          url: null,
          fileName: null
        };
      }
    }
  }
};

/**
 * Aggregate births by age group and zone
 */
function aggregateBirthsByZone(consultations, zones) {
  const ageGroups = [
    { category: 'Zaza (12 taona noho midina)', minAge: 0, maxAge: 12 },
    { category: 'Tanora (13 taona - 30 taona)', minAge: 13, maxAge: 30 },
    { category: 'Olon-dehibe maherin\'ny 30 taona', minAge: 31, maxAge: 150 }
  ];

  return ageGroups.map(group => {
    const zoneData = zones.map(zoneName => {
      const zoneConsultations = consultations.filter(c => 
        c.dispensaire?.name === zoneName &&
        c.patient?.age >= group.minAge &&
        c.patient?.age <= group.maxAge
      );

      const male = zoneConsultations.filter(c => c.patient?.sexe === 'M').length;
      const female = zoneConsultations.filter(c => c.patient?.sexe === 'F').length;

      return { male, female };
    });

    // Add total column
    const totalMale = zoneData.reduce((sum, z) => sum + z.male, 0);
    const totalFemale = zoneData.reduce((sum, z) => sum + z.female, 0);
    zoneData.push({ male: totalMale, female: totalFemale });

    return {
      category: group.category,
      zones: zoneData
    };
  });
}

/**
 * Aggregate diseases by zone
 */
async function aggregateDiseasesByZone(DataEntry, CategorieMaladie, DataEntryCategorieMaladie, whereClause, zones) {
  // Get all consultations with categories
  const consultations = await DataEntry.findAll({
    where: whereClause,
    include: [
      {
        model: CategorieMaladie,
        as: 'categories',
        through: { 
          attributes: ['isPrincipal'],
          where: { isPrincipal: true }
        },
        attributes: ['id', 'nom', 'code']
      },
      {
        model: await import('../../models/index.js').then(m => m.Dispensaire),
        as: 'dispensaire',
        attributes: ['name']
      }
    ]
  });

  // Get unique disease categories
  const diseaseCategories = new Map();
  consultations.forEach(consultation => {
    consultation.categories.forEach(category => {
      if (!diseaseCategories.has(category.id)) {
        diseaseCategories.set(category.id, {
          name: category.nom,
          code: category.code
        });
      }
    });
  });

  // Aggregate by disease and zone
  const diseaseData = [];
  diseaseCategories.forEach((disease, diseaseId) => {
    const zoneData = zones.map(zoneName => {
      return consultations.filter(c => 
        c.dispensaire?.name === zoneName &&
        c.categories.some(cat => cat.id === diseaseId)
      ).length;
    });

    // Add total column
    const total = zoneData.reduce((sum, count) => sum + count, 0);
    zoneData.push(total);

    diseaseData.push({
      disease: disease.name,
      zones: zoneData,
      isSubcategory: false
    });
  });

  // Sort by total count descending
  diseaseData.sort((a, b) => b.zones[b.zones.length - 1] - a.zones[a.zones.length - 1]);

  return diseaseData;
}

export default reportsResolvers;