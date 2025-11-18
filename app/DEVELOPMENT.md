# Guide de développement rapide

## Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer l'app
npm start

# Lancer directement sur Android (USB)
npm run android

# Nettoyer le cache
npm run clear

# Mode tunnel (problèmes réseau)
npm run tunnel
```

## Structure de développement

### Ajouter un nouvel écran

1. Créer le fichier dans `src/screens/`:

```typescript
// src/screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function NewScreen() {
  return (
    <View>
      <Text>Nouvel écran</Text>
    </View>
  );
}
```

2. Ajouter dans la navigation (`src/navigation/Navigation.tsx`):

```typescript
// Importer
import NewScreen from '../screens/NewScreen';

// Ajouter le type
export type RootStackParamList = {
  Home: undefined;
  Details: undefined;
  NewScreen: undefined; // Nouveau
};

// Ajouter l'écran
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: 'Nouveau' }}
/>
```

3. Naviguer vers l'écran:

```typescript
navigation.navigate('NewScreen');
```

### Utiliser les APIs natives

#### Géolocalisation

```typescript
import * as Location from 'expo-location';

const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === 'granted') {
    const location = await Location.getCurrentPositionAsync({});
    console.log(location.coords);
  }
};
```

#### Sélection d'image

```typescript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      console.log(result.assets[0].uri);
    }
  }
};
```

#### Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Configurer les notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Envoyer une notification locale
const sendNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Titre",
      body: "Message",
    },
    trigger: null, // Immédiat
  });
};
```

#### Stockage sécurisé

```typescript
import * as SecureStore from 'expo-secure-store';

// Sauvegarder
await SecureStore.setItemAsync('token', 'mon-token-secret');

// Récupérer
const token = await SecureStore.getItemAsync('token');

// Supprimer
await SecureStore.deleteItemAsync('token');
```

#### Stockage asynchrone

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder
await AsyncStorage.setItem('key', JSON.stringify(data));

// Récupérer
const value = await AsyncStorage.getItem('key');
const data = JSON.parse(value);

// Supprimer
await AsyncStorage.removeItem('key');
```

### Apollo Client pour GraphQL

```typescript
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';

// Configurer le client (dans App.tsx)
const client = new ApolloClient({
  uri: 'https://your-graphql-endpoint.com/graphql',
  cache: new InMemoryCache(),
});

// Wrapper l'app
<ApolloProvider client={client}>
  <Navigation />
</ApolloProvider>

// Utiliser dans un composant
const GET_DATA = gql`
  query GetData {
    items {
      id
      name
    }
  }
`;

function MyComponent() {
  const { loading, error, data } = useQuery(GET_DATA);
  
  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <FlatList
      data={data.items}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

## Styling avec React Native Paper

```typescript
import { Button, Card, Text, FAB } from 'react-native-paper';

// Bouton
<Button mode="contained" onPress={handlePress}>
  Cliquer
</Button>

// Carte
<Card>
  <Card.Title title="Titre" subtitle="Sous-titre" />
  <Card.Content>
    <Text>Contenu</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>

// FAB (Floating Action Button)
<FAB
  icon="plus"
  style={styles.fab}
  onPress={handlePress}
/>
```

## Debugging

### Logs

```typescript
// Console logs
console.log('Info');
console.warn('Warning');
console.error('Error');

// Afficher un objet
console.log(JSON.stringify(myObject, null, 2));
```

### React Native Debugger

1. Secouer l'appareil
2. Sélectionner "Debug"
3. Ouvrir Chrome DevTools

### Expo DevTools

- URL: http://localhost:19002 (s'ouvre automatiquement)
- Permet de voir les logs, gérer les builds, etc.

## Tests

### Structure de test

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Bonjour!')).toBeTruthy();
  });
  
  it('handles button press', () => {
    const { getByText } = render(<HomeScreen />);
    const button = getByText('Obtenir ma position');
    fireEvent.press(button);
    // Assert expected behavior
  });
});
```

## Performance

### Optimisations communes

```typescript
// Mémoriser composants
const MemoizedComponent = React.memo(MyComponent);

// Mémoriser callbacks
const handlePress = useCallback(() => {
  doSomething();
}, [dependencies]);

// Mémoriser valeurs calculées
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// FlatList optimisée
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemComponent item={item} />}
  windowSize={5}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
/>
```

## Commandes utiles

```bash
# Vérifier le code TypeScript
npx tsc --noEmit

# Lister les packages
npm list --depth=0

# Mettre à jour Expo
npx expo upgrade

# Vérifier les mises à jour
npm outdated

# Build avec EAS
eas build --platform android --profile preview

# Publier une mise à jour OTA
expo publish
```

## Raccourcis Expo CLI

Dans le terminal après `npm start`:

- `a` - Ouvrir sur Android
- `i` - Ouvrir sur iOS
- `w` - Ouvrir dans le navigateur
- `r` - Recharger l'app
- `m` - Basculer le menu
- `c` - Nettoyer et recharger

## Resources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
