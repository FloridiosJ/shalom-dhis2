import {gql} from '@apollo/client';
import {apolloClient} from './apollo';
import {Consultation} from '../types';
import {PrescriptionItem} from '../constants/medications';
import {getCategorieByCode, getSubCategorieByCode} from '../constants/categoriesMaladies';

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
    // Parse categoriesMaladie to extract category IDs and generate diagnostic
    const categorieIds: string[] = [];
    let diagnosticText = '';
    
    if (input.categoriesMaladie) {
      const [mainCode, subCode] = input.categoriesMaladie.split(':');
      
      // Add category IDs for backend
      if (mainCode) categorieIds.push(mainCode);
      if (subCode) categorieIds.push(subCode);
      
      // Generate diagnostic text from category names (matching web implementation)
      if (subCode) {
        // If there's a subcategory, use it as the principal diagnostic
        const subCategorie = getSubCategorieByCode(mainCode, subCode);
        if (subCategorie) {
          diagnosticText = subCategorie.nom;
        } else {
          // Fallback to main category if subcategory not found
          const mainCategorie = getCategorieByCode(mainCode);
          diagnosticText = mainCategorie ? mainCategorie.nom : 'Consultation';
        }
      } else {
        // Only main category selected
        const mainCategorie = getCategorieByCode(mainCode);
        diagnosticText = mainCategorie ? mainCategorie.nom : 'Consultation';
      }
    } else {
      // No category selected, use default
      diagnosticText = 'Consultation générale';
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
    // Following web implementation pattern: filter and validate items
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
    
    // Filter out empty items and map to GraphQL format (matching web implementation)
    let prescriptionItemsFormatted = [];
    if (prescriptionItems.length > 0) {
      // Filter items with medicament and clean the data
      const validItems = prescriptionItems.filter(
        item => item && item.medicament && item.medicament.trim()
      );
      
      if (validItems.length > 0) {
        prescriptionItemsFormatted = validItems.map((item, index) => ({
          medicament: item.medicament.trim(),
          dose: item.dose?.trim() || '',
          frequence: item.frequence?.trim() || '',
          duree: item.duree?.trim() || '',
          notes: item.notes?.trim() || '',
          ordre: index,
        }));
      }
    }

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
          diagnostic: diagnosticText, // Generated from category names
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
