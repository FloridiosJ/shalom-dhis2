# 🎨 Exemples d'Intégration du Logo Shalom

Ce document fournit des exemples pratiques d'intégration du logo Shalom dans différentes parties de l'application mobile.

## 📱 Exemples de Code

### 1. Logo dans l'écran de connexion (LoginScreen)

```tsx
import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {TextInput, Button, Text} from 'react-native-paper';
import {AppLogo} from '../components/AppLogo';

export default function LoginScreen({onLoginSuccess}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Logo en haut de l'écran */}
      <View style={styles.logoContainer}>
        <AppLogo 
          width={180} 
          height={180} 
          showText={true} 
          variant="full" 
        />
      </View>

      <Text variant="headlineMedium" style={styles.title}>
        Connexion
      </Text>

      <TextInput
        label="Identifiant"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={onLoginSuccess}>
        Se connecter
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#2E7D32',
  },
  input: {
    marginBottom: 15,
  },
});
```

### 2. Logo dans le header de navigation

```tsx
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {View} from 'react-native';
import {AppLogo} from '../components/AppLogo';

const Stack = createStackNavigator();

function LogoTitle() {
  return (
    <View style={{flex: 1, alignItems: 'center'}}>
      <AppLogo 
        width={100} 
        height={40} 
        showText={true} 
        variant="full" 
      />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerTitle: () => <LogoTitle />,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />
      {/* autres écrans */}
    </Stack.Navigator>
  );
}
```

### 3. Icône dans un Tab Navigator

```tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AppLogo} from '../components/AppLogo';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#999999',
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <AppLogo 
              width={size} 
              height={size} 
              variant="mark" 
            />
          ),
        }}
      />
      {/* autres onglets */}
    </Tab.Navigator>
  );
}
```

### 4. Logo dans un écran de chargement

```tsx
import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';
import {AppLogo} from '../components/AppLogo';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <AppLogo 
        width={200} 
        height={200} 
        showText={true} 
        variant="full" 
      />
      
      <ActivityIndicator 
        size="large" 
        color="#2E7D32" 
        style={styles.spinner} 
      />
      
      <Text style={styles.text}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  spinner: {
    marginTop: 30,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#666666',
  },
});
```

### 5. Badge département dans un header

```tsx
import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {Text} from 'react-native-paper';

interface DepartmentHeaderProps {
  department: 'general' | 'maternity' | 'pediatrics';
}

export function DepartmentHeader({department}: DepartmentHeaderProps) {
  const getBadgePath = () => {
    const badges = {
      general: require('../../assets/branding/badges/badge-general.svg'),
      maternity: require('../../assets/branding/badges/badge-maternity.svg'),
      pediatrics: require('../../assets/branding/badges/badge-pediatrics.svg'),
    };
    return badges[department];
  };

  return (
    <View style={styles.container}>
      <Image 
        source={getBadgePath()} 
        style={styles.badge}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  badge: {
    width: '100%',
    height: 80,
  },
});
```

### 6. Logo version monochrome pour impression

```tsx
import React from 'react';
import {View} from 'react-native';
import {AppLogo} from '../components/AppLogo';

export function PrintHeader() {
  return (
    <View>
      {/* Version monochrome pour impressions */}
      <AppLogo 
        width={150} 
        height={150} 
        showText={true} 
        variant="mono" 
      />
    </View>
  );
}
```

### 7. Logo animé au démarrage

```tsx
import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {AppLogo} from '../components/AppLogo';

export default function SplashAnimation({onFinish}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(onFinish, 1500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        }}>
        <AppLogo 
          width={250} 
          height={250} 
          showText={true} 
          variant="full" 
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
```

## 🎨 Variantes du Logo

### Props disponibles

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 200 | Largeur du logo en pixels |
| `height` | number | 200 | Hauteur du logo en pixels |
| `showText` | boolean | true | Afficher ou non le texte "SHALOM" |
| `variant` | string | 'full' | Variante: 'full', 'mark', ou 'mono' |

### Exemples de variantes

```tsx
// Logo complet avec texte (coloré)
<AppLogo width={200} height={200} showText={true} variant="full" />

// Icône seule (mark)
<AppLogo width={64} height={64} variant="mark" />

// Version monochrome avec texte
<AppLogo width={180} height={180} showText={true} variant="mono" />

// Mark monochrome
<AppLogo width={48} height={48} variant="mark" />
```

## ♿ Accessibilité

Toujours fournir un label accessible:

```tsx
<View accessible={true} accessibilityLabel="Logo Shalom DHIS2">
  <AppLogo width={150} height={150} />
</View>
```

Ou directement sur le composant si vous l'étendez:

```tsx
<AppLogo 
  width={150} 
  height={150}
  accessible={true}
  accessibilityLabel="Logo Shalom DHIS2 - Système de gestion de santé"
  accessibilityRole="image"
/>
```

## 🎯 Best Practices

### Tailles recommandées

- **Header principal**: 120-180px de largeur
- **Tab bar icon**: 24-32px
- **Login screen**: 180-250px
- **Splash screen**: 200-300px
- **Favicon**: 48px (utiliser variant="mark")

### Quand utiliser quelle variante

- **`variant="full"`**: Écrans principaux, headers, login
- **`variant="mark"`**: Icons, favicons, petits espaces
- **`variant="mono"`**: Impressions, exports PDF, documentation

### Couleurs de fond recommandées

```tsx
// Sur fond blanc (recommandé)
<View style={{backgroundColor: '#FFFFFF'}}>
  <AppLogo variant="full" />
</View>

// Sur fond clair
<View style={{backgroundColor: '#F5F5F5'}}>
  <AppLogo variant="full" />
</View>

// Sur fond foncé - utiliser version monochrome inversée
<View style={{backgroundColor: '#333333'}}>
  <AppLogo variant="mono" />
</View>
```

## 📖 Documentation Complète

Pour plus d'informations:
- [Guide du logo](../assets/branding/LOGO_GUIDELINES.md)
- [Composant AppLogo](src/components/AppLogo.tsx)
