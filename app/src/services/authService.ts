import { gql } from '@apollo/client';

/**
 * GraphQL mutation for user login
 */
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        nom
        prenom
        email
        login
        role
        specialite
        dispensaireId
        dispensaire {
          id
          name
          fileovana
          synoda
        }
        isActive
        fullName
      }
    }
  }
`;

/**
 * GraphQL query to get current user
 */
export const ME_QUERY = gql`
  query Me {
    me {
      id
      nom
      prenom
      email
      login
      role
      specialite
      dispensaireId
      dispensaire {
        id
        name
        fileovana
        synoda
      }
      isActive
      fullName
    }
  }
`;

/**
 * Type definitions for auth service
 */
export interface LoginInput {
  login: string;
  password: string;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  login: string;
  role: 'admin' | 'manager' | 'agent';
  specialite?: 'sage_femme' | 'infirmier' | 'infirmiere';
  dispensaireId?: string;
  dispensaire?: {
    id: string;
    name: string;
    fileovana: string;
    synoda: string;
  };
  isActive: boolean;
  fullName: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface LoginMutationResult {
  login: AuthPayload;
}

export interface MeQueryResult {
  me: User;
}
