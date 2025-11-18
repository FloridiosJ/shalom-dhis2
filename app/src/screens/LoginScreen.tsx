import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { LoginForm, LoginFormData } from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';

/**
 * LoginScreen container component
 * Handles the login logic and connects to AuthContext
 */
export default function LoginScreen() {
  const { login, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission
   */
  const handleLogin = async (data: LoginFormData) => {
    try {
      setError('');
      setIsSubmitting(true);

      await login({
        login: data.login.trim(),
        password: data.password,
      });

      // Navigation will be handled automatically by the AuthContext state change
    } catch (err: unknown) {
      console.error('Login error:', err);
      console.error('Error type:', typeof err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';

      // Handle Apollo/GraphQL errors
      if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string; graphQLErrors?: any[]; networkError?: any };
        
        // Check for specific error messages
        if (error.message.includes('Identifiants invalides') || 
            error.message.includes('Invalid credentials') ||
            error.message.includes('Authentication') ||
            error.message.includes('Non authentifié')) {
          errorMessage = 'Identifiant ou mot de passe incorrect';
        } else if (error.message.includes('Network') || 
                   error.message.includes('fetch') ||
                   error.message.includes('Failed to fetch') ||
                   error.networkError) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
        } else {
          // Use the actual error message from the server
          errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
        }
        
        // Check GraphQL errors array
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          if (gqlError.message) {
            errorMessage = gqlError.message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      
      // Show an alert for better visibility
      Alert.alert(
        'Erreur de connexion',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm
        onSubmit={handleLogin}
        isLoading={authLoading || isSubmitting}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
