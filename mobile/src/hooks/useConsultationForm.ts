import {useState, useEffect, useCallback, useRef} from 'react';
import {useForm, Control, FieldErrors, UseFormHandleSubmit, UseFormWatch, UseFormReset} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {consultationValidationSchema} from '../utils/consultationValidation';
import {ConsultationFormData, PatientOption} from '../types/consultation';
import {fetchPatients} from '../services/patientService';
import {useOfflineConsultation} from './useOfflineConsultation';

const DRAFT_STORAGE_KEY = '@consultation_draft';

interface NavigationProp {
  goBack: () => void;
}

interface UseConsultationFormReturn {
  control: Control<ConsultationFormData>;
  handleSubmit: UseFormHandleSubmit<ConsultationFormData>;
  errors: FieldErrors<ConsultationFormData>;
  isValid: boolean;
  watch: UseFormWatch<ConsultationFormData>;
  reset: UseFormReset<ConsultationFormData>;
  patients: PatientOption[];
  filteredPatients: PatientOption[];
  loadingPatients: boolean;
  saving: boolean;
  isDraft: boolean;
  handleSearchPatients: (query: string) => void;
  handleCreatePatient: () => void;
  handleSave: (data: ConsultationFormData) => Promise<void>;
}

/**
 * Custom hook for managing consultation form state and logic
 * Handles form validation, draft saving, patient management, and submission
 */
export function useConsultationForm(
  navigation: NavigationProp,
): UseConsultationFormReturn {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Use offline consultation hook
  const {createConsultation} = useOfflineConsultation();

  const {
    control,
    handleSubmit,
    formState: {errors, isValid},
    watch,
    reset,
  } = useForm<ConsultationFormData>({
    resolver: yupResolver(consultationValidationSchema),
    mode: 'onChange',
    defaultValues: {
      patientId: null,
      dateConsultation: new Date(),
      heureConsultation: new Date(),
      typeConsultation: '',
      categoriesMaladie: '',
      prescriptionsStructurees: [],
      notes: '',
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  // Load draft and patients on mount
  useEffect(() => {
    const init = async () => {
      await loadDraft();
      await loadPatients();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft
  useEffect(() => {
    const subscription = watch(data => {
      if (data.patientId || data.typeConsultation) {
        saveDraftDebounced(data as ConsultationFormData);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const loadDraft = async () => {
    try {
      const draftJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftJson) {
        const draft = JSON.parse(draftJson);
        setIsDraft(true);
        reset({
          ...draft.formData,
          dateConsultation: new Date(draft.formData.dateConsultation),
          heureConsultation: new Date(draft.formData.heureConsultation),
        });
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      // Fetch patients filtered by agent's dispensaire
      // Using a reasonable limit to avoid performance issues
      const result = await fetchPatients({
        pagination: {
          limit: 100, // Reasonable limit for dropdown performance
        },
      });
      
      // Transform to PatientOption format
      const patientOptions: PatientOption[] = result.patients.map(p => ({
        id: p.id,
        displayName: p.displayName,
        numeroPatient: p.numeroPatient,
      }));
      
      setPatients(patientOptions);
      setFilteredPatients(patientOptions);
    } catch (error) {
      console.error('Error loading patients:', error);
      // Show error to user but don't prevent form usage
      Alert.alert(
        'Erreur',
        'Impossible de charger la liste des patients. Veuillez vérifier votre connexion.',
        [{text: 'OK'}],
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  const saveDraftDebounced = useCallback((data: ConsultationFormData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      saveDraft(data);
    }, 1000);
  }, []);

  const saveDraft = async (data: ConsultationFormData) => {
    try {
      const draft = {
        formData: data,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setIsDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleSave = async (data: ConsultationFormData) => {
    setSaving(true);
    try {
      // Validate that patientId is not null
      if (!data.patientId) {
        throw new Error('Patient ID is required');
      }

      // Call the API with offline support
      const result = await createConsultation({
        patientId: data.patientId,
        typeConsultation: data.typeConsultation,
        dateConsultation: data.dateConsultation,
        heureConsultation: data.heureConsultation,
        categoriesMaladie: data.categoriesMaladie,
        prescriptionsStructurees: data.prescriptionsStructurees,
        notes: data.notes,
      });

      // Clear draft after successful save
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsDraft(false);

      // Show appropriate message based on offline/online status
      if (result.offline) {
        Alert.alert(
          'Enregistré hors ligne',
          'La consultation a été enregistrée localement et sera synchronisée dès que la connexion sera rétablie.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Succès', 'La consultation a été enregistrée avec succès', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error saving consultation:', err);
      
      // Provide specific error messages based on error type
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Une erreur s'est produite lors de l'enregistrement";
      
      Alert.alert(
        'Erreur',
        errorMessage,
        [
          {
            text: 'Réessayer',
            onPress: () => handleSave(data),
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSearchPatients = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredPatients(patients);
        return;
      }
      const filtered = patients.filter(
        p =>
          p.displayName.toLowerCase().includes(query.toLowerCase()) ||
          p.numeroPatient.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredPatients(filtered);
    },
    [patients],
  );

  const handleCreatePatient = useCallback(() => {
    // TODO: Navigate to patient creation screen
    Alert.alert(
      'Création de patient',
      'Cette fonctionnalité sera disponible prochainement',
    );
  }, []);

  return {
    control,
    handleSubmit,
    errors,
    isValid,
    watch,
    reset,
    patients,
    filteredPatients,
    loadingPatients,
    saving,
    isDraft,
    handleSearchPatients,
    handleCreatePatient,
    handleSave,
  };
}
