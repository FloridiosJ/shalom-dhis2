import {useState, useEffect, useCallback, useRef} from 'react';
import {useForm, Control, FieldErrors, UseFormHandleSubmit, UseFormWatch, UseFormReset} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {consultationValidationSchema} from '../utils/consultationValidation';
import {ConsultationFormData, PatientOption, CategorieMaladie, Dispensaire} from '../types/consultation';

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
  categories: CategorieMaladie[];
  loadingCategories: boolean;
  dispensaires: Dispensaire[];
  loadingDispensaires: boolean;
  isAgent: boolean;
  userDispensaire?: Dispensaire;
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
  const [categories, setCategories] = useState<CategorieMaladie[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [dispensaires, setDispensaires] = useState<Dispensaire[]>([]);
  const [loadingDispensaires, setLoadingDispensaires] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [userDispensaire, setUserDispensaire] = useState<Dispensaire | undefined>(undefined);

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
      dispensaireId: undefined,
      typeConsultation: '',
      categories: [],
      prescriptionItems: [],
      notes: '',
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  // Load draft and patients on mount
  useEffect(() => {
    const init = async () => {
      await loadDraft();
      await loadPatients();
      await loadCategories();
      await loadDispensaires();
      await loadUserInfo();
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
      // TODO: Replace with actual API call
      const mockPatients: PatientOption[] = [
        {
          id: '1',
          displayName: 'Jean Dupont',
          numeroPatient: 'PAT-001',
          sexe: 'M',
        },
        {
          id: '2',
          displayName: 'Marie Martin',
          numeroPatient: 'PAT-002',
          sexe: 'F',
        },
        {
          id: '3',
          displayName: 'Pierre Bernard',
          numeroPatient: 'PAT-003',
          sexe: 'M',
        },
      ];
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      // TODO: Replace with actual API call
      const mockCategories: CategorieMaladie[] = [
        {id: '1', nom: 'Maladies infectieuses', code: 'INF'},
        {id: '2', nom: 'Maladies respiratoires', code: 'RESP'},
        {id: '3', nom: 'Maladies cardiovasculaires', code: 'CARDIO'},
        {id: '4', nom: 'Maladies digestives', code: 'DIGES'},
        {id: '5', nom: 'Paludisme', code: 'PAL'},
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadDispensaires = async () => {
    setLoadingDispensaires(true);
    try {
      // TODO: Replace with actual API call
      const mockDispensaires: Dispensaire[] = [
        {id: '1', name: 'Dispensaire Centre', code: 'DISP-01'},
        {id: '2', name: 'Dispensaire Nord', code: 'DISP-02'},
        {id: '3', name: 'Dispensaire Sud', code: 'DISP-03'},
      ];
      setDispensaires(mockDispensaires);
    } catch (error) {
      console.error('Error loading dispensaires:', error);
    } finally {
      setLoadingDispensaires(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      // TODO: Replace with actual auth call
      const mockIsAgent = false; // Change to true to test agent mode
      const mockUserDispensaire: Dispensaire | undefined = mockIsAgent
        ? {id: '1', name: 'Dispensaire Centre', code: 'DISP-01'}
        : undefined;
      
      setIsAgent(mockIsAgent);
      setUserDispensaire(mockUserDispensaire);
    } catch (error) {
      console.error('Error loading user info:', error);
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
      // Combine date and time for consultation
      let dateConsultationISO: string;
      const date = data.dateConsultation instanceof Date 
        ? data.dateConsultation 
        : new Date(data.dateConsultation);
      
      if (data.heureConsultation) {
        const time = data.heureConsultation instanceof Date
          ? data.heureConsultation
          : new Date(data.heureConsultation);
        date.setHours(time.getHours(), time.getMinutes(), 0, 0);
      }
      dateConsultationISO = date.toISOString();

      // Generate diagnostic from principal category
      const principalCategory = data.categories.find(c => c.isPrincipal);
      let diagnosticText = principalCategory ? principalCategory.nom || '' : '';
      if (data.diagnosticDetails?.trim()) {
        diagnosticText += ` (${data.diagnosticDetails.trim()})`;
      }

      const payload = {
        dateConsultation: dateConsultationISO,
        patientId: data.patientId,
        dispensaireId: isAgent && userDispensaire 
          ? userDispensaire.id 
          : data.dispensaireId,
        typeConsultation: data.typeConsultation,
        diagnostic: diagnosticText,
        notes: data.notes || '',
        categories: data.categories.map(c => ({
          categorieMaladieId: c.categorieMaladieId,
          isPrincipal: c.isPrincipal,
          notes: c.notes || '',
        })),
        prescriptionItems: data.prescriptionItems
          .filter(item => item.medicament.trim())
          .map((item, index) => ({
            medicament: item.medicament.trim(),
            dose: item.dose?.trim() || null,
            frequence: item.frequence?.trim() || null,
            duree: item.duree?.trim() || null,
            notes: item.notes?.trim() || null,
            ordre: index,
          })),
      };

      console.log('📤 Saving consultation:', payload);

      // TODO: Replace with actual API call to save consultation
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear draft after successful save
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsDraft(false);

      Alert.alert('Succès', 'La consultation a été enregistrée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
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
    categories,
    loadingCategories,
    dispensaires,
    loadingDispensaires,
    isAgent,
    userDispensaire,
    handleSearchPatients,
    handleCreatePatient,
    handleSave,
  };
}
