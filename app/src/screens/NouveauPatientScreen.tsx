import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  CREATE_PATIENT_MUTATION,
  CreatePatientInput,
  CreatePatientResponse,
} from '../services/patientService';

interface NouveauPatientScreenProps {
  navigation: NavigationProp<any>;
}

interface PatientFormData {
  prenom: string;
  nom: string;
  dateNaissance: string;
  sexe: 'M' | 'F';
  village: string;
  religion: 'Kristianina' | 'Musulman' | 'traditionnelle';
}

const RELIGIONS = [
  { label: 'Kristianina', value: 'Kristianina' },
  { label: 'Musulman', value: 'Musulman' },
  { label: 'Traditionnelle', value: 'traditionnelle' },
];

export default function NouveauPatientScreen({ navigation }: NouveauPatientScreenProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReligionPicker, setShowReligionPicker] = useState(false);

  const [createPatient] = useMutation<CreatePatientResponse>(CREATE_PATIENT_MUTATION);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    defaultValues: {
      prenom: '',
      nom: '',
      dateNaissance: '',
      sexe: 'M',
      village: '',
      religion: 'Kristianina',
    },
    mode: 'onBlur',
  });

  const selectedSexe = watch('sexe');
  const selectedReligion = watch('religion');
  const dateNaissance = watch('dateNaissance');

  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    // Assume format YYYY-MM-DD, display as DD/MM/YYYY
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const parseDateFromDisplay = (displayDate: string): string => {
    // Parse DD/MM/YYYY to YYYY-MM-DD
    const parts = displayDate.replace(/\//g, '-').split('-');
    if (parts.length === 3 && parts[0].length === 2) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return displayDate;
  };

  const onSubmit = async (data: PatientFormData) => {
    if (!user?.dispensaireId) {
      Alert.alert('Erreur', 'Dispensaire non configuré. Veuillez vous reconnecter.');
      return;
    }

    try {
      setIsSubmitting(true);

      const input: CreatePatientInput = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim() || undefined,
        dateNaissance: data.dateNaissance || undefined,
        sexe: data.sexe,
        religion: data.religion,
        village: data.village.trim(),
        dispensaireId: user.dispensaireId,
      };

      const result = await createPatient({
        variables: { input },
      });

      if (result.data?.createPatient?.patient) {
        Alert.alert(
          'Succès',
          `Le patient ${result.data.createPatient.patient.displayName} a été créé avec succès.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Échec de la création du patient');
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      let errorMessage = 'Une erreur est survenue lors de la création du patient';

      if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDateInput = (text: string, onChange: (value: string) => void) => {
    // Allow only numbers and slashes
    let cleaned = text.replace(/[^0-9/]/g, '');
    
    // Auto-format as DD/MM/YYYY
    if (cleaned.length === 2 && !cleaned.includes('/')) {
      cleaned += '/';
    } else if (cleaned.length === 5 && cleaned.split('/').length === 2) {
      cleaned += '/';
    }
    
    // Limit to 10 characters (DD/MM/YYYY)
    if (cleaned.length <= 10) {
      // Convert display format to storage format (YYYY-MM-DD)
      if (cleaned.length === 10) {
        onChange(parseDateFromDisplay(cleaned));
      } else {
        // Store partial input as-is for display
        onChange(cleaned);
      }
    }
  };

  const getReligionLabel = (value: string): string => {
    const religion = RELIGIONS.find(r => r.value === value);
    return religion?.label || 'Choisir une religion';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Demographic Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Infos démographiques
            </Text>

            {/* Prénom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prénom</Text>
              <Controller
                control={control}
                name="prenom"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    mode="outlined"
                    placeholder="Entrez le prénom"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    disabled={isSubmitting}
                    style={styles.input}
                    outlineStyle={styles.inputOutline}
                    accessibilityLabel="Prénom du patient"
                  />
                )}
              />
            </View>

            {/* Nom */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom</Text>
              <Controller
                control={control}
                name="nom"
                rules={{
                  required: 'Le nom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      mode="outlined"
                      placeholder="Entrez le nom"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.nom}
                      disabled={isSubmitting}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      accessibilityLabel="Nom du patient"
                    />
                    {errors.nom && (
                      <HelperText type="error" visible={!!errors.nom}>
                        {errors.nom.message}
                      </HelperText>
                    )}
                  </>
                )}
              />
            </View>

            {/* Date de naissance */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date de naissance</Text>
              <Controller
                control={control}
                name="dateNaissance"
                rules={{
                  pattern: {
                    value: /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/,
                    message: 'Format de date invalide (JJ/MM/AAAA)',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      mode="outlined"
                      placeholder="JJ/MM/AAAA"
                      value={formatDateForDisplay(value)}
                      onChangeText={(text) => handleDateInput(text, onChange)}
                      keyboardType="numeric"
                      disabled={isSubmitting}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      right={<TextInput.Icon icon="calendar" />}
                      accessibilityLabel="Date de naissance"
                    />
                    {errors.dateNaissance && (
                      <HelperText type="error" visible={!!errors.dateNaissance}>
                        {errors.dateNaissance.message}
                      </HelperText>
                    )}
                  </>
                )}
              />
            </View>

            {/* Sexe - Toggle */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sexe</Text>
              <View style={styles.genderToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedSexe === 'M' && styles.genderButtonActive,
                  ]}
                  onPress={() => setValue('sexe', 'M')}
                  disabled={isSubmitting}
                  accessibilityLabel="Homme"
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedSexe === 'M' }}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      selectedSexe === 'M' && styles.genderButtonTextActive,
                    ]}
                  >
                    Homme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedSexe === 'F' && styles.genderButtonActive,
                  ]}
                  onPress={() => setValue('sexe', 'F')}
                  disabled={isSubmitting}
                  accessibilityLabel="Femme"
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedSexe === 'F' }}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      selectedSexe === 'F' && styles.genderButtonTextActive,
                    ]}
                  >
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Village */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Village</Text>
              <Controller
                control={control}
                name="village"
                rules={{
                  required: 'Le village est requis',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      mode="outlined"
                      placeholder="Entrez le nom du village"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={!!errors.village}
                      disabled={isSubmitting}
                      style={styles.input}
                      outlineStyle={styles.inputOutline}
                      accessibilityLabel="Village du patient"
                    />
                    {errors.village && (
                      <HelperText type="error" visible={!!errors.village}>
                        {errors.village.message}
                      </HelperText>
                    )}
                  </>
                )}
              />
            </View>

            {/* Religion - Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Religion</Text>
              <TouchableOpacity
                style={[
                  styles.dropdownButton,
                  isSubmitting && styles.dropdownButtonDisabled,
                ]}
                onPress={() => setShowReligionPicker(true)}
                disabled={isSubmitting}
                accessibilityLabel="Sélectionner une religion"
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !selectedReligion && styles.dropdownPlaceholder,
                  ]}
                >
                  {getReligionLabel(selectedReligion)}
                </Text>
                <IconButton icon="chevron-down" size={20} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Spacer for bottom buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          disabled={isSubmitting}
          style={styles.cancelButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.cancelButtonLabel}
          accessibilityLabel="Annuler"
        >
          Annuler
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
          buttonColor="#2196F3"
          accessibilityLabel="Enregistrer le patient"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le patient'}
        </Button>
      </View>

      {/* Religion Picker Modal */}
      <Modal
        visible={showReligionPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReligionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une religion</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowReligionPicker(false)}
              />
            </View>
            {RELIGIONS.map((religion) => (
              <TouchableOpacity
                key={religion.value}
                style={[
                  styles.modalOption,
                  selectedReligion === religion.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setValue('religion', religion.value as any);
                  setShowReligionPicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={religion.label}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedReligion === religion.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {religion.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Création du patient...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom buttons
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: '#e0e0e0',
  },
  genderToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    minHeight: 44, // Accessibility: minimum touch target
  },
  genderButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  genderButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingLeft: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  dropdownButtonDisabled: {
    opacity: 0.6,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  bottomSpacer: {
    height: 20,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16, // Safe area
  },
  cancelButton: {
    flex: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
  },
  submitButton: {
    flex: 1.5,
    borderRadius: 24,
  },
  buttonContent: {
    paddingVertical: 6,
    minHeight: 44, // Accessibility: minimum touch target
  },
  cancelButtonLabel: {
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 52, // Accessibility: minimum touch target
  },
  modalOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});
