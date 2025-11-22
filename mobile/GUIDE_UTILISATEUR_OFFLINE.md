# Guide d'Utilisation: Fonctionnalités Offline et Synchronisation

## Vue d'ensemble

L'application mobile Shalom DHIS2 supporte désormais le mode hors ligne complet, permettant aux agents de terrain de travailler sans connexion internet et de synchroniser leurs données automatiquement lorsque la connexion est rétablie.

## Fonctionnalités

### 1. Mode Hors Ligne Automatique

L'application détecte automatiquement l'état de la connexion réseau et adapte son comportement :

- **En ligne** : Les données sont envoyées immédiatement au serveur
- **Hors ligne** : Les données sont stockées localement et marquées pour synchronisation

### 2. Synchronisation Automatique

La synchronisation se déclenche automatiquement dans les situations suivantes :

- **Reconnexion réseau** : Dès que la connexion internet est rétablie
- **Retour au premier plan** : Quand l'application revient au premier plan avec des données en attente
- **Retry automatique** : En cas d'échec, l'application réessaye avec un délai exponentiel (2s, 4s, 8s)

### 3. Indicateurs Visuels

#### Bannière de Statut Réseau

Une bannière apparaît en haut de l'écran d'accueil pour indiquer :

- **🔴 Mode hors ligne** (bannière orange) : Aucune connexion internet
- **🔵 Données en attente** (bannière bleue) : X éléments à synchroniser

La bannière se cache automatiquement quand vous êtes en ligne sans données en attente.

#### Écran de Synchronisation

Accessible via l'onglet "Sync" dans la navigation :

- **Dernier sync** : Date et heure de la dernière synchronisation réussie
- **File d'envoi** : Nombre d'éléments en attente et erreurs
- **Barre de progression** : Pendant la synchronisation (X/Y éléments)
- **Liste des erreurs** : Détails des échecs avec possibilité de réessayer

## Utilisation

### Création d'une Consultation Hors Ligne

1. Naviguez vers "Nouvelle Consultation"
2. Remplissez le formulaire normalement
3. Appuyez sur "Enregistrer"

**Si vous êtes hors ligne :**
- Message : "Enregistré hors ligne - La consultation sera synchronisée dès que la connexion sera rétablie"
- La consultation est stockée localement de manière sécurisée
- Un indicateur apparaît sur l'écran d'accueil

**Si vous êtes en ligne :**
- Message : "La consultation a été enregistrée avec succès"
- Les données sont immédiatement envoyées au serveur

### Synchronisation Manuelle

Si vous souhaitez synchroniser manuellement :

1. Allez dans l'onglet "Sync" ou "Statut"
2. Appuyez sur le bouton "Synchroniser maintenant"
3. La progression s'affiche en temps réel
4. Un message de succès ou d'erreur apparaît

**Note :** Le bouton est désactivé si :
- Vous êtes hors ligne
- Une synchronisation est déjà en cours
- Il n'y a rien à synchroniser

### Gestion des Erreurs

En cas d'échec de synchronisation :

1. L'erreur apparaît dans la liste des erreurs avec :
   - Type d'élément (patient ou consultation)
   - Description de l'erreur
   - Date/heure
2. Vous pouvez :
   - **Réessayer un élément** : Bouton "Réessayer" sur chaque erreur
   - **Réessayer tout** : Bouton "Tout réessayer" en haut de la liste

### Visualisation des Données en Attente

#### Sur l'Écran d'Accueil

Les statistiques incluent les données en attente de synchronisation :
- **Consultations** : Nombre total incluant celles hors ligne
- **Indicateur de sync** : Nombre d'éléments en attente

#### Sur l'Écran de Sync

Détails complets :
- Nombre d'éléments en attente
- Nombre d'erreurs
- Historique de synchronisation

## Architecture Technique

### Composants Principaux

#### NetworkContext
- Fournit l'état de connexion réseau à toute l'application
- Utilise `@react-native-community/netinfo`
- États : `isConnected`, `isInternetReachable`, `connectionType`

#### useAutoSync
- Hook pour synchronisation automatique
- Monitore les changements de réseau et d'état de l'app
- Implémente le retry avec backoff exponentiel

#### useOfflineConsultation
- Intercepte les créations de consultations
- Détecte automatiquement le mode hors ligne
- Enqueue les données si nécessaire

#### useLocalSync
- Gère le stockage local (AsyncStorage)
- API de synchronisation avec le backend
- Gestion de la queue de sync

### Stockage Local

Les données sont stockées dans AsyncStorage avec :
- **Clé de queue** : `@shalom:syncQueue`
- **Clé de statut** : `@shalom:syncStatus`

Chaque élément contient :
```typescript
{
  clientTempId: string,      // UUID généré côté client
  type: 'patient' | 'consultation',
  payload: any,              // Données de l'élément
  createdAt: string,         // ISO 8601
  status: 'pending' | 'syncing' | 'success' | 'error',
  error?: string,            // Message d'erreur si échec
  serverId?: string          // ID du serveur après succès
}
```

## Sécurité

### Données Sensibles

Les données médicales stockées localement sont :
- Stockées dans AsyncStorage (chiffré par le système sur Android)
- Nettoyées après synchronisation réussie
- Protégées par les permissions de l'application

### Bonnes Pratiques

1. **Ne pas désinstaller l'application** : Cela supprimerait les données en attente
2. **Synchroniser régulièrement** : Dès que vous avez une connexion
3. **Vérifier les erreurs** : Consultez l'écran de sync après reconnexion
4. **Garder l'app à jour** : Pour les dernières corrections de bugs

## Scénarios d'Usage

### Scénario 1 : Visite de Terrain sans Connexion

1. L'agent quitte le dispensaire avec l'application
2. Il visite des patients dans des zones sans réseau
3. Il crée plusieurs consultations
4. Toutes sont enregistrées localement
5. De retour au dispensaire avec WiFi
6. L'application synchronise automatiquement tout
7. Les données apparaissent sur le système central

### Scénario 2 : Connexion Intermittente

1. L'agent travaille avec une connexion instable
2. Certaines consultations passent en ligne
3. D'autres échouent et sont mises en queue
4. Quand la connexion se stabilise
5. La synchronisation automatique rattrape les échecs
6. Toutes les données finissent au serveur

### Scénario 3 : Synchronisation Différée

1. L'agent enregistre des données hors ligne le matin
2. Il continue de travailler toute la journée
3. Le soir, il se connecte au WiFi
4. Il vérifie l'écran de sync
5. Il lance une synchronisation manuelle
6. Il vérifie qu'il n'y a pas d'erreurs
7. Il peut éteindre l'application en toute sécurité

## Résolution de Problèmes

### Problème : Les données ne se synchronisent pas

**Solutions :**
1. Vérifiez votre connexion internet
2. Allez dans l'écran de sync et vérifiez les erreurs
3. Réessayez manuellement la synchronisation
4. Vérifiez que vous êtes bien authentifié

### Problème : Erreur de synchronisation persistante

**Solutions :**
1. Notez le message d'erreur exact
2. Vérifiez que les données sont valides
3. Contactez l'administrateur système
4. En dernier recours, exportez les données et recréez-les manuellement

### Problème : L'indicateur hors ligne ne disparaît pas

**Solutions :**
1. Vérifiez que vous êtes vraiment connecté à internet
2. Ouvrez un navigateur pour tester la connexion
3. Redémarrez l'application
4. Vérifiez les paramètres réseau de votre téléphone

## Support Technique

Pour toute question ou problème :

1. Consultez cette documentation
2. Vérifiez les logs dans l'écran de sync
3. Contactez votre superviseur
4. En cas de problème technique : contactez l'équipe de développement

## Changelog

### Version Actuelle (v1.0)

- ✅ Détection automatique du mode hors ligne
- ✅ Stockage local des consultations
- ✅ Synchronisation automatique sur reconnexion
- ✅ Indicateurs visuels (bannière, écran de sync)
- ✅ Gestion des erreurs avec retry
- ✅ Tests unitaires complets

### Prochaines Versions

- 🔜 Support hors ligne pour création de patients
- 🔜 Chiffrement renforcé des données sensibles (SecureStore)
- 🔜 Résolution de conflits pour modifications concurrentes
- 🔜 Export des données pour backup manuel
- 🔜 Statistiques de synchronisation détaillées
