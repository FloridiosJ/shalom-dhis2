import axios from "axios";

const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleGraphQLErrors(response) {
  if (response.data.errors) {
    throw new Error(response.data.errors[0].message || 'Erreur GraphQL');
  }
  return response.data.data;
}

/**
 * Récupère les statistiques globales
 */
async function getGlobalStats() {
  const query = `
    query GlobalStats {
      reports {
        totalConsultations
        totalDispensaires
        totalPatients
        totalUsers
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).reports;
}

/**
 * Récupère les statistiques par période avec filtres
 */
async function getStatsByPeriod(startDate, endDate, dispensaireId = null) {
  const query = `
    query StatsByPeriod($dispensaireId: ID) {
      consultationStats(
        dispensaireId: $dispensaireId
      ) {
        total
        thisMonth
        thisWeek
        today
        averagePerDay
        topCategories {
          categorie {
            id
            nom
            code
          }
          nombreConsultations
          pourcentage
        }
        byType {
          typeConsultation
          count
        }
      }
    }
  `;
  
  const variables = { 
    ...(dispensaireId && dispensaireId !== 'all' && { dispensaireId })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultationStats;
}

/**
 * Récupère le top des diagnostics
 */
async function getTopDiagnostics(limit = 10, dispensaireId = null, startDate = null, endDate = null) {
  const query = `
    query TopDiagnostics($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
      topDiagnostics(
        limit: $limit
        dispensaireId: $dispensaireId
        startDate: $startDate
        endDate: $endDate
      ) {
        diagnostic
        count
        percentage
      }
    }
  `;
  
  const variables = { 
    limit,
    ...(dispensaireId && dispensaireId !== 'all' && { dispensaireId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).topDiagnostics;
}

/**
 * Récupère le top des médicaments prescrits
 */
async function getTopMedications(limit = 10, dispensaireId = null, startDate = null, endDate = null) {
  const query = `
    query TopMedications($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
      topMedications(
        limit: $limit
        dispensaireId: $dispensaireId
        startDate: $startDate
        endDate: $endDate
      ) {
        medicament
        count
        avgDuree
        totalDuree
      }
    }
  `;
  
  const variables = { 
    limit,
    ...(dispensaireId && dispensaireId !== 'all' && { dispensaireId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).topMedications;
}

/**
 * Récupère l'évolution des consultations
 */
async function getConsultationsEvolution(period = 'month', dispensaireId = null, startDate = null, endDate = null) {
  const query = `
    query ConsultationsEvolution($period: String!, $dispensaireId: ID, $startDate: String, $endDate: String) {
      consultationsEvolution(
        period: $period
        dispensaireId: $dispensaireId
        startDate: $startDate
        endDate: $endDate
      ) {
        period
        count
        date
      }
    }
  `;
  
  const variables = { 
    period,
    ...(dispensaireId && dispensaireId !== 'all' && { dispensaireId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultationsEvolution;
}

/**
 * Récupère les statistiques par dispensaire
 */
async function getStatsByDispensaire(dispensaireId, startDate = null, endDate = null) {
  const query = `
    query StatsByDispensaire($dispensaireId: ID!, $startDate: String, $endDate: String) {
      dispensaireStats(
        dispensaireId: $dispensaireId
        startDate: $startDate
        endDate: $endDate
      ) {
        dispensaire {
          id
          name
        }
        totalConsultations
        totalPatients
        consultationsByType {
          type
          count
          pourcentage
        }
        topCategories {
          categorie {
            nom
            code
          }
          nombreConsultations
        }
      }
    }
  `;
  
  const variables = { 
    dispensaireId,
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).dispensaireStats;
}

/**
 * Export Tatitra quarterly report in PDF format
 */
async function exportTatitraReport(quarter, year, dispensaireId = null) {
  const mutation = `
    mutation ExportTatitraReport($quarter: String!, $year: Int!, $dispensaireId: ID) {
      exportTatitraReport(
        quarter: $quarter
        year: $year
        dispensaireId: $dispensaireId
      ) {
        success
        message
        url
        fileName
      }
    }
  `;
  
  const variables = { 
    quarter,
    year,
    ...(dispensaireId && { dispensaireId })
  };
  
  const response = await client.post('', { query: mutation, variables });
  return handleGraphQLErrors(response).exportTatitraReport;
}

/**
 * Récupère les statistiques Fitoriana (section "MAHAKASIKA NY ASA FITORIANA")
 * Agrégation par tranche d'âge, genre (lahy/vavy) et dispensaire
 */
async function getFitorianaStats(dateFrom, dateTo, dispensaireIds = null, religions = null) {
  const query = `
    query FitorianaStats($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!], $religions: [Religion!]) {
      fitorianaStats(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
        religions: $religions
      ) {
        dateFrom
        dateTo
        totalConsultations
        rows {
          label
          ageGroup
          valuesByDispensaire {
            dispensaireName
            values {
              lahy
              vavy
            }
          }
          fitambarany {
            lahy
            vavy
          }
        }
      }
    }
  `;
  
  const variables = { 
    dateFrom,
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds }),
    ...(religions && religions.length > 0 && { religions })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).fitorianaStats;
}

/**
 * Récupère les consultants (patients uniques) et consultations par dispensaire/zone
 * pour une période donnée, utile pour les rapports Tatitra et visualisations
 */
async function getConsultantsByZone(dateFrom, dateTo, dispensaireIds = null) {
  const query = `
    query ConsultantsByZone($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!]) {
      consultantsByZone(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
      ) {
        dispensaire {
          id
          name
        }
        consultants
        consultations
      }
    }
  `;
  
  const variables = { 
    dateFrom,
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultantsByZone;
}

/**
 * Récupère les diagnostics agrégés par dispensaire/zone pour une période donnée.
 * Retourne une table croisée diagnostic x dispensaire pour les rapports Tatitra.
 * 
 * @param {string} dateFrom - Date de début (format ISO YYYY-MM-DD)
 * @param {string} dateTo - Date de fin (format ISO YYYY-MM-DD)
 * @param {Array<string>} dispensaireIds - Optionnel: filtrer par dispensaires spécifiques
 * @param {number} limit - Optionnel: limiter le nombre de diagnostics retournés
 * @returns {Promise<Array<{diagnostic: string, dispensaires: Array<{id, name, count}>, total: number}>>}
 */
async function getDiagnosticsByZone(dateFrom, dateTo, dispensaireIds = null, limit = null) {
  const query = `
    query DiagnosticsByZone($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!], $limit: Int) {
      diagnosticsByZone(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
        limit: $limit
      ) {
        diagnostic
        dispensaires {
          id
          name
          count
        }
        total
      }
    }
  `;
  
  const variables = { 
    dateFrom,
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds }),
    ...(limit && { limit })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).diagnosticsByZone;
}

/**
 * Récupère les statistiques d'éducation par zone pour le Tatitra Section III
 * @param {string} dateFrom - Date de début (format ISO YYYY-MM-DD)
 * @param {string} dateTo - Date de fin (format ISO YYYY-MM-DD)
 * @param {Array<string>} dispensaireIds - Optionnel: filtrer par dispensaires spécifiques
 * @returns {Promise<Array<{category: string, zones: Array<{id, name, male, female}>, totalMale: number, totalFemale: number}>>}
 */
async function getEducationByZone(dateFrom, dateTo, dispensaireIds = null) {
  const query = `
    query EducationByZone($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!]) {
      educationByZone(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
      ) {
        category
        zones {
          id
          name
          male
          female
        }
        totalMale
        totalFemale
      }
    }
  `;
  
  const variables = { 
    dateFrom,
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).educationByZone;
}

/**
 * Récupère les statistiques de santé maternelle par zone pour le Tatitra Section IV
 * @param {string} dateFrom - Date de début (format ISO YYYY-MM-DD)
 * @param {string} dateTo - Date de fin (format ISO YYYY-MM-DD)
 * @param {Array<string>} dispensaireIds - Optionnel: filtrer par dispensaires spécifiques
 * @returns {Promise<Array<{indicator: string, dispensaires: Array<{id, name, count}>, total: number}>>}
 */
async function getMaternalHealthByZone(dateFrom, dateTo, dispensaireIds = null) {
  const query = `
    query MaternalHealthByZone($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!]) {
      maternalHealthByZone(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
      ) {
        indicator
        dispensaires {
          id
          name
          count
        }
        total
      }
    }
  `;
  
  const variables = { 
    dateFrom,
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).maternalHealthByZone;
}

export default {
  getGlobalStats,
  getStatsByPeriod,
  getTopDiagnostics,
  getTopMedications,
  getConsultationsEvolution,
  getStatsByDispensaire,
  exportTatitraReport,
  getFitorianaStats,
  getConsultantsByZone,
  getDiagnosticsByZone,
  getEducationByZone,
  getMaternalHealthByZone
};