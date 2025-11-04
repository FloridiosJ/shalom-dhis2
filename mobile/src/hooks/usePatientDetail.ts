import {useState, useEffect, useCallback} from 'react';
import {useQuery} from '@apollo/client';
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

/**
 * Custom hook to fetch and manage patient detail data
 * Handles loading states, errors, and data refresh
 */
export function usePatientDetail(patientId: string | null) {
  const [patient, setPatient] = useState<PatientDetailData['patient'] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const {data, loading, refetch} = useQuery<PatientDetailData>(
    GET_PATIENT_DETAIL,
    {
      variables: {id: patientId},
      skip: !patientId,
      fetchPolicy: 'cache-and-network',
      onError: err => {
        console.error('Error fetching patient detail:', err);
        setError('Erreur lors du chargement des détails du patient');
      },
    },
  );

  useEffect(() => {
    if (data?.patient) {
      setPatient(data.patient);
      setError(null);
    }
  }, [data]);

  const refresh = useCallback(async () => {
    if (patientId) {
      try {
        await refetch();
      } catch (err) {
        console.error('Error refreshing patient detail:', err);
        setError('Erreur lors du rafraîchissement des données');
      }
    }
  }, [patientId, refetch]);

  return {
    patient,
    loading,
    error,
    refresh,
  };
}
