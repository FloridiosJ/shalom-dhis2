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
    query StatsByPeriod($startDate: String!, $endDate: String!, $dispensaireId: ID) {
      consultationStats(
        startDate: $startDate
        endDate: $endDate
        dispensaireId: $dispensaireId
      ) {
        total
        thisMonth
        thisWeek
        today
        avgPerDay
        topCategories {
          categorie {
            id
            nom
            code
          }
          nombreConsultations
          pourcentage
        }
        consultationsByDay {
          date
          count
        }
        consultationsByType {
          type
          count
          pourcentage
        }
      }
    }
  `;
  
  const variables = { 
    startDate, 
    endDate,
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
 * Exporte les données en PDF/Excel
 */
async function exportReport(format, filters) {
  const query = `
    mutation ExportReport($format: String!, $filters: ReportFiltersInput!) {
      exportReport(format: $format, filters: $filters) {
        success
        message
        url
        fileName
      }
    }
  `;
  
  const variables = { format, filters };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).exportReport;
}

export default {
  getGlobalStats,
  getStatsByPeriod,
  getTopDiagnostics,
  getConsultationsEvolution,
  getStatsByDispensaire,
  exportReport
};