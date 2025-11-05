import {useState, useEffect, useCallback} from 'react';
import {useQuery} from '@apollo/client/react';
import {GET_PATIENT_DETAIL} from '../services/patientService';
import {Patient, Consultation} from '../types';

interface PatientDetailData {
  patient: Patient & {
    consultations?: Consultation[];
    dateNaissance?: string;
    lieuNaissance?: string;
    religion?: string;
  };
}

export function usePatientDetail(patientId: string | null) {
  console.log('🔍 usePatientDetail called with patientId:', patientId);
  
  const [patient, setPatient] = useState<PatientDetailData['patient'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Capturer TOUTES les erreurs Apollo
  const {data, loading, error: apolloError, refetch} = useQuery<PatientDetailData>(
    GET_PATIENT_DETAIL,
    {
      variables: {id: patientId},
      skip: !patientId,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
  );

  console.log('📊 Apollo Query State:', {
    data: data,
    loading: loading,
    apolloError: apolloError,
    patientId: patientId
  });

  // ✅ FIX: Gérer correctement les erreurs
  useEffect(() => {
    if (apolloError) {
      console.error('❌ Apollo Error Details:', {
        message: apolloError.message,
        graphQLErrors: apolloError.graphQLErrors,
        networkError: apolloError.networkError,
        extraInfo: apolloError.extraInfo
      });
      
      // ✅ Gérer les erreurs spécifiques
      if (apolloError.networkError) {
        const networkError = apolloError.networkError as any;
        
        if (networkError.statusCode === 400) {
          setError('Erreur de requête GraphQL (400). Vérifiez la structure de la query.');
        } else if (networkError.statusCode === 404) {
          setError('Endpoint GraphQL non trouvé (404)');
        } else if (networkError.statusCode === 500) {
          setError('Erreur serveur interne (500)');
        } else {
          setError(`Erreur réseau: ${networkError.message || 'Connexion impossible'}`);
        }
      } else if (apolloError.graphQLErrors?.length > 0) {
        setError(apolloError.graphQLErrors.map(e => e.message).join(', '));
      } else {
        setError(apolloError.message || 'Erreur Apollo inconnue');
      }
      
      setPatient(null);
    } else {
      setError(null);
    }
  }, [apolloError]);

  // ✅ Gérer les données
  useEffect(() => {
    console.log('📦 Data effect triggered:', data);
    
    if (data?.patient) {
      console.log('✅ Setting patient data:', data.patient);
      setPatient(data.patient);
      setError(null);
    } else if (!loading && !apolloError && data !== undefined) {
      console.warn('⚠️ Patient not found in response');
      setError('Patient introuvable');
      setPatient(null);
    }
  }, [data, loading, apolloError]);

  const refresh = useCallback(async () => {
    if (!patientId) {
      console.warn('⚠️ Cannot refresh: patientId is null');
      return;
    }
    
    console.log('🔄 Refreshing patient data for ID:', patientId);
    
    try {
      setError(null);
      const result = await refetch();
      console.log('✅ Refetch result:', result);
    } catch (err: any) {
      console.error('❌ Error refreshing patient detail:', err);
      setError(err.message || 'Erreur lors du rafraîchissement des données');
    }
  }, [patientId, refetch]);

  const result = {
    patient,
    loading,
    error,
    refresh,
  };

  console.log('📤 usePatientDetail returning:', result);

  return result;
}
