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
    },

    /**
     * Fitoriana Statistics
     * Agrégation des consultations par tranche d'âge, genre et dispensaire
     * pour la section "MAHAKASIKA NY ASA FITORIANA" du rapport Tatitra
     * 
     * @param {string} dateFrom - Date de début (format ISO)
     * @param {string} dateTo - Date de fin (format ISO)
     * @param {Array<string>} dispensaireIds - IDs des dispensaires (optionnel)
     * @param {Array<string>} religions - Religions à filtrer (optionnel)
     * @returns {Object} Statistiques structurées par tranche d'âge et dispensaire
     */
    fitorianaStats: async (_, { dateFrom, dateTo, dispensaireIds, religions }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Patient, Dispensaire } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les consultations
      const whereClause = {
        isActive: true,
        dateConsultation: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer toutes les consultations avec les patients et dispensaires
      const consultations = await DataEntry.findAll({
        where: whereClause,
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'age', 'dateNaissance', 'sexe', 'religion'],
            // Filtrer par religion si spécifié
            where: religions && religions.length > 0 
              ? { religion: { [Op.in]: religions } }
              : undefined
          },
          {
            model: Dispensaire,
            as: 'dispensaire',
            attributes: ['id', 'name'],
            where: { isActive: true }
          }
        ],
        attributes: ['id', 'patientId', 'dispensaireId']
      });

      console.log(`✅ Trouvé ${consultations.length} consultations pour la période`);

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      // Définition des tranches d'âge selon les spécifications
      const ageGroups = [
        { 
          label: 'Zaza (12 taona noho midina)', 
          code: 'ZAZA',
          minAge: 0, 
          maxAge: 12 
        },
        { 
          label: 'Tanora (13 taona - 30 taona)', 
          code: 'TANORA',
          minAge: 13, 
          maxAge: 30 
        },
        { 
          label: 'Olon-dehibe maherin\'ny 30 taona', 
          code: 'OLON_DEHIBE',
          minAge: 31, 
          maxAge: 150 
        }
      ];

      // Fonction pour calculer l'âge à partir de la date de naissance
      const calculateAge = (dateNaissance, fallbackAge) => {
        if (dateNaissance) {
          const birthDate = new Date(dateNaissance);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          return Math.max(0, age);
        }
        return fallbackAge || 0;
      };

      // Fonction pour déterminer la tranche d'âge
      const getAgeGroup = (age) => {
        if (age <= 12) return 'ZAZA';
        if (age >= 13 && age <= 30) return 'TANORA';
        return 'OLON_DEHIBE';
      };

      // Fonction pour convertir le sexe en lahy/vavy
      const getSexeLabel = (sexe) => {
        // M = Masculin = lahy, F = Féminin = vavy
        if (sexe === 'M' || sexe === 'L') return 'lahy';
        if (sexe === 'F') return 'vavy';
        return 'lahy'; // Par défaut
      };

      // Agrégation : structure pour stocker les compteurs
      // Structure: { ageGroup: { dispensaireId: { lahy: count, vavy: count } } }
      const aggregation = {};

      // Initialiser la structure
      ageGroups.forEach(ageGroup => {
        aggregation[ageGroup.code] = {};
        dispensaires.forEach(disp => {
          aggregation[ageGroup.code][disp.id] = { lahy: 0, vavy: 0 };
        });
      });

      // Compter les consultations par âge, sexe et dispensaire
      consultations.forEach(consultation => {
        const patient = consultation.patient;
        const dispensaireId = consultation.dispensaireId;

        if (!patient || !dispensaireId) return;

        const age = calculateAge(patient.dateNaissance, patient.age);
        const ageGroup = getAgeGroup(age);
        const sexeLabel = getSexeLabel(patient.sexe);

        if (aggregation[ageGroup] && aggregation[ageGroup][dispensaireId]) {
          aggregation[ageGroup][dispensaireId][sexeLabel]++;
        }
      });

      // Construire la réponse structurée
      const rows = ageGroups.map(ageGroup => {
        const valuesByDispensaire = dispensaires.map(disp => ({
          dispensaireName: disp.name,
          values: {
            lahy: aggregation[ageGroup.code][disp.id].lahy,
            vavy: aggregation[ageGroup.code][disp.id].vavy
          }
        }));

        // Calculer Fitambarany (totaux)
        const fitambarany = {
          lahy: dispensaires.reduce((sum, disp) => 
            sum + aggregation[ageGroup.code][disp.id].lahy, 0),
          vavy: dispensaires.reduce((sum, disp) => 
            sum + aggregation[ageGroup.code][disp.id].vavy, 0)
        };

        return {
          label: ageGroup.label,
          ageGroup: ageGroup.code,
          valuesByDispensaire,
          fitambarany
        };
      });

      // Calculer le total de consultations
      const totalConsultations = consultations.length;

      return {
        rows,
        dateFrom,
        dateTo,
        totalConsultations
      };
    },

    /**
     * Consultants and Consultations by Zone
     * Aggregates unique patients (consultants) and total consultations per dispensaire
     * for a given period, useful for Tatitra reporting and data visualization
     * 
     * @param {string} dateFrom - Start date (format ISO YYYY-MM-DD)
     * @param {string} dateTo - End date (format ISO YYYY-MM-DD)
     * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
     * @returns {Array<{dispensaire: Object, consultants: number, consultations: number}>}
     */
    consultantsByZone: async (_, { dateFrom, dateTo, dispensaireIds }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, sequelize } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les consultations
      const whereClause = {
        isActive: true,
        dateConsultation: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      console.log(`✅ Trouvé ${dispensaires.length} dispensaires actifs`);

      // Agrégation efficace avec SQL pour compter consultants (patients uniques) et consultations par dispensaire
      // Utilise COUNT(DISTINCT patientId) pour les consultants et COUNT(*) pour les consultations
      const stats = await DataEntry.findAll({
        where: whereClause,
        attributes: [
          'dispensaireId',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('patientId'))), 'consultants'],
          [sequelize.fn('COUNT', '*'), 'consultations']
        ],
        group: ['dispensaireId'],
        raw: true
      });

      console.log(`✅ Agrégation SQL terminée pour ${stats.length} dispensaires avec données`);

      // Créer un mapping dispensaireId -> stats pour un accès rapide
      const statsMap = {};
      stats.forEach(stat => {
        statsMap[stat.dispensaireId] = {
          consultants: parseInt(stat.consultants),
          consultations: parseInt(stat.consultations)
        };
      });

      // Construire le résultat avec tous les dispensaires (même ceux sans consultation = 0)
      const results = dispensaires.map(dispensaire => {
        const stat = statsMap[dispensaire.id] || { consultants: 0, consultations: 0 };
        return {
          dispensaire: {
            id: dispensaire.id,
            name: dispensaire.name
          },
          consultants: stat.consultants,
          consultations: stat.consultations
        };
      });

      // Calculer les totaux globaux (Fitambarany)
      const totalConsultants = results.reduce((sum, r) => sum + r.consultants, 0);
      const totalConsultations = results.reduce((sum, r) => sum + r.consultations, 0);

      // Ajouter une ligne de total avec dispensaire = null
      results.push({
        dispensaire: null,
        consultants: totalConsultants,
        consultations: totalConsultations
      });

      console.log(`✅ Résultat: ${results.length - 1} dispensaires + 1 total (${totalConsultants} consultants, ${totalConsultations} consultations)`);

      return results;
    },

    /**
     * Diagnostics by Zone
     * Aggregates diagnostics (categories or text) with counts per dispensaire for a given period.
     * Returns diagnostic x dispensaire cross-tabulation for Tatitra reporting.
     * 
     * @param {string} dateFrom - Start date (format ISO YYYY-MM-DD)
     * @param {string} dateTo - End date (format ISO YYYY-MM-DD)
     * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
     * @param {number} limit - Optional: limit number of diagnostics returned
     * @returns {Array<{diagnostic: string, dispensaires: Array<{id, name, count}>, total: number}>}
     */
    diagnosticsByZone: async (_, { dateFrom, dateTo, dispensaireIds, limit }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, CategorieMaladie, DataEntryCategorieMaladie } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les consultations
      const whereClause = {
        isActive: true,
        dateConsultation: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      console.log(`✅ Trouvé ${dispensaires.length} dispensaires actifs`);

      // Étape 1: Récupérer les IDs des consultations valides
      const validDataEntryIds = await DataEntry.findAll({
        where: whereClause,
        attributes: ['id', 'dispensaireId'],
        raw: true
      });

      const validIds = validDataEntryIds.map(entry => entry.id);

      if (validIds.length === 0) {
        console.log('⚠️  Aucune consultation trouvée pour la période');
        return [];
      }

      console.log(`✅ Trouvé ${validIds.length} consultations pour la période`);

      // Étape 2: Obtenir les statistiques basées sur les catégories structurées
      // Agrégation par catégorie ET dispensaire
      const categoryStats = await DataEntryCategorieMaladie.findAll({
        where: {
          dataEntryId: { [Op.in]: validIds },
          isPrincipal: true // On compte uniquement les catégories principales
        },
        include: [
          {
            model: CategorieMaladie,
            as: 'categorie',
            attributes: ['nom', 'code', 'niveau'],
            where: { isActive: true }
          },
          {
            model: DataEntry,
            as: 'dataEntry',
            attributes: ['dispensaireId'],
            where: whereClause
          }
        ],
        attributes: [
          'categorieMaladieId',
          [DataEntry.sequelize.col('dataEntry.dispensaireId'), 'dispensaireId'],
          [DataEntry.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['categorieMaladieId', 'categorie.id', 'categorie.nom', 'categorie.code', 'categorie.niveau', 'dataEntry.id', 'dataEntry.dispensaireId'],
        order: [[DataEntry.sequelize.literal('count'), 'DESC']],
        raw: false
      });

      console.log(`✅ Trouvé ${categoryStats.length} agrégations catégorie x dispensaire`);

      // Étape 3: Vérifier si certaines consultations n'ont pas de catégorie structurée
      const consultationsWithCategories = new Set(
        (await DataEntryCategorieMaladie.findAll({
          where: {
            dataEntryId: { [Op.in]: validIds },
            isPrincipal: true
          },
          attributes: ['dataEntryId'],
          raw: true
        })).map(row => row.dataEntryId)
      );

      const totalConsultations = validIds.length;
      const consultationsWithoutCategories = totalConsultations - consultationsWithCategories.size;

      // Avertir si des données non structurées sont présentes
      if (consultationsWithoutCategories > 0) {
        console.warn(`⚠️  ${consultationsWithoutCategories} consultation(s) sur ${totalConsultations} n'ont pas de catégorie structurée assignée`);
      }

      // Étape 4: Pour les consultations sans catégorie, faire un fallback sur le texte diagnostic
      let textDiagnosticsByZone = {};
      if (consultationsWithoutCategories > 0) {
        const entriesWithoutCategories = await DataEntry.findAll({
          where: {
            id: { [Op.in]: validIds }
          },
          attributes: ['id', 'diagnostic', 'dispensaireId'],
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

        // Grouper par diagnostic texte ET dispensaire
        entriesWithoutCat.forEach(entry => {
          const diag = entry.diagnostic.trim();
          const dispId = entry.dispensaireId;
          
          if (!textDiagnosticsByZone[diag]) {
            textDiagnosticsByZone[diag] = {};
          }
          
          textDiagnosticsByZone[diag][dispId] = (textDiagnosticsByZone[diag][dispId] || 0) + 1;
        });

        console.log(`✅ Trouvé ${Object.keys(textDiagnosticsByZone).length} diagnostics texte sans catégorie`);
      }

      // Étape 5: Construire la structure de données finale
      // Structure: { diagnostic: { dispensaireId: count } }
      const diagnosticAggregation = {};

      // Ajouter les catégories structurées
      categoryStats.forEach(stat => {
        const diagnostic = stat.categorie.nom;
        const dispensaireId = stat.get('dispensaireId');
        const count = parseInt(stat.get('count'));

        if (!diagnosticAggregation[diagnostic]) {
          diagnosticAggregation[diagnostic] = {};
        }

        diagnosticAggregation[diagnostic][dispensaireId] = count;
      });

      // Ajouter les diagnostics texte (fallback)
      Object.entries(textDiagnosticsByZone).forEach(([diagnostic, dispensaireCounts]) => {
        if (!diagnosticAggregation[diagnostic]) {
          diagnosticAggregation[diagnostic] = {};
        }

        // Merger les compteurs (ne devrait pas se chevaucher, mais par sécurité)
        Object.entries(dispensaireCounts).forEach(([dispId, count]) => {
          diagnosticAggregation[diagnostic][dispId] = 
            (diagnosticAggregation[diagnostic][dispId] || 0) + count;
        });
      });

      // Étape 6: Formater en tableau pour GraphQL et calculer les totaux
      let results = Object.entries(diagnosticAggregation).map(([diagnostic, dispensaireCounts]) => {
        const dispensairesData = dispensaires.map(disp => ({
          id: disp.id,
          name: disp.name,
          count: dispensaireCounts[disp.id] || 0
        }));

        const total = dispensairesData.reduce((sum, d) => sum + d.count, 0);

        return {
          diagnostic,
          dispensaires: dispensairesData,
          total
        };
      });

      // Trier par total décroissant
      results.sort((a, b) => b.total - a.total);

      // Appliquer la limite si spécifiée
      if (limit && limit > 0) {
        results = results.slice(0, limit);
      }

      console.log(`✅ Résultat: ${results.length} diagnostics agrégés par ${dispensaires.length} dispensaires`);

      return results;
    },

    /**
     * Query education statistics by zone for Tatitra Section III
     * Returns education data grouped by category (short-term/long-term), dispensaire, and gender.
     * 
     * @param {string} dateFrom - Start date in ISO format (YYYY-MM-DD)
     * @param {string} dateTo - End date in ISO format (YYYY-MM-DD)
     * @param {array} dispensaireIds - Optional array of dispensaire IDs to filter
     * @returns {Array<{category: string, zones: Array, totalMale: number, totalFemale: number}>}
     */
    educationByZone: async (_, { dateFrom, dateTo, dispensaireIds }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, Patient } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les consultations
      const whereClause = {
        isActive: true,
        dateConsultation: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      console.log(`✅ Trouvé ${dispensaires.length} dispensaires actifs pour éducation`);

      // Récupérer les consultations avec patients (pour le genre)
      const consultations = await DataEntry.findAll({
        where: whereClause,
        include: [{
          model: Patient,
          as: 'patient',
          attributes: ['sexe'],
          required: true
        }],
        attributes: ['id', 'dispensaireId', 'diagnostic', 'notes', 'typeConsultation']
      });

      console.log(`✅ Trouvé ${consultations.length} consultations pour la période`);

      if (consultations.length === 0) {
        // Return empty structure with all dispensaires but zero counts
        const categories = [
          'Fanabeazana aiza tsy maharitra',
          'Fanabeazana aiza maharitra'
        ];

        return categories.map(category => ({
          category,
          zones: dispensaires.map(disp => ({
            id: disp.id,
            name: disp.name,
            male: 0,
            female: 0
          })),
          totalMale: 0,
          totalFemale: 0
        }));
      }

      // Définir les mots-clés pour chaque catégorie d'éducation
      const educationKeywords = {
        shortTerm: ['fanabeazana fohy', 'éducation courte', 'formation courte', 'sensibilisation', 'court terme', 'tsy maharitra'],
        longTerm: ['fanabeazana lava', 'éducation longue', 'formation longue', 'formation continue', 'long terme', 'maharitra']
      };

      // Structure pour stocker les compteurs: { category: { dispensaireId: { male: 0, female: 0 } } }
      const educationCounts = {
        'Fanabeazana aiza tsy maharitra': {},
        'Fanabeazana aiza maharitra': {}
      };

      // Initialiser les compteurs pour tous les dispensaires
      dispensaires.forEach(disp => {
        educationCounts['Fanabeazana aiza tsy maharitra'][disp.id] = { male: 0, female: 0 };
        educationCounts['Fanabeazana aiza maharitra'][disp.id] = { male: 0, female: 0 };
      });

      // Parcourir les consultations et catégoriser
      consultations.forEach(consultation => {
        const text = `${consultation.diagnostic || ''} ${consultation.notes || ''} ${consultation.typeConsultation || ''}`.toLowerCase();
        const gender = consultation.patient.sexe;
        const dispensaireId = consultation.dispensaireId;

        // Déterminer si c'est une éducation et de quel type
        let isShortTerm = false;
        let isLongTerm = false;

        // Vérifier les mots-clés de court terme
        for (const keyword of educationKeywords.shortTerm) {
          if (text.includes(keyword.toLowerCase())) {
            isShortTerm = true;
            break;
          }
        }

        // Vérifier les mots-clés de long terme (si pas déjà court terme)
        if (!isShortTerm) {
          for (const keyword of educationKeywords.longTerm) {
            if (text.includes(keyword.toLowerCase())) {
              isLongTerm = true;
              break;
            }
          }
        }

        // Si aucun mot-clé spécifique, vérifier si c'est une activité d'éducation générale
        if (!isShortTerm && !isLongTerm) {
          const generalEducationKeywords = ['éducation', 'fanabeazana', 'formation', 'sensibilisation'];
          for (const keyword of generalEducationKeywords) {
            if (text.includes(keyword.toLowerCase())) {
              // Par défaut, considérer comme court terme si non spécifié
              isShortTerm = true;
              break;
            }
          }
        }

        // Incrémenter les compteurs appropriés
        if (isShortTerm && educationCounts['Fanabeazana aiza tsy maharitra'][dispensaireId]) {
          if (gender === 'M' || gender === 'L') {
            educationCounts['Fanabeazana aiza tsy maharitra'][dispensaireId].male++;
          } else if (gender === 'F') {
            educationCounts['Fanabeazana aiza tsy maharitra'][dispensaireId].female++;
          }
        } else if (isLongTerm && educationCounts['Fanabeazana aiza maharitra'][dispensaireId]) {
          if (gender === 'M' || gender === 'L') {
            educationCounts['Fanabeazana aiza maharitra'][dispensaireId].male++;
          } else if (gender === 'F') {
            educationCounts['Fanabeazana aiza maharitra'][dispensaireId].female++;
          }
        }
      });

      // Formater les résultats pour GraphQL
      const results = Object.entries(educationCounts).map(([category, dispensaireCounts]) => {
        const zones = dispensaires.map(disp => ({
          id: disp.id,
          name: disp.name,
          male: dispensaireCounts[disp.id]?.male || 0,
          female: dispensaireCounts[disp.id]?.female || 0
        }));

        const totalMale = zones.reduce((sum, z) => sum + z.male, 0);
        const totalFemale = zones.reduce((sum, z) => sum + z.female, 0);

        return {
          category,
          zones,
          totalMale,
          totalFemale
        };
      });

      console.log(`✅ Résultat éducation: ${results.length} catégories pour ${dispensaires.length} dispensaires`);
      results.forEach(r => {
        console.log(`   ${r.category}: ${r.totalMale} hommes, ${r.totalFemale} femmes`);
      });

      return results;
    },

    /**
     * Query maternal health statistics by zone for Tatitra Section IV
     * Returns maternal health indicators grouped by dispensaire.
     * 
     * @param {string} dateFrom - Start date in ISO format (YYYY-MM-DD)
     * @param {string} dateTo - End date in ISO format (YYYY-MM-DD)
     * @param {array} dispensaireIds - Optional array of dispensaire IDs to filter
     * @returns {Array<{indicator: string, dispensaires: Array<{id, name, count}>, total: number}>}
     */
    maternalHealthByZone: async (_, { dateFrom, dateTo, dispensaireIds }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Dispensaire, Patient } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les consultations
      const whereClause = {
        isActive: true,
        dateConsultation: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      console.log(`✅ Trouvé ${dispensaires.length} dispensaires actifs pour santé maternelle`);

      // Définition des indicateurs de santé maternelle
      const maternalIndicators = [
        {
          name: 'Femmes ayant passé à la CPN',
          typeConsultation: 'CPN',
          keywords: ['cpn', 'consultation prénatale', 'consultation prenatale', 'prénatal', 'prenatal', 'grossesse']
        },
        {
          name: 'Femmes enceintes ayant fait le Test VIH',
          typeConsultation: 'IST', // IST/SIDA includes HIV tests
          keywords: ['vih', 'hiv', 'test vih', 'dépistage vih', 'depistage vih', 'enceinte', 'grossesse'],
          requiresPregnancyContext: true
        },
        {
          name: 'Femmes enceintes ayant fait le Test sérologique',
          typeConsultation: 'PREVENTIF',
          keywords: ['sérologique', 'serologique', 'test serologique', 'test sérologique', 'syphilis', 'enceinte', 'grossesse'],
          requiresPregnancyContext: true
        },
        {
          name: 'Accouchements',
          typeConsultation: 'ACCOUCHEMENT',
          keywords: ['accouchement', 'naissance', 'delivrance', 'délivrance', 'parturition']
        }
      ];

      // Structure pour stocker les compteurs: { indicator: { dispensaireId: count } }
      const indicatorCounts = {};

      // Initialiser les compteurs pour tous les indicateurs et dispensaires
      maternalIndicators.forEach(indicator => {
        indicatorCounts[indicator.name] = {};
        dispensaires.forEach(disp => {
          indicatorCounts[indicator.name][disp.id] = 0;
        });
      });

      // Pour chaque indicateur, récupérer et compter les consultations
      for (const indicator of maternalIndicators) {
        // Construire la clause WHERE spécifique à l'indicateur
        const indicatorWhereClause = {
          ...whereClause,
          typeConsultation: indicator.typeConsultation
        };

        // Récupérer les consultations avec patients (pour vérifier le genre = féminin)
        const consultations = await DataEntry.findAll({
          where: indicatorWhereClause,
          include: [{
            model: Patient,
            as: 'patient',
            attributes: ['sexe'],
            where: { sexe: 'F' }, // Seulement les femmes
            required: true
          }],
          attributes: ['id', 'dispensaireId', 'diagnostic', 'notes']
        });

        console.log(`✅ Trouvé ${consultations.length} consultations ${indicator.typeConsultation} pour femmes`);

        // Compter les consultations qui correspondent aux mots-clés
        consultations.forEach(consultation => {
          const text = `${consultation.diagnostic || ''} ${consultation.notes || ''}`.toLowerCase();
          const dispensaireId = consultation.dispensaireId;

          // Vérifier si le texte contient les mots-clés de l'indicateur
          let matches = false;
          
          // Pour les indicateurs nécessitant un contexte de grossesse
          if (indicator.requiresPregnancyContext) {
            // Vérifier qu'il y a à la fois un mot-clé de test ET un contexte de grossesse
            const hasTestKeyword = indicator.keywords.some(kw => 
              !['enceinte', 'grossesse'].includes(kw) && text.includes(kw.toLowerCase())
            );
            const hasPregnancyContext = ['enceinte', 'grossesse'].some(kw => text.includes(kw));
            matches = hasTestKeyword && hasPregnancyContext;
          } else {
            // Pour les autres indicateurs, vérifier simplement les mots-clés
            matches = indicator.keywords.some(kw => text.includes(kw.toLowerCase()));
          }

          if (matches && indicatorCounts[indicator.name][dispensaireId] !== undefined) {
            indicatorCounts[indicator.name][dispensaireId]++;
          }
        });
      }

      // Formater les résultats pour GraphQL
      const results = maternalIndicators.map(indicator => {
        const dispensairesData = dispensaires.map(disp => ({
          id: disp.id,
          name: disp.name,
          count: indicatorCounts[indicator.name][disp.id] || 0
        }));

        const total = dispensairesData.reduce((sum, d) => sum + d.count, 0);

        return {
          indicator: indicator.name,
          dispensaires: dispensairesData,
          total
        };
      });

      console.log(`✅ Résultat santé maternelle: ${results.length} indicateurs pour ${dispensaires.length} dispensaires`);
      results.forEach(r => {
        console.log(`   ${r.indicator}: ${r.total} total`);
      });

      return results;
    },

    /**
     * Query events/awareness activities by zone for Tatitra Section V
     * @param {string} dateFrom - Start date in ISO format (YYYY-MM-DD)
     * @param {string} dateTo - End date in ISO format (YYYY-MM-DD)
     * @param {Array<string>} dispensaireIds - Optional: filter by specific dispensaires
     * @returns {Array<{zone: string, zoneId: string, events: Array<{theme, participants, date, sessions}>, totalParticipants: number, totalSessions: number}>}
     */
    eventsByZone: async (_, { dateFrom, dateTo, dispensaireIds }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { Event, Dispensaire } = await import('../../models/index.js');

      // Validation des dates
      const startDate = new Date(dateFrom);
      const endDate = new Date(dateTo);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)');
      }
      
      if (startDate > endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
      }

      // Construction de la clause WHERE pour les événements
      const whereClause = {
        isActive: true,
        status: { [Op.in]: ['termine', 'en_cours'] }, // Only completed or ongoing events
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filtrer par dispensaire si spécifié
      if (dispensaireIds && dispensaireIds.length > 0) {
        whereClause.dispensaireId = { [Op.in]: dispensaireIds };
      }

      // Récupérer tous les dispensaires actifs (pour structurer la réponse)
      let dispensaires;
      if (dispensaireIds && dispensaireIds.length > 0) {
        dispensaires = await Dispensaire.findAll({
          where: { 
            id: { [Op.in]: dispensaireIds },
            isActive: true 
          },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      } else {
        dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['name', 'ASC']]
        });
      }

      console.log(`✅ Trouvé ${dispensaires.length} dispensaires actifs pour événements`);

      // Récupérer les événements avec les dispensaires associés
      const events = await Event.findAll({
        where: whereClause,
        include: [{
          model: Dispensaire,
          as: 'dispensaire',
          attributes: ['id', 'name'],
          required: false // Allow events without dispensaire
        }],
        attributes: ['id', 'type_event', 'nombreParticipants', 'date', 'lieu', 'dispensaireId'],
        order: [['date', 'ASC']]
      });

      console.log(`✅ Trouvé ${events.length} événements pour la période`);

      // Grouper les événements par dispensaire
      const eventsByDispensaire = {};
      
      // Initialiser avec tous les dispensaires (même sans événements)
      dispensaires.forEach(disp => {
        eventsByDispensaire[disp.id] = {
          zone: disp.name,
          zoneId: disp.id,
          events: [],
          totalParticipants: 0,
          totalSessions: 0
        };
      });

      // Ajouter les événements à leurs dispensaires respectifs
      events.forEach(event => {
        const dispensaireId = event.dispensaireId;
        
        // Skip events without a dispensaire or with dispensaire not in our list
        if (!dispensaireId || !eventsByDispensaire[dispensaireId]) {
          return;
        }

        const eventData = {
          theme: event.type_event,
          participants: event.nombreParticipants || 0,
          date: new Date(event.date).toLocaleDateString('fr-FR'),
          sessions: 1 // Count each event as one session
        };

        eventsByDispensaire[dispensaireId].events.push(eventData);
        eventsByDispensaire[dispensaireId].totalParticipants += eventData.participants;
        eventsByDispensaire[dispensaireId].totalSessions += 1;
      });

      // Convertir en tableau et trier par nom de zone
      const results = Object.values(eventsByDispensaire).sort((a, b) => 
        a.zone.localeCompare(b.zone)
      );

      console.log(`✅ Événements groupés par zone:`);
      results.forEach(r => {
        console.log(`   ${r.zone}: ${r.events.length} événements, ${r.totalParticipants} participants total`);
      });

      return results;
    }
  },

  Mutation: {
    /**
     * Export Tatitra quarterly report in PDF format
     * @param {string} quarter - Quarter identifier (VOALOHANY, FAHAROA, FAHATELO, EFATRA)
     * @param {number} year - Year (e.g., 2024)
     * @param {string} dispensaireId - Optional dispensaire filter
     * @returns {Object} Export result with success status, message, URL, and fileName
     */
    exportTatitraReport: async (_, { quarter, year, dispensaireId }, { user }) => {
      if (!user) {
        throw new AuthenticationError('Non authentifié');
      }

      const { DataEntry, Patient, Dispensaire, Event, CategorieMaladie } = await import('../../models/index.js');
      const { generateTatitraPDF } = await import('../../utils/export/tatitraPdfGenerator.js');

      try {
        // Validate quarter
        const validQuarters = ['VOALOHANY', 'FAHAROA', 'FAHATELO', 'EFATRA'];
        if (!validQuarters.includes(quarter)) {
          throw new Error(`Invalid quarter. Must be one of: ${validQuarters.join(', ')}`);
        }

        // Calculate date range for the quarter
        const quarterMonths = {
          'VOALOHANY': [0, 2],   // Jan-Mar
          'FAHAROA': [3, 5],      // Apr-Jun
          'FAHATELO': [6, 8],     // Jul-Sep
          'EFATRA': [9, 11]       // Oct-Dec
        };

        const [startMonth, endMonth] = quarterMonths[quarter];
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59);

        // Build where clause for consultations
        const whereClause = {
          isActive: true,
          dateConsultation: {
            [Op.between]: [startDate, endDate]
          }
        };

        if (dispensaireId) {
          whereClause.dispensaireId = dispensaireId;
        }

        // Get all dispensaires (zones)
        const dispensaires = await Dispensaire.findAll({
          where: { isActive: true },
          order: [['name', 'ASC']],
          attributes: ['id', 'name']
        });

        const zones = dispensaires.map(d => d.name);

        // Aggregate data for Section 1: MAHAKASIKA NY ASA FITORIANA
        // For now, we'll use placeholder data since we need more context on how to aggregate this
        const section1 = {
          prayerMeetings: 0,
          visitorsReceived: 0,
          birthsByZone: [],
          nonChristiansByZone: null
        };

        // Aggregate data for Section 2: MAHAKASIKA NY ASA FITSABOANA
        const consultations = await DataEntry.findAll({
          where: whereClause,
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'age', 'sexe', 'dispensaireId']
            },
            {
              model: Dispensaire,
              as: 'dispensaire',
              attributes: ['id', 'name']
            },
            {
              model: CategorieMaladie,
              as: 'categories',
              through: { attributes: ['isPrincipal'] },
              attributes: ['id', 'nom', 'code']
            }
          ]
        });

        // Count unique patients (consultants) and consultations by zone
        const consultantsByZone = [];
        const zoneStats = {};

        dispensaires.forEach(disp => {
          zoneStats[disp.id] = {
            consultants: new Set(),
            consultations: 0
          };
        });

        consultations.forEach(consult => {
          const zoneId = consult.dispensaireId;
          if (zoneStats[zoneId]) {
            zoneStats[zoneId].consultants.add(consult.patientId);
            zoneStats[zoneId].consultations++;
          }
        });

        let totalConsultants = 0;
        let totalConsultations = 0;

        dispensaires.forEach(disp => {
          const stats = zoneStats[disp.id];
          const consultantsCount = stats.consultants.size;
          const consultationsCount = stats.consultations;
          
          consultantsByZone.push({
            consultants: consultantsCount,
            consultations: consultationsCount
          });

          totalConsultants += consultantsCount;
          totalConsultations += consultationsCount;
        });

        // Add total
        consultantsByZone.push({
          consultants: totalConsultants,
          consultations: totalConsultations
        });

        // Aggregate diseases by zone
        const diseasesByZone = [];
        const diseaseStats = {};

        consultations.forEach(consult => {
          consult.categories.forEach(cat => {
            const diseaseKey = cat.nom;
            if (!diseaseStats[diseaseKey]) {
              diseaseStats[diseaseKey] = {
                disease: cat.nom,
                zones: Array(zones.length + 1).fill(0),
                isSubcategory: cat.niveau > 1
              };
            }

            const zoneIndex = dispensaires.findIndex(d => d.id === consult.dispensaireId);
            if (zoneIndex !== -1) {
              diseaseStats[diseaseKey].zones[zoneIndex]++;
              diseaseStats[diseaseKey].zones[zones.length]++; // Total
            }
          });
        });

        Object.values(diseaseStats).forEach(disease => {
          diseasesByZone.push(disease);
        });

        const section2 = {
          consultantsByZone,
          diseasesByZone
        };

        // For sections 3-6, we'll use empty data for now
        const section3 = {
          educationByZone: []
        };

        const section4 = {
          maternalHealthByZone: []
        };

        // Get events for Section 5
        const events = await Event.findAll({
          where: {
            isActive: true,
            date: {
              [Op.between]: [startDate, endDate]
            }
          },
          include: [
            {
              model: Dispensaire,
              as: 'dispensaire',
              attributes: ['name']
            }
          ],
          order: [['date', 'ASC']]
        });

        const eventsByZone = [];
        const zoneEvents = {};

        events.forEach(event => {
          const zoneName = event.dispensaire ? event.dispensaire.name : 'Autre';
          if (!zoneEvents[zoneName]) {
            zoneEvents[zoneName] = [];
          }

          zoneEvents[zoneName].push({
            theme: event.type_event,
            participants: event.nombreParticipants,
            location: event.lieu || zoneName,
            date: new Date(event.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          });
        });

        Object.entries(zoneEvents).forEach(([zone, events]) => {
          eventsByZone.push({ zone, events });
        });

        const section5 = {
          eventsByZone
        };

        const section6 = {
          newsByZone: []
        };

        // Prepare data for PDF generation
        const pdfData = {
          zones,
          period: {
            quarter,
            year,
            startDate: startDate.toLocaleDateString('fr-FR'),
            endDate: endDate.toLocaleDateString('fr-FR')
          },
          section1,
          section2,
          section3,
          section4,
          section5,
          section6
        };

        // Generate PDF
        const result = await generateTatitraPDF(pdfData, { quarter, year });

        // Generate download URL
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:4000';
        const url = `${baseUrl}/download/${result.fileName}`;

        return {
          success: true,
          message: `Rapport Tatitra Q${quarter} ${year} généré avec succès`,
          url,
          fileName: result.fileName
        };

      } catch (error) {
        console.error('Error exporting Tatitra report:', error);
        throw new Error(`Failed to export Tatitra report: ${error.message}`);
      }
    }
  }
};

export default reportsResolvers;
