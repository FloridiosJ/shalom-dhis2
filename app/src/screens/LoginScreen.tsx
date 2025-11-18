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
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';

      if (err instanceof Error) {
        // Handle error messages
        if (err.message.includes('Identifiants invalides') || 
            err.message.includes('Invalid credentials')) {
          errorMessage = 'Identifiant ou mot de passe incorrect';
        } else if (err.message.includes('Network') || 
                   err.message.includes('fetch')) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      
      // Also show an alert for better visibility
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
