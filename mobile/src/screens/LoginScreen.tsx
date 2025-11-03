import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {TextInput, Button, Text, HelperText} from 'react-native-paper';
import {login} from '../services/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({onLoginSuccess}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors = {
      username: '',
      password: '',
      general: '',
    };

    if (!username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 4) {
      newErrors.password = 'Le mot de passe doit contenir au moins 4 caractères';
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({username: '', password: '', general: ''});

    try {
      await login(username.trim(), password);
      onLoginSuccess();
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.message?.includes('Network') || error.message?.includes('fetch')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      } else if (error.message?.includes('Identifiants invalides') || 
                 error.graphQLErrors?.[0]?.message?.includes('Identifiants invalides')) {
        errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
      }

      setErrors(prev => ({...prev, general: errorMessage}));
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Connexion
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Shalom DHIS2
          </Text>

          <TextInput
            label="Nom d'utilisateur ou email"
            value={username}
            onChangeText={text => {
              setUsername(text);
              setErrors(prev => ({...prev, username: '', general: ''}));
            }}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            error={!!errors.username}
            disabled={loading}
            left={<TextInput.Icon icon="account" />}
          />
          {errors.username ? (
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>
          ) : null}

          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors(prev => ({...prev, password: '', general: ''}));
            }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            error={!!errors.password}
            disabled={loading}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          {errors.password ? (
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
          ) : null}

          {errors.general ? (
            <HelperText type="error" visible={!!errors.general} style={styles.generalError}>
              {errors.general}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}>
            Se connecter
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
  },
  generalError: {
    marginTop: 10,
  },
});
