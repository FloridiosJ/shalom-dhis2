import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {TextInput, Button, Text, HelperText} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
          {/* Logo/Icon at top */}
          <View style={styles.iconContainer}>
            <Icon name="plus-thick" size={32} color="#FFFFFF" />
          </View>

          {/* Title */}
          <Text variant="headlineMedium" style={styles.title}>
            Connexion
          </Text>

          {/* Identifiant Field */}
          <Text style={styles.fieldLabel}>Identifiant</Text>
          <TextInput
            placeholder="Entrez votre identifiant"
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
            left={<TextInput.Icon icon="account-outline" />}
            outlineColor="#E0E0E0"
            activeOutlineColor="#2196F3"
          />
          {errors.username ? (
            <HelperText type="error" visible={!!errors.username}>
              {errors.username}
            </HelperText>
          ) : null}

          {/* Mot de passe Field */}
          <Text style={styles.fieldLabel}>Mot de passe</Text>
          <TextInput
            placeholder="Entrez votre mot de passe"
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
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineColor="#E0E0E0"
            activeOutlineColor="#2196F3"
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

          {/* Se connecter Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#2196F3"
            labelStyle={styles.buttonLabel}>
            Se connecter
          </Button>

          {/* Mot de passe oublié link */}
          <TouchableOpacity onPress={() => Alert.alert('Information', 'Fonctionnalité à venir')}>
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Footer text */}
          <Text style={styles.footerText}>Compte agent uniquement</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
    fontSize: 24,
    color: '#212121',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 4,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 32,
  },
  generalError: {
    marginTop: 8,
  },
});
