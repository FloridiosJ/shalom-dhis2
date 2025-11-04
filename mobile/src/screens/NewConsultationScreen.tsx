import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  AccessibilityRole,
} from 'react-native';
import {Text, Button, ActivityIndicator} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {consultationValidationSchema} from '../utils/consultationValidation';
import {ConsultationFormData, PatientOption} from '../types/consultation';
import PatientPicker from '../components/form/PatientPicker';
import DateTimeField from '../components/form/DateTimeField';
import TextInputField from '../components/form/TextInputField';
import AttachmentField from '../components/form/AttachmentField';

const DRAFT_STORAGE_KEY = '@consultation_draft';

interface NewConsultationScreenProps {
  navigation: any;
}

export default function NewConsultationScreen({
  navigation,
}: NewConsultationScreenProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

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
      diagnostic: '',
      prescriptions: '',
      notes: '',
      attachments: [],
    },
  });

  // Load draft on mount
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
      if (data.patientId || data.diagnostic) {
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
    // TODO: Replace with actual API call
    setLoadingPatients(true);
    try {
      // Mock data for now
      const mockPatients: PatientOption[] = [
        {
          id: '1',
          displayName: 'Jean Dupont',
          numeroPatient: 'PAT-001',
        },
        {
          id: '2',
          displayName: 'Marie Martin',
          numeroPatient: 'PAT-002',
        },
        {
          id: '3',
          displayName: 'Pierre Bernard',
          numeroPatient: 'PAT-003',
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

  const timeoutRef = React.useRef<NodeJS.Timeout>();

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

  const handleSaveDraft = async (data: ConsultationFormData) => {
    setSaving(true);
    try {
      await saveDraft(data);
      Alert.alert('Succès', 'Le brouillon a été enregistré avec succès');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (data: ConsultationFormData) => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call to send consultation
      console.log('Sending consultation:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear draft after successful send
      await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsDraft(false);

      Alert.alert('Succès', 'La consultation a été envoyée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Nouvelle Consultation</Text>
          {isDraft && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Sauvegardé</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Patient Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient</Text>
          <Controller
            control={control}
            name="patientId"
            render={({field: {onChange, value}}) => (
              <PatientPicker
                value={value}
                onChange={onChange}
                onCreatePatient={handleCreatePatient}
                error={errors.patientId?.message}
                patients={filteredPatients}
                onSearchPatients={handleSearchPatients}
                loading={loadingPatients}
              />
            )}
          />
        </View>

        {/* Date and Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date et Heure</Text>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeCol}>
              <Controller
                control={control}
                name="dateConsultation"
                render={({field: {onChange, value}}) => (
                  <DateTimeField
                    label="Date de la consultation"
                    value={value}
                    onChange={onChange}
                    mode="date"
                    error={errors.dateConsultation?.message}
                    maximumDate={new Date()}
                    required
                  />
                )}
              />
            </View>
            <View style={styles.dateTimeCol}>
              <Controller
                control={control}
                name="heureConsultation"
                render={({field: {onChange, value}}) => (
                  <DateTimeField
                    label="Heure"
                    value={value}
                    onChange={onChange}
                    mode="time"
                    error={errors.heureConsultation?.message}
                    required
                  />
                )}
              />
            </View>
          </View>
        </View>

        {/* Clinical Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Cliniques</Text>
          <Controller
            control={control}
            name="diagnostic"
            render={({field: {onChange, value}}) => (
              <TextInputField
                label="Diagnostic"
                value={value}
                onChange={onChange}
                placeholder="ex: Paludisme simple"
                error={errors.diagnostic?.message}
                required
              />
            )}
          />
          <Controller
            control={control}
            name="prescriptions"
            render={({field: {onChange, value}}) => (
              <TextInputField
                label="Prescriptions"
                value={value}
                onChange={onChange}
                placeholder="ex: Paracétamol 500mg, 3 fois par jour..."
                multiline
                numberOfLines={4}
                error={errors.prescriptions?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({field: {onChange, value}}) => (
              <TextInputField
                label="Notes"
                value={value}
                onChange={onChange}
                placeholder="Ajouter des commentaires..."
                multiline
                numberOfLines={4}
                error={errors.notes?.message}
              />
            )}
          />
        </View>

        {/* Attachments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pièces Jointes</Text>
          <Controller
            control={control}
            name="attachments"
            render={({field: {onChange, value}}) => (
              <AttachmentField value={value} onChange={onChange} />
            )}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <Button
          mode="outlined"
          onPress={handleSubmit(handleSaveDraft)}
          style={styles.draftButton}
          labelStyle={styles.draftButtonLabel}
          disabled={saving}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Enregistrer brouillon"
          compact>
          Enregistrer
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(handleSend)}
          style={styles.sendButton}
          disabled={!isValid || saving}
          icon="send"
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Envoyer la consultation">
          {saving ? <ActivityIndicator color="#FFFFFF" /> : 'Envoyer'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeCol: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    gap: 12,
  },
  draftButton: {
    flex: 1,
    borderColor: '#2196F3',
    minHeight: 48,
  },
  draftButtonLabel: {
    fontSize: 14,
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    minHeight: 48,
  },
});
