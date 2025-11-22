import {gql} from '@apollo/client';
import {apolloClient} from './apollo';
import {Consultation} from '../types';
import {PrescriptionItem} from '../constants/medications';

// GraphQL mutation to create a new consultation (DataEntry)
const CREATE_DATA_ENTRY = gql`
  mutation CreateDataEntry($input: CreateDataEntryInput!) {
    createDataEntry(input: $input) {
      success
      message
      dataEntry {
        id
        dateConsultation
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
        typeConsultation
        patient {
          id
          displayName
        }
      }
    }
  }
`;

// GraphQL query to fetch consultations (DataEntries)
const GET_CONSULTATIONS = gql`
  query GetConsultations(
    $filter: DataEntryFilterInput
    $pagination: PaginationInput
    $sort: SortInput
  ) {
    dataEntries(filter: $filter, pagination: $pagination, sort: $sort) {
      dataEntries {
        id
        dateConsultation
        diagnostic
        prescription
        notes
        status
        typeConsultation
        patient {
          id
          displayName
          nom
          prenom
          sexe
          age
          numeroPatient
          village
        }
      }
      totalCount
      hasNextPage
      hasPreviousPage
    }
  }
`;

interface GetConsultationsVariables {
  filter?: {
    status?: string;
    search?: string;
    dispensaireId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  pagination?: {
    page?: number;
    limit?: number;
    offset?: number;
  };
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
}

interface GetConsultationsResponse {
  dataEntries: {
    dataEntries: Consultation[];
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function fetchConsultations(
  variables: GetConsultationsVariables = {},
): Promise<GetConsultationsResponse['dataEntries']> {
  try {
    const {data} = await apolloClient.query<
      GetConsultationsResponse,
      GetConsultationsVariables
    >({
      query: GET_CONSULTATIONS,
      variables: {
        ...variables,
        sort: variables.sort || {
          field: 'dateConsultation',
          direction: 'DESC',
        },
      },
      fetchPolicy: 'network-only',
    });

    return data.dataEntries;
  } catch (error) {
    console.error('Error fetching consultations:', error);
    throw error;
  }
}

// Interface for creating a consultation
export interface CreateConsultationInput {
  patientId: string;
  typeConsultation: string;
  dateConsultation: Date;
  heureConsultation: Date;
  categoriesMaladie: string; // Format: "mainCode:subCode" or "mainCode"
  prescriptionsStructurees?: PrescriptionItem[] | string; // Can be array or JSON string
  notes?: string;
  dispensaireId?: string;
}

interface CreateDataEntryResponse {
  createDataEntry: {
    success: boolean;
    message: string;
    dataEntry: Consultation;
  };
}

/**
 * Create a new consultation (DataEntry)
 * @param input - Consultation form data
 * @returns Created consultation data
 */
export async function createConsultation(
  input: CreateConsultationInput,
): Promise<Consultation> {
  try {
    // Parse categoriesMaladie to extract category IDs
    const categorieIds: string[] = [];
    if (input.categoriesMaladie) {
      const [mainCode, subCode] = input.categoriesMaladie.split(':');
      if (mainCode) categorieIds.push(mainCode);
      if (subCode) categorieIds.push(subCode);
    }

    // Combine date and time into a single datetime
    const consultationDateTime = new Date(input.dateConsultation);
    consultationDateTime.setHours(
      input.heureConsultation.getHours(),
      input.heureConsultation.getMinutes(),
      0,
      0,
    );

    // Prepare prescription items for GraphQL
    // prescriptionsStructurees can be:
    // - An array (PrescriptionItem[])
    // - A JSON string (from validation transform)
    // - undefined/null
    // - An empty string
    let prescriptionItems = [];
    
    if (input.prescriptionsStructurees) {
      if (typeof input.prescriptionsStructurees === 'string') {
        // It's a JSON string, parse it
        try {
          const parsed = JSON.parse(input.prescriptionsStructurees);
          prescriptionItems = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Error parsing prescriptionsStructurees:', e);
          prescriptionItems = [];
        }
      } else if (Array.isArray(input.prescriptionsStructurees)) {
        // It's already an array
        prescriptionItems = input.prescriptionsStructurees;
      }
    }
    
    // Map to GraphQL format
    const prescriptionItemsFormatted = prescriptionItems.map((item, index) => ({
      medicament: item.medicament,
      dose: item.dose || '',
      frequence: item.frequence || '',
      duree: item.duree || '',
      notes: item.notes || '',
      ordre: index,
    }));

    // Call GraphQL mutation
    const {data} = await apolloClient.mutate<CreateDataEntryResponse>({
      mutation: CREATE_DATA_ENTRY,
      variables: {
        input: {
          patientId: input.patientId,
          typeConsultation: input.typeConsultation,
          dateConsultation: consultationDateTime.toISOString(),
          categorieIds,
          prescriptionItems: prescriptionItemsFormatted,
          diagnostic: '', // Required field - will be filled by backend or set default
          notes: input.notes || '',
          dispensaireId: input.dispensaireId,
        },
      },
    });

    if (!data?.createDataEntry.success) {
      throw new Error(
        data?.createDataEntry.message || 'Failed to create consultation',
      );
    }

    return data.createDataEntry.dataEntry;
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
}
