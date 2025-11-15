import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  AccessibilityRole,
} from 'react-native';
import {Text, Button, ActivityIndicator} from 'react-native-paper';
import {Controller} from 'react-hook-form';
import {useConsultationForm} from '../hooks/useConsultationForm';
import PatientPicker from '../components/form/PatientPicker';
import DatePickerBlue from '../components/consultation/form/DatePickerBlue';
import TimePickerBlue from '../components/consultation/form/TimePickerBlue';
import TypeConsultationPicker from '../components/form/TypeConsultationPicker';
import CategorySelector from '../components/form/CategorySelector';
import PrescriptionList from '../components/form/PrescriptionList';
import DispensaireSelector from '../components/form/DispensaireSelector';
import ConsultationInput from '../components/consultation/form/ConsultationInput';
import {styles} from '../styles/NewConsultationScreen.styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface NewConsultationScreenProps {
  navigation: any;
}

export default function NewConsultationScreen({
  navigation,
}: NewConsultationScreenProps) {
  const {
    control,
    handleSubmit,
    errors,
    isValid,
    filteredPatients,
    loadingPatients,
    saving,
    categories,
    loadingCategories,
    dispensaires,
    loadingDispensaires,
    isAgent,
    userDispensaire,
    patients,
    handleSearchPatients,
    handleCreatePatient,
    handleSave,
  } = useConsultationForm(navigation);

  // Get selected patient for gender-based filtering
  const patientId = control._formValues.patientId;
  const selectedPatient = patients.find(p => p.id === patientId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
        {/* Patient Picker */}
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

        {/* Time and Date Section */}
        <View style={styles.dateTimeContainer}>
          {/* Time (Heure) */}
          <View style={styles.dateTimeRow}>
            <Controller
              control={control}
              name="heureConsultation"
              render={({field: {onChange, value}}) => (
                <TimePickerBlue
                  label="Heure"
                  value={value}
                  onChange={onChange}
                  error={errors.heureConsultation?.message}
                />
              )}
            />
          </View>

          {/* Date */}
          <View style={styles.dateTimeRow}>
            <Controller
              control={control}
              name="dateConsultation"
              render={({field: {onChange, value}}) => (
                <DatePickerBlue
                  label="Date de la consultation"
                  value={value}
                  onChange={onChange}
                  error={errors.dateConsultation?.message}
                  maximumDate={new Date()}
                  required
                />
              )}
            />
          </View>
        </View>

        {/* Dispensaire (if not agent) */}
        {!isAgent && (
          <Controller
            control={control}
            name="dispensaireId"
            render={({field: {onChange, value}}) => (
              <DispensaireSelector
                dispensaires={dispensaires}
                value={value}
                onChange={onChange}
                error={errors.dispensaireId?.message}
              />
            )}
          />
        )}

        {/* Info message for agents */}
        {isAgent && userDispensaire && (
          <View style={styles.infoBox}>
            <Icon name="information" size={20} color="#0284c7" />
            <Text style={styles.infoText}>
              La consultation sera automatiquement assignée à votre dispensaire :{' '}
              <Text style={styles.infoTextBold}>{userDispensaire.name}</Text>
            </Text>
          </View>
        )}

        {/* Type consultation */}
        <Controller
          control={control}
          name="typeConsultation"
          render={({field: {onChange, value}}) => (
            <TypeConsultationPicker
              value={value}
              onChange={onChange}
              error={errors.typeConsultation?.message}
              patientSexe={selectedPatient?.sexe}
            />
          )}
        />

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Controller
            control={control}
            name="categories"
            render={({field: {onChange, value}}) => (
              <CategorySelector
                categories={categories}
                selectedCategories={value}
                onChange={onChange}
                error={errors.categories?.message}
              />
            )}
          />
        </View>

        {/* Prescriptions structurées */}
        <View style={styles.prescriptionsSection}>
          <Controller
            control={control}
            name="prescriptionItems"
            render={({field: {onChange, value}}) => (
              <PrescriptionList
                items={value}
                onChange={onChange}
              />
            )}
          />
        </View>

        {/* Notes */}
        <Controller
          control={control}
          name="notes"
          render={({field: {onChange, value}}) => (
            <ConsultationInput
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
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionBar}>
        <Button
          mode="contained"
          onPress={handleSubmit(handleSave)}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          disabled={!isValid || saving}
          accessibilityRole={'button' as AccessibilityRole}
          accessibilityLabel="Enregistrer la consultation">
          {saving ? <ActivityIndicator color="#FFFFFF" /> : 'Enregistrer'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

