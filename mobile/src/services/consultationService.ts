import {gql} from '@apollo/client';
import {apolloClient} from './apollo';
import {Consultation} from '../types';

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
