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
    const errorMsg = response.data.errors.map(e => e.message).join(', ');
    throw new Error(errorMsg || 'Erreur GraphQL');
  }
  return response.data.data;
}

/**
 * Statistiques globales
 */
async function getGlobalStats() {
  const query = `
    query GlobalStats {
      reports {
        totalPatients
        totalConsultations
        totalDispensaires
        totalUsers
      }
    }
  `;
  const response = await client.post('', { query });
  return handleGraphQLErrors(response).reports;
}

/**
 * Statistiques par dispensaire
 */
async function getStatsByDispensaire(dispensaireId, startDate, endDate) {
  const query = `
    query StatsByDispensaire($dispensaireId: ID, $startDate: String, $endDate: String) {
      reportsByDispensaire(dispensaireId: $dispensaireId, startDate: $startDate, endDate: $endDate) {
        dispensaire { id name }
        totalConsultations
        totalPatients
        consultationsByType {
          type
          count
        }
        consultationsByMonth {
          month
          count
        }
      }
    }
  `;
  const variables = { dispensaireId, startDate, endDate };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).reportsByDispensaire;
}

/**
 * Statistiques par période
 */
async function getStatsByPeriod(startDate, endDate) {
  const query = `
    query StatsByPeriod($startDate: String!, $endDate: String!) {
      reportsByPeriod(startDate: $startDate, endDate: $endDate) {
        totalConsultations
        totalPatients
        consultationsByType {
          type
          count
        }
        consultationsByDay {
          date
          count
        }
        topDiagnostics {
          diagnostic
          count
        }
      }
    }
  `;
  const variables = { startDate, endDate };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).reportsByPeriod;
}

/**
 * Top diagnostics
 */
async function getTopDiagnostics(limit = 10) {
  const query = `
    query TopDiagnostics($limit: Int) {
      topDiagnostics(limit: $limit) {
        diagnostic
        count
        percentage
      }
    }
  `;
  const variables = { limit };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).topDiagnostics;
}

/**
 * Évolution des consultations
 */
async function getConsultationsEvolution(period = 'month') {
  const query = `
    query ConsultationsEvolution($period: String) {
      consultationsEvolution(period: $period) {
        period
        count
        growth
      }
    }
  `;
  const variables = { period };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultationsEvolution;
}

export default {
  getGlobalStats,
  getStatsByDispensaire,
  getStatsByPeriod,
  getTopDiagnostics,
  getConsultationsEvolution,
};