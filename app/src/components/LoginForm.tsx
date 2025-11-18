import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';

/**
 * Login form data interface
 */
export interface LoginFormData {
  login: string;
  password: string;
}

/**
 * Login form props interface
 */
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
}

/**
 * LoginForm presentational component
 */
export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  error 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      login: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Logo/Icon placeholder */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>+</Text>
            </View>
          </View>

          {/* Title */}
          <Text variant="headlineMedium" style={styles.title}>
            Connexion
          </Text>

          {/* Error message */}
          {error && (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text style={styles.errorText}>{error}</Text>
              </Card.Content>
            </Card>
          )}

          {/* Login input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Identifiant</Text>
            <Controller
              control={control}
              name="login"
              rules={{
                required: 'L\'identifiant est requis',
                minLength: {
                  value: 3,
                  message: 'L\'identifiant doit contenir au moins 3 caractères',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Entrez votre identifiant"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.login}
                    disabled={isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    left={<TextInput.Icon icon="account" />}
                    style={styles.input}
                  />
                  {errors.login && (
                    <HelperText type="error" visible={!!errors.login}>
                      {errors.login.message}
                    </HelperText>
                  )}
                </>
              )}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 4,
                  message: 'Le mot de passe doit contenir au moins 4 caractères',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    mode="outlined"
                    placeholder="Entrez votre mot de passe"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={!!errors.password}
                    disabled={isLoading}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    style={styles.input}
                  />
                  {errors.password && (
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password.message}
                    </HelperText>
                  )}
                </>
              )}
            />
          </View>

          {/* Submit button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>

          {/* Forgot password link */}
          <Button
            mode="text"
            onPress={() => {
              // TODO: Implement forgot password functionality
              console.log('Forgot password clicked');
            }}
            style={styles.forgotButton}
            disabled={isLoading}
          >
            Mot de passe oublié ?
          </Button>

          {/* Footer text */}
          <Text style={styles.footerText}>
            Compte agent uniquement
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: 'bold',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  forgotButton: {
    marginTop: 8,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#999',
    fontSize: 12,
  },
});
