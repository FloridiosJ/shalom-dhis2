import axios from "axios";

const API_URL = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

// Maximum number of consultations to fetch at once for client-side pagination
// If your database has more than this, consider implementing server-side pagination
const MAX_CONSULTATION_LIMIT = 10000;

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

const entryFields = `
  id
  dateConsultation
  dateOnly
  timeConsultation
  typeConsultation
  diagnostic
  prescription
  prescriptionItems {
    id
    medicament
    dose
    frequence
    duree
    notes
    ordre
  }
  notes
  status
  dispensaire { id name }
  patient { id nom prenom numeroPatient displayName }
  typeConsultationDetails { code libelle }
  categoriesWithMeta {
    id
    nom
    code
    isPrincipal
    notes
  }
`;

// 1. Liste des consultations
async function getAll() {
  const query = `
    query DataEntries($pagination: PaginationInput) {
      dataEntries(pagination: $pagination) {
        dataEntries {
          ${entryFields}
        }
        totalCount
        hasNextPage
        hasPreviousPage
      }
    }
  `;
  // Fetch all data with a high limit for client-side pagination/filtering
  const variables = { 
    pagination: { 
      limit: MAX_CONSULTATION_LIMIT,
      offset: 0
    } 
  };
  const response = await client.post('', { query, variables });
  const data = handleGraphQLErrors(response).dataEntries;
  
  // Return just the array for backward compatibility, but log if we're at the limit
  if (data.dataEntries.length >= MAX_CONSULTATION_LIMIT) {
    console.warn(`⚠️ Fetched ${MAX_CONSULTATION_LIMIT} consultations (the maximum). Some data may not be visible. Consider implementing server-side pagination.`);
  }
  
  return data.dataEntries;
}

// 2. Création consultation
async function create(input) {
  const mutation = `
    mutation CreateDataEntry($input: CreateDataEntryInput!) {
      createDataEntry(input: $input) {
        success
        message
        errors
        dataEntry { ${entryFields} }
      }
    }
  `;
  const variables = { input };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).createDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || res.message || "Erreur création");
  return res.dataEntry;
}

// 3. Mise à jour consultation
async function update(id, input) {
  // ✅ CORRECTION : Adapter le payload pour UpdateDataEntryInput
  // Le backend n'accepte pas patientId et dispensaireId en update
  const updatePayload = {
    typeConsultation: input.typeConsultation,
    diagnostic: input.diagnostic,
    prescription: input.prescription,
    notes: input.notes,
    dateConsultation: input.dateConsultation,
    status: input.status,
    // Ne pas inclure: patientId, dispensaireId (non modifiables)
  };

  // Supprimer les champs undefined
  Object.keys(updatePayload).forEach(key => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  const mutation = `
    mutation UpdateDataEntry($id: ID!, $input: UpdateDataEntryInput!) {
      updateDataEntry(id: $id, input: $input) {
        success
        message
        errors
        dataEntry { ${entryFields} }
      }
    }
  `;
  const variables = { id, input: updatePayload };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).updateDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || res.message || "Erreur modification");
  return res.dataEntry;
}

// 4. Suppression consultation
async function remove(id) {
  const mutation = `
    mutation DeleteDataEntry($id: ID!) {
      deleteDataEntry(id: $id) {
        success
        message
        errors
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query: mutation, variables });
  const res = handleGraphQLErrors(response).deleteDataEntry;
  if (!res.success) throw new Error(res.errors?.join(', ') || res.message || "Erreur suppression");
  return res;
}

// 5. Récupérer une consultation par ID
async function getById(id) {
  const query = `
    query DataEntry($id: ID!) {
      dataEntry(id: $id) {
        ${entryFields}
      }
    }
  `;
  const variables = { id };
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).dataEntry;
}

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};