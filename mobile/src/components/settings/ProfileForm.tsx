import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import {useForm, Controller, SubmitHandler, Resolver} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {User} from '../../types';

export interface ProfileFormData {
  nom: string;
  prenom: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileFormProps {
  user: User | null;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading?: boolean;
}

// Validation schema with explicit type
const profileSchema: yup.ObjectSchema<ProfileFormData> = yup.object({
  nom: yup.string().required('Le nom est requis').default(''),
  prenom: yup.string().required('Le prénom est requis').default(''),
  currentPassword: yup.string().defined().default(''),
  newPassword: yup
    .string()
    .defined()
    .default('')
    .test(
      'min-length-if-provided',
      'Le nouveau mot de passe doit contenir au moins 8 caractères',
      (value) => !value || value.length >= 8,
    ),
  confirmPassword: yup
    .string()
    .defined()
    .default('')
    .oneOf([yup.ref('newPassword')], 'Les mots de passe ne correspondent pas'),
});

/**
 * ProfileForm component with editable profile fields and password change
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  loading = false,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isDirty, isValid},
    reset,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema) as Resolver<ProfileFormData>,
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        nom: user.nom || '',
        prenom: user.prenom || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const handleFormSubmit: SubmitHandler<ProfileFormData> = useCallback(
    async (data) => {
      await onSubmit(data);
    },
    [onSubmit],
  );

  const toggleCurrentPassword = useCallback(() => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPassword = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const isButtonDisabled = loading || !isDirty || !isValid;

  return (
    <View style={styles.container}>
      {/* Nom Field */}
      <View style={styles.fieldContainer}>
        <Text variant="labelSmall" style={styles.label}>
          Nom
        </Text>
        <Controller
          control={control}
          name="nom"
          render={({field: {onChange, onBlur, value}}) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.nom && styles.inputError]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Entrez votre nom"
                placeholderTextColor="#9E9E9E"
                accessibilityLabel="Nom"
                accessibilityHint="Entrez votre nom de famille"
                editable={!loading}
              />
            </View>
          )}
        />
        {errors.nom && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.nom.message}
          </Text>
        )}
      </View>

      {/* Prénom Field */}
      <View style={styles.fieldContainer}>
        <Text variant="labelSmall" style={styles.label}>
          Prénom
        </Text>
        <Controller
          control={control}
          name="prenom"
          render={({field: {onChange, onBlur, value}}) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, errors.prenom && styles.inputError]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Entrez votre prénom"
                placeholderTextColor="#9E9E9E"
                accessibilityLabel="Prénom"
                accessibilityHint="Entrez votre prénom"
                editable={!loading}
              />
            </View>
          )}
        />
        {errors.prenom && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.prenom.message}
          </Text>
        )}
      </View>

      {/* Current Password Field */}
      <View style={styles.fieldContainer}>
        <Text variant="labelSmall" style={styles.label}>
          Mot de passe courant
        </Text>
        <Controller
          control={control}
          name="currentPassword"
          render={({field: {onChange, onBlur, value}}) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.currentPassword && styles.inputError,
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showCurrentPassword}
                accessibilityLabel="Mot de passe courant"
                accessibilityHint="Entrez votre mot de passe actuel"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={toggleCurrentPassword}
                accessibilityLabel={
                  showCurrentPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                accessibilityRole="button">
                <Icon
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#757575"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.currentPassword && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.currentPassword.message}
          </Text>
        )}
      </View>

      {/* New Password Field */}
      <View style={styles.fieldContainer}>
        <Text variant="labelSmall" style={styles.label}>
          Nouveau mot de passe
        </Text>
        <Controller
          control={control}
          name="newPassword"
          render={({field: {onChange, onBlur, value}}) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.newPassword && styles.inputError,
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showNewPassword}
                accessibilityLabel="Nouveau mot de passe"
                accessibilityHint="Entrez votre nouveau mot de passe (minimum 8 caractères)"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={toggleNewPassword}
                accessibilityLabel={
                  showNewPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                accessibilityRole="button">
                <Icon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#757575"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.newPassword && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.newPassword.message}
          </Text>
        )}
      </View>

      {/* Confirm Password Field */}
      <View style={styles.fieldContainer}>
        <Text variant="labelSmall" style={styles.label}>
          Confirmer le mot de passe
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({field: {onChange, onBlur, value}}) => (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="••••••••"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showConfirmPassword}
                accessibilityLabel="Confirmer le mot de passe"
                accessibilityHint="Confirmez votre nouveau mot de passe"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={toggleConfirmPassword}
                accessibilityLabel={
                  showConfirmPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                accessibilityRole="button">
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#757575"
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text variant="bodySmall" style={styles.errorText}>
            {errors.confirmPassword.message}
          </Text>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isButtonDisabled && styles.submitButtonDisabled]}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isButtonDisabled}
        accessibilityLabel="Enregistrer les modifications"
        accessibilityRole="button"
        accessibilityState={{disabled: isButtonDisabled}}>
        <Text
          variant="bodyLarge"
          style={[
            styles.submitButtonText,
            isButtonDisabled && styles.submitButtonTextDisabled,
          ]}>
          Enregistrer les modifications
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#616161',
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    minHeight: 52,
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: '#D32F2F',
    borderWidth: 1.5,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 56,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonTextDisabled: {
    color: '#FFFFFF',
  },
});
