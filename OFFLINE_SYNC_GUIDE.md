# Guide de Synchronisation Offline

Ce guide explique comment utiliser les fonctionnalités de synchronisation offline et de géolocalisation dans l'application mobile Shalom DHIS2.

## Table des matières

- [Architecture](#architecture)
- [API Backend](#api-backend)
- [Hooks Mobile](#hooks-mobile)
- [Composants UI](#composants-ui)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Gestion des erreurs](#gestion-des-erreurs)

## Architecture

Le système de synchronisation offline utilise une architecture client-serveur avec les composants suivants :

### Backend (GraphQL)

- **Mutation `syncBatch`** : Accepte un tableau d'objets à synchroniser
- **Query `metricsByRange`** : Retourne les métriques pour une période donnée
- **Query `dashboard`** : Retourne les statistiques du mois calendaire en cours

### Mobile (React Native)

- **Hook `useLocalSync`** : Gère le stockage local et la synchronisation
- **Hook `useGeolocation`** : Capture la géolocalisation avec permissions
- **AsyncStorage** : Stockage persistant des données offline

## API Backend

### Mutation syncBatch

Synchronise un lot d'items en une seule requête.

**GraphQL Schema:**

```graphql
mutation SyncBatch($items: [SyncItemInput!]!) {
  syncBatch(items: $items) {
    results {
      clientTempId
      serverId
      status
      message
      error
    }
    successCount
    errorCount
    message
  }
}

input SyncItemInput {
  clientTempId: String!
  type: String!
  payload: String!
  createdAt: String!
}
```

**Exemple d'utilisation:**

```javascript
const { data } = await apolloClient.mutate({
  mutation: SYNC_BATCH_MUTATION,
  variables: {
    items: [
      {
        clientTempId: 'temp-uuid-123',
        type: 'patient',
        payload: JSON.stringify({
          nom: 'Rakoto',
          prenom: 'Jean',
          sexe: 'M',
          religion: 'Kristianina',
          village: 'Antananarivo',
          dateNaissance: '1990-01-15',
          location: {
            lat: -18.8792,
            lon: 47.5079,
            accuracy: 10,
            timestamp: '2025-01-15T10:30:00Z'
          }
        }),
        createdAt: '2025-01-15T10:00:00Z'
      }
    ]
  }
});

console.log(data.syncBatch.results);
// [{
//   clientTempId: 'temp-uuid-123',
//   serverId: 'server-uuid-456',
//   status: 'success',
//   message: 'Patient created: PAT-2501234'
// }]
```

### Query metricsByRange

Récupère les métriques pour une période spécifique.

**GraphQL Schema:**

```graphql
query MetricsByRange($start: String!, $end: String!, $dispensaireId: ID) {
  metricsByRange(start: $start, end: $end, dispensaireId: $dispensaireId) {
    consultationsCount
    patientsCount
    pendingSyncCount
    startDate
    endDate
  }
}
```

**Exemple d'utilisation:**

```javascript
const { data } = await apolloClient.query({
  query: GET_METRICS_BY_RANGE,
  variables: {
    start: '2025-01-01',
    end: '2025-01-31'
  }
});

console.log(data.metricsByRange);
// {
//   consultationsCount: 42,
//   patientsCount: 15,
//   pendingSyncCount: 0,
//   startDate: '2025-01-01T00:00:00.000Z',
//   endDate: '2025-01-31T23:59:59.999Z'
// }
```

### Query dashboard

Récupère les statistiques du mois calendaire en cours (du 1er au jour actuel).

**GraphQL Schema:**

```graphql
query Dashboard($dispensaireId: ID) {
  dashboard(dispensaireId: $dispensaireId) {
    totalPatients
    totalConsultations
    consultationsToday
    consultationsThisMonth
    newPatientsThisMonth
    upcomingEvents {
      id
      type_event
      date
    }
    recentConsultations {
      id
      diagnostic
      dateConsultation
      patient {
        nom
        prenom
      }
    }
  }
}
```

## Hooks Mobile

### useLocalSync

Gère le stockage local et la synchronisation des données offline.

**API:**

```typescript
interface UseLocalSyncReturn {
  pendingCount: number;
  syncQueue: SyncItem[];
  syncStatus: SyncStatus | null;
  isSyncing: boolean;
  enqueue: (type: 'patient' | 'consultation', payload: any) => Promise<string>;
  syncNow: () => Promise<void>;
  getPendingItems: () => Promise<SyncItem[]>;
  clearSyncedItems: () => Promise<void>;
  retryItem: (clientTempId: string) => Promise<void>;
}
```

**Exemple d'utilisation:**

```typescript
import { useLocalSync } from '../hooks/useLocalSync';

function MyComponent() {
  const { enqueue, syncNow, pendingCount, isSyncing } = useLocalSync();

  const handleCreatePatientOffline = async (patientData) => {
    // Enqueue for later sync
    const tempId = await enqueue('patient', patientData);
    console.log(`Patient enqueued with ID: ${tempId}`);
  };

  const handleSyncNow = async () => {
    await syncNow();
    alert('Synchronisation terminée!');
  };

  return (
    <View>
      <Text>Items en attente: {pendingCount}</Text>
      <Button onPress={handleSyncNow} loading={isSyncing}>
        Synchroniser maintenant
      </Button>
    </View>
  );
}
```

### useGeolocation

Capture la géolocalisation avec gestion des permissions.

**API:**

```typescript
interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: Error | null;
  permissionGranted: boolean;
  requestLocation: () => Promise<Location | null>;
  requestPermission: () => Promise<boolean>;
}

interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
}
```

**Exemple d'utilisation:**

```typescript
import { useGeolocation } from '../hooks/useGeolocation';

function PatientFormScreen() {
  const { location, requestLocation, permissionGranted } = useGeolocation();
  const [patientData, setPatientData] = useState({});

  const handleCaptureLocation = async () => {
    const loc = await requestLocation();
    if (loc) {
      setPatientData({ ...patientData, location: loc });
    }
  };

  const handleSubmit = async () => {
    // Include location in patient data
    const dataWithLocation = {
      ...patientData,
      location: location
    };
    
    await createPatient(dataWithLocation);
  };

  return (
    <View>
      <Button onPress={handleCaptureLocation}>
        Capturer la position
      </Button>
      {location && (
        <Text>Position: {location.lat}, {location.lon}</Text>
      )}
    </View>
  );
}
```

## Composants UI

### StatCard

Affiche une statistique avec icône et compteur.

```tsx
import { StatCard } from '../components/StatCard';

<StatCard
  icon="clipboard-text"
  label="Consultations"
  count={42}
  subtitle="Ce mois"
  iconColor="#2196F3"
  iconBackground="#E3F2FD"
  onPress={() => navigate('Consultations')}
/>
```

### SyncIndicator

Affiche le statut de synchronisation.

```tsx
import { SyncIndicator } from '../components/SyncIndicator';

<SyncIndicator
  pendingCount={5}
  isSyncing={false}
  lastSyncAt="2025-01-15T10:30:00Z"
  lastSyncStatus="success"
  onSyncPress={handleSync}
/>
```

### LocationBadge

Affiche le statut de géolocalisation.

```tsx
import { LocationBadge } from '../components/LocationBadge';

<LocationBadge
  location={{ lat: -18.8792, lon: 47.5079, accuracy: 10 }}
  showCoordinates={true}
  onPress={handleRecapture}
/>
```

## Exemples d'utilisation

### Scénario 1: Création de patient offline

```typescript
import { useLocalSync } from '../hooks/useLocalSync';
import { useGeolocation } from '../hooks/useGeolocation';

function CreatePatientScreen() {
  const { enqueue } = useLocalSync();
  const { requestLocation } = useGeolocation();

  const handleSubmit = async (formData) => {
    try {
      // Capture location
      const location = await requestLocation();

      // Prepare patient data
      const patientData = {
        ...formData,
        location: location,
        dispensaireId: user.dispensaireId
      };

      // Enqueue for sync
      const tempId = await enqueue('patient', patientData);
      
      Alert.alert(
        'Patient enregistré',
        'Le patient sera synchronisé lors de la prochaine connexion.'
      );
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <PatientForm onSubmit={handleSubmit} />
  );
}
```

### Scénario 2: Synchronisation automatique au démarrage

```typescript
import { useEffect } from 'react';
import { useLocalSync } from '../hooks/useLocalSync';
import NetInfo from '@react-native-community/netinfo';

function App() {
  const { syncNow, pendingCount } = useLocalSync();

  useEffect(() => {
    // Auto-sync when app starts and has network
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && pendingCount > 0) {
        syncNow();
      }
    });

    return () => unsubscribe();
  }, [syncNow, pendingCount]);

  return <Navigation />;
}
```

### Scénario 3: Affichage des métriques du mois

```typescript
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useLocalSync } from '../hooks/useLocalSync';

function HomeScreen() {
  const { stats, loading } = useDashboardStats();
  const { pendingCount } = useLocalSync();

  // Calculate total including pending items
  const totalConsultations = stats.consultationsCount + 
    syncQueue.filter(item => item.type === 'consultation').length;

  return (
    <View>
      <StatCard
        label="Consultations ce mois"
        count={totalConsultations}
        subtitle={pendingCount > 0 ? `(incl. ${pendingCount} en attente)` : undefined}
      />
    </View>
  );
}
```

## Gestion des erreurs

### Retry automatique avec backoff

```typescript
async function syncWithRetry(maxRetries = 3) {
  const { syncNow } = useLocalSync();
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await syncNow();
      return; // Success
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // Last retry failed
      }
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Gestion des erreurs de permission

```typescript
const { requestPermission, permissionGranted } = useGeolocation();

if (!permissionGranted) {
  Alert.alert(
    'Permission requise',
    'L\'application a besoin d\'accéder à votre position pour enregistrer la géolocalisation.',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Autoriser', onPress: () => requestPermission() }
    ]
  );
}
```

## Notes techniques

### Idempotence

Le backend utilise `clientTempId` pour garantir l'idempotence. Si un item est synchronisé plusieurs fois, le serveur détecte le doublon et retourne le même `serverId`.

### Stockage local

Les données sont stockées dans AsyncStorage avec les clés suivantes:
- `@shalom:syncQueue` : Queue de synchronisation
- `@shalom:syncStatus` : Statut de la dernière synchronisation

### Performance

- La synchronisation est effectuée par lot (batch) pour réduire le nombre de requêtes
- Les items réussis sont conservés temporairement pour permettre le mapping client → serveur
- Un nettoyage périodique supprime les items synchronisés avec succès

## Support

Pour toute question ou problème, consultez la documentation complète dans le README principal ou contactez l'équipe de développement.
