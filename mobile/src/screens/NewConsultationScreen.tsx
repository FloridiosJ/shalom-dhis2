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
import PatientPickerBottomSheet from '../components/form/PatientPickerBottomSheet';
import DatePickerBlue from '../components/consultation/form/DatePickerBlue';
import TimePickerBlue from '../components/consultation/form/TimePickerBlue';
import ConsultationInput from '../components/consultation/form/ConsultationInput';
import {styles} from '../styles/NewConsultationScreen.styles';

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
    handleSearchPatients,
    handleCreatePatient,
    handleSave,
  } = useConsultationForm(navigation);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Patient Picker - No label/section title */}
        <Controller
          control={control}
          name="patientId"
          render={({field: {onChange, value}}) => (
            <PatientPickerBottomSheet
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

        {/* Time and Date Section - Two separate lines, no section title */}
        <View style={styles.dateTimeContainer}>
          {/* Line 1: Time (Heure) - Blue label */}
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
                  required
                />
              )}
            />
          </View>

          {/* Line 2: Date - Blue label */}
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

        {/* Clinical Information Section */}
        <View style={styles.clinicalSection}>
          <Text style={styles.clinicalTitle}>Informations Cliniques</Text>

          {/* Type consultation */}
          <Controller
            control={control}
            name="typeConsultation"
            render={({field: {onChange, value}}) => (
              <ConsultationInput
                label="Type consultation"
                value={value}
                onChange={onChange}
                placeholder="ex: Consultation générale"
                error={errors.typeConsultation?.message}
                required
              />
            )}
          />

          {/* Catégories de maladie */}
          <Controller
            control={control}
            name="categoriesMaladie"
            render={({field: {onChange, value}}) => (
              <ConsultationInput
                label="Catégories de maladie"
                value={value}
                onChange={onChange}
                placeholder="ex: Maladies infectieuses"
                error={errors.categoriesMaladie?.message}
                required
              />
            )}
          />

          {/* Prescriptions structurées */}
          <Controller
            control={control}
            name="prescriptionsStructurees"
            render={({field: {onChange, value}}) => (
              <ConsultationInput
                label="Prescriptions structurées"
                value={value}
                onChange={onChange}
                placeholder="ex: Paracétamol 500mg, 3 fois par jour..."
                multiline
                numberOfLines={4}
                error={errors.prescriptionsStructurees?.message}
              />
            )}
          />

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
        </View>
      </ScrollView>

      {/* Single Action Button - Blue "Enregistrer" */}
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

