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
 * Statistiques globales du système
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
 * Statistiques complètes des consultations
 */
async function getConsultationStats(dispensaireId = null, userId = null) {
  const query = `
    query ConsultationStats($dispensaireId: ID, $userId: ID) {
      consultationStats(dispensaireId: $dispensaireId, userId: $userId) {
        total
        thisMonth
        thisWeek
        today
        averagePerDay
        averagePerWeek
        averagePerMonth
        byStatus {
          status
          count
        }
        byType {
          typeConsultation
          typeDetails {
            code
            libelle
            description
          }
          count
        }
        topCategories {
          categorie {
            id
            nom
            code
          }
          nombreConsultations
          pourcentage
        }
        recentConsultations {
          id
          diagnostic
          prescription
          dateConsultation
          status
          typeConsultation
          patient {
            id
            nom
            prenom
            numeroPatient
          }
          createdBy {
            nom
            prenom
          }
        }
      }
    }
  `;
  const variables = { dispensaireId, userId };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultationStats;
}

/**
 * Dashboard complet
 */
async function getDashboard(dispensaireId = null) {
  const query = `
    query Dashboard($dispensaireId: ID) {
      dashboard(dispensaireId: $dispensaireId) {
        totalPatients
        totalConsultations
        consultationsToday
        consultationsThisMonth
        newPatientsThisMonth
        upcomingEvents {
          id
          date
          type_event
          lieu
          nombreParticipants
        }
        recentConsultations {
          id
          diagnostic
          dateConsultation
          patient {
            nom
            prenom
            numeroPatient
          }
          createdBy {
            nom
            prenom
          }
        }
      }
    }
  `;
  const variables = { dispensaireId };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).dashboard;
}

/**
 * Statistiques par période
 */
async function getStatsByPeriod(dateFrom, dateTo, dispensaireId = null) {
  const query = `
    query StatsByPeriod($dateFrom: DateTime, $dateTo: DateTime, $dispensaireId: ID) {
      reportsByPeriod(dateFrom: $dateFrom, dateTo: $dateTo, dispensaireId: $dispensaireId) {
        dateFrom
        dateTo
        consultationsPeriod
        newPatientsPeriod
        consultationsByStatus {
          status
          count
        }
      }
    }
  `;
  const variables = { dateFrom, dateTo, dispensaireId };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).reportsByPeriod;
}

/**
 * Statistiques par type de consultation
 */
async function getStatsByConsultationType(dateFrom = null, dateTo = null, dispensaireId = null) {
  const query = `
    query StatsByConsultationType($dateFrom: DateTime, $dateTo: DateTime, $dispensaireId: ID) {
      reportsByConsultationType(dateFrom: $dateFrom, dateTo: $dateTo, dispensaireId: $dispensaireId) {
        typeConsultation
        typeDetails {
          code
          libelle
          description
        }
        count
      }
    }
  `;
  const variables = { dateFrom, dateTo, dispensaireId };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).reportsByConsultationType;
}

/**
 * Statistiques par dispensaire
 */
async function getStatsByDispensaire(dispensaireId) {
  const query = `
    query StatsByDispensaire($dispensaireId: ID!) {
      reportsByDispensaire(dispensaireId: $dispensaireId) {
        dispensaire {
          id
          name
          fileovana
          synoda
        }
        totalPatients
        totalConsultations
        totalUsers
        activeUsers
      }
    }
  `;
  const variables = { dispensaireId };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).reportsByDispensaire;
}

export default {
  getGlobalStats,
  getConsultationStats,
  getDashboard,
  getStatsByPeriod,
  getStatsByConsultationType,
  getStatsByDispensaire,
};