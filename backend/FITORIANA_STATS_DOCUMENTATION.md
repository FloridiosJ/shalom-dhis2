# Fitoriana Statistics Resolver

## Description
Le resolver `fitorianaStats` permet d'agréger les consultations pour la section "MAHAKASIKA NY ASA FITORIANA" du rapport Tatitra.

## Fonctionnalités

### Tranches d'âge
- **Zaza (12 taona noho midina)**: Patients âgés de 0 à 12 ans
- **Tanora (13 taona - 30 taona)**: Patients âgés de 13 à 30 ans
- **Olon-dehibe maherin'ny 30 taona**: Patients âgés de plus de 30 ans

### Genres
- **lahy**: Masculin (codes M ou L dans la base)
- **vavy**: Féminin (code F dans la base)

### Filtres disponibles
1. **Période** (obligatoire): `dateFrom` et `dateTo` au format ISO (YYYY-MM-DD)
2. **Dispensaires** (optionnel): Liste d'IDs de dispensaires à inclure
3. **Religions** (optionnel): Filtre par religion(s) - `Kristianina`, `Musulman`, `traditionnelle`

### Totaux (Fitambarany)
Le resolver calcule automatiquement les totaux pour chaque tranche d'âge, en sommant les valeurs de tous les dispensaires.

## Exemples de requêtes GraphQL

### 1. Requête de base (tous les dispensaires, toutes les religions)

```graphql
query {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    dateFrom
    dateTo
    totalConsultations
    rows {
      label
      ageGroup
      valuesByDispensaire {
        dispensaireName
        values {
          lahy
          vavy
        }
      }
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

### 2. Filtrer par dispensaire spécifique

```graphql
query {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["uuid-dispensaire-1", "uuid-dispensaire-2"]
  ) {
    rows {
      label
      valuesByDispensaire {
        dispensaireName
        values {
          lahy
          vavy
        }
      }
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

### 3. Statistique des Musulmans ("Isan'ny Hasila nitady fitsaboana tao")

```graphql
query {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    religions: [Musulman]
  ) {
    totalConsultations
    rows {
      label
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

### 4. Statistique des non-chrétiens

```graphql
query {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    religions: [Musulman, traditionnelle]
  ) {
    totalConsultations
    rows {
      label
      valuesByDispensaire {
        dispensaireName
        values {
          lahy
          vavy
        }
      }
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

### 5. Trimestre complet (Q1 2025)

```graphql
query Q1_2025_Stats {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    dateFrom
    dateTo
    totalConsultations
    rows {
      label
      ageGroup
      valuesByDispensaire {
        dispensaireName
        values {
          lahy
          vavy
        }
      }
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

## Structure de la réponse

```json
{
  "data": {
    "fitorianaStats": {
      "dateFrom": "2025-01-01",
      "dateTo": "2025-03-31",
      "totalConsultations": 500,
      "rows": [
        {
          "label": "Zaza (12 taona noho midina)",
          "ageGroup": "ZAZA",
          "valuesByDispensaire": [
            {
              "dispensaireName": "Ampitsopitsoka",
              "values": {
                "lahy": 8,
                "vavy": 10
              }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": {
                "lahy": 87,
                "vavy": 124
              }
            }
          ],
          "fitambarany": {
            "lahy": 95,
            "vavy": 134
          }
        },
        {
          "label": "Tanora (13 taona - 30 taona)",
          "ageGroup": "TANORA",
          "valuesByDispensaire": [
            {
              "dispensaireName": "Ampitsopitsoka",
              "values": {
                "lahy": 15,
                "vavy": 20
              }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": {
                "lahy": 45,
                "vavy": 60
              }
            }
          ],
          "fitambarany": {
            "lahy": 60,
            "vavy": 80
          }
        },
        {
          "label": "Olon-dehibe maherin'ny 30 taona",
          "ageGroup": "OLON_DEHIBE",
          "valuesByDispensaire": [
            {
              "dispensaireName": "Ampitsopitsoka",
              "values": {
                "lahy": 25,
                "vavy": 30
              }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": {
                "lahy": 55,
                "vavy": 70
              }
            }
          ],
          "fitambarany": {
            "lahy": 80,
            "vavy": 100
          }
        }
      ]
    }
  }
}
```

## Utilisation côté client (React/Apollo)

### Hook personnalisé

```javascript
import { useQuery, gql } from '@apollo/client';

const FITORIANA_STATS_QUERY = gql`
  query FitorianaStats(
    $dateFrom: String!
    $dateTo: String!
    $dispensaireIds: [ID!]
    $religions: [Religion!]
  ) {
    fitorianaStats(
      dateFrom: $dateFrom
      dateTo: $dateTo
      dispensaireIds: $dispensaireIds
      religions: $religions
    ) {
      dateFrom
      dateTo
      totalConsultations
      rows {
        label
        ageGroup
        valuesByDispensaire {
          dispensaireName
          values {
            lahy
            vavy
          }
        }
        fitambarany {
          lahy
          vavy
        }
      }
    }
  }
`;

export const useFitorianaStats = (dateFrom, dateTo, filters = {}) => {
  return useQuery(FITORIANA_STATS_QUERY, {
    variables: {
      dateFrom,
      dateTo,
      ...filters
    },
    skip: !dateFrom || !dateTo
  });
};
```

### Composant d'affichage

```javascript
import React from 'react';
import { useFitorianaStats } from './hooks/useFitorianaStats';

const FitorianaStatsTable = ({ dateFrom, dateTo, dispensaireIds, religions }) => {
  const { data, loading, error } = useFitorianaStats(dateFrom, dateTo, {
    dispensaireIds,
    religions
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  const stats = data?.fitorianaStats;

  return (
    <div>
      <h2>Statistiques Fitoriana</h2>
      <p>Période: {stats.dateFrom} - {stats.dateTo}</p>
      <p>Total consultations: {stats.totalConsultations}</p>
      
      <table>
        <thead>
          <tr>
            <th>Tranche d'âge</th>
            {stats.rows[0]?.valuesByDispensaire.map(disp => (
              <th key={disp.dispensaireName} colSpan="2">
                {disp.dispensaireName}
              </th>
            ))}
            <th colSpan="2">Fitambarany</th>
          </tr>
          <tr>
            <th></th>
            {stats.rows[0]?.valuesByDispensaire.map(disp => (
              <React.Fragment key={disp.dispensaireName}>
                <th>Lahy</th>
                <th>Vavy</th>
              </React.Fragment>
            ))}
            <th>Lahy</th>
            <th>Vavy</th>
          </tr>
        </thead>
        <tbody>
          {stats.rows.map(row => (
            <tr key={row.ageGroup}>
              <td>{row.label}</td>
              {row.valuesByDispensaire.map(disp => (
                <React.Fragment key={disp.dispensaireName}>
                  <td>{disp.values.lahy}</td>
                  <td>{disp.values.vavy}</td>
                </React.Fragment>
              ))}
              <td><strong>{row.fitambarany.lahy}</strong></td>
              <td><strong>{row.fitambarany.vavy}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FitorianaStatsTable;
```

## Performance et optimisation

### Indexation
Le resolver utilise les index existants sur:
- `data_entries.dateConsultation`
- `data_entries.dispensaireId`
- `patients.religion`

### Pagination
Pour des périodes larges avec beaucoup de données:
- Le resolver agrège en mémoire après avoir récupéré les consultations
- Pour des performances optimales, limiter les requêtes à des trimestres ou semestres
- Si nécessaire, ajouter une pagination au niveau de la période

### Mise en cache
Recommandations pour le cache Apollo Client:
```javascript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        fitorianaStats: {
          keyArgs: ['dateFrom', 'dateTo', 'dispensaireIds', 'religions'],
          merge: false // Always replace with new data
        }
      }
    }
  }
});
```

## Tests

### Tests unitaires
21 tests couvrant:
- Catégorisation par âge
- Conversion des genres
- Agrégation des données
- Filtrage par religion
- Validation des dates
- Structure de la réponse
- Cas limites

Exécution:
```bash
npm test -- src/__tests__/fitorianaStats.resolvers.test.js
```

### Tests d'intégration (à créer)
TODO: Ajouter des tests avec une base de données de test et des seeders

## Gestion des erreurs

Le resolver retourne des erreurs explicites pour:
- Dates invalides: "Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)"
- Période invalide: "La date de début doit être antérieure à la date de fin"
- Non authentifié: "Non authentifié"

## Notes techniques

1. **Mapping sexe → genre**:
   - M (Masculin) → lahy
   - L (Autre) → lahy
   - F (Féminin) → vavy

2. **Tranches d'âge strictes**:
   - Zaza: age ≤ 12
   - Tanora: 13 ≤ age ≤ 30
   - Olon-dehibe: age > 30

3. **Religions supportées**:
   - Kristianina
   - Musulman
   - traditionnelle

4. **Calcul des totaux**:
   Les totaux (fitambarany) sont calculés côté serveur pour garantir la cohérence.

## Évolutions possibles

1. **Ajout de métriques supplémentaires**:
   - Pourcentage par dispensaire
   - Évolution par rapport à la période précédente
   - Moyenne par mois

2. **Export direct vers PDF**:
   - Intégrer avec le générateur PDF Tatitra existant
   - Format prêt pour l'impression

3. **Cache côté serveur**:
   - Utiliser Redis pour mettre en cache les résultats par période
   - Invalider le cache lors de nouvelles consultations

4. **Granularité temporelle**:
   - Ajouter agrégation par mois ou par semaine
   - Comparaisons entre périodes

---

# ConsultantsByZone Resolver

## Description
Le resolver `consultantsByZone` permet d'agréger le nombre de consultants (patients uniques) et de consultations par dispensaire pour une période donnée. Ce resolver est essentiel pour les rapports Tatitra et la visualisation frontend.

## Fonctionnalités

### Métriques calculées
- **consultants**: Nombre de patients UNIQUES (DISTINCT patientId) ayant eu au moins une consultation dans la période/dispensaire
- **consultations**: Nombre total de consultations (DataEntry) pour la période/dispensaire
- **Total (Fitambarany)**: Ligne supplémentaire avec `dispensaire = null` contenant les totaux tous dispensaires confondus

### Filtres disponibles
1. **Période** (obligatoire): `dateFrom` et `dateTo` au format ISO (YYYY-MM-DD)
2. **Dispensaires** (optionnel): Liste d'IDs de dispensaires à inclure. Si non spécifié, retourne tous les dispensaires actifs.

### Optimisations
- Utilise `COUNT(DISTINCT patientId)` pour compter les consultants de manière efficace
- Agrégation SQL native (pas de traitement en mémoire)
- Minimise les requêtes DB (2 requêtes max: dispensaires + agrégation)
- Retourne 0 pour les dispensaires sans consultations (pas de données manquantes)

## Exemples de requêtes GraphQL

### 1. Requête de base (tous les dispensaires)

```graphql
query Q1_2025_ConsultantsByZone {
  consultantsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    dispensaire {
      id
      name
    }
    consultants
    consultations
  }
}
```

### 2. Filtrer par dispensaire spécifique

```graphql
query ConsultantsForSpecificZones {
  consultantsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["uuid-dispensaire-1", "uuid-dispensaire-2"]
  ) {
    dispensaire {
      id
      name
    }
    consultants
    consultations
  }
}
```

### 3. Trimestre complet avec totaux

```graphql
query Q4_2024_WithTotals {
  consultantsByZone(
    dateFrom: "2024-10-01"
    dateTo: "2024-12-31"
  ) {
    dispensaire {
      id
      name
    }
    consultants
    consultations
  }
}
```

## Structure de la réponse

```json
{
  "data": {
    "consultantsByZone": [
      {
        "dispensaire": {
          "id": "uuid-1",
          "name": "Ampitsopitsoka"
        },
        "consultants": 93,
        "consultations": 207
      },
      {
        "dispensaire": {
          "id": "uuid-2",
          "name": "Boeny Aranta"
        },
        "consultants": 85,
        "consultations": 189
      },
      {
        "dispensaire": {
          "id": "uuid-3",
          "name": "Ankelitaly"
        },
        "consultants": 0,
        "consultations": 0
      },
      {
        "dispensaire": null,
        "consultants": 178,
        "consultations": 396
      }
    ]
  }
}
```

**Note**: La dernière entrée avec `dispensaire: null` représente le total (Fitambarany).

## Utilisation côté client (React)

### Service GraphQL

```javascript
// web/src/services/reports.js
async function getConsultantsByZone(dateFrom, dateTo, dispensaireIds = null) {
  const query = `
    query ConsultantsByZone($dateFrom: String!, $dateTo: String!, $dispensaireIds: [ID!]) {
      consultantsByZone(
        dateFrom: $dateFrom
        dateTo: $dateTo
        dispensaireIds: $dispensaireIds
      ) {
        dispensaire {
          id
          name
        }
        consultants
        consultations
      }
    }
  `;
  
  const variables = { 
    dateFrom, 
    dateTo,
    ...(dispensaireIds && dispensaireIds.length > 0 && { dispensaireIds })
  };
  
  const response = await client.post('', { query, variables });
  return handleGraphQLErrors(response).consultantsByZone;
}
```

### Hook personnalisé

```javascript
// web/src/hooks/useReports.js
import { useQuery } from '@tanstack/react-query';
import reportService from '../services/reports';

export function useConsultantsByZone(dateFrom, dateTo, dispensaireIds = null) {
  const dispensaireFilter = dispensaireIds && dispensaireIds.length > 0 ? dispensaireIds : null;
  
  return useQuery({
    queryKey: ['reports', 'consultantsByZone', dateFrom, dateTo, dispensaireFilter],
    queryFn: () => reportService.getConsultantsByZone(dateFrom, dateTo, dispensaireFilter),
    enabled: !!dateFrom && !!dateTo,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    keepPreviousData: true,
  });
}
```

### Composant d'affichage

```javascript
import React from 'react';
import { useConsultantsByZone } from '../hooks/useReports';

const ConsultantsByZoneTable = ({ dateFrom, dateTo, dispensaireIds }) => {
  const { data, isLoading, error } = useConsultantsByZone(dateFrom, dateTo, dispensaireIds);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  // Séparer les données des dispensaires et le total
  const dispensaireRows = data?.slice(0, -1) || [];
  const totalRow = data?.[data.length - 1];

  return (
    <div>
      <h2>Consultants et Consultations par Zone</h2>
      <p>Période: {dateFrom} - {dateTo}</p>
      
      <table className="stats-table">
        <thead>
          <tr>
            <th>Dispensaire</th>
            <th>Consultants (patients uniques)</th>
            <th>Consultations (total)</th>
          </tr>
        </thead>
        <tbody>
          {dispensaireRows.map(row => (
            <tr key={row.dispensaire.id}>
              <td>{row.dispensaire.name}</td>
              <td>{row.consultants}</td>
              <td>{row.consultations}</td>
            </tr>
          ))}
          {totalRow && (
            <tr className="total-row">
              <td><strong>FITAMBARANY (Total)</strong></td>
              <td><strong>{totalRow.consultants}</strong></td>
              <td><strong>{totalRow.consultations}</strong></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultantsByZoneTable;
```

## Performance et optimisation

### Indexation
Le resolver utilise les index existants sur:
- `data_entries.dateConsultation`
- `data_entries.dispensaireId`
- `data_entries.patientId`

### Requêtes SQL
Le resolver effectue 2 requêtes optimisées:
1. Récupération des dispensaires actifs (avec filtre optionnel)
2. Agrégation avec `COUNT(DISTINCT patientId)` et `COUNT(*)` groupés par `dispensaireId`

### Temps de réponse attendu
- < 500ms pour 1000 consultations sur 4-7 dispensaires
- < 1s pour 5000 consultations sur 10+ dispensaires

## Tests

### Tests unitaires
20 tests couvrant:
- Validation des dates
- Agrégation des données (patients uniques vs consultations totales)
- Filtrage par dispensaire(s)
- Structure de la réponse
- Gestion du total (Fitambarany)
- Cas limites (zéro consultations, très grands nombres, etc.)

Exécution:
```bash
npm test -- src/__tests__/consultantsByZone.resolvers.test.js
```

## Gestion des erreurs

Le resolver retourne des erreurs explicites pour:
- Dates invalides: "Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)"
- Période invalide: "La date de début doit être antérieure à la date de fin"
- Non authentifié: "Non authentifié"

## Différences avec fitorianaStats

| Aspect | consultantsByZone | fitorianaStats |
|--------|------------------|----------------|
| **But** | Compter consultants et consultations par dispensaire | Agréger par âge/genre/dispensaire |
| **Filtres** | dateFrom, dateTo, dispensaireIds | dateFrom, dateTo, dispensaireIds, religions |
| **Sortie** | Array simple avec totaux | Structure hiérarchique par tranche d'âge |
| **Complexité** | Simple (2 colonnes de compteurs) | Complexe (matrice multi-dimensionnelle) |
| **Usage** | Rapports Tatitra section 2, visualisations générales | Rapport Tatitra section 1 (Fitoriana) |

## Notes d'implémentation

1. **Comptage des consultants**:
   - Utilise `COUNT(DISTINCT patientId)` pour éviter les doublons
   - Un patient avec 5 consultations = 1 consultant

2. **Comptage des consultations**:
   - Utilise `COUNT(*)` sur la table DataEntry
   - Compte toutes les consultations actives dans la période

3. **Ligne de total**:
   - Toujours présente en dernière position
   - `dispensaire = null` pour l'identifier
   - Somme de tous les dispensaires

4. **Dispensaires sans consultation**:
   - Retournent `consultants: 0` et `consultations: 0`
   - Pas de données manquantes dans la réponse

## Requêtes associées

### diagnosticsByZone

Le resolver `diagnosticsByZone` complète `fitorianaStats` et `consultantsByZone` pour la section 2 du rapport Tatitra:

```graphql
query {
  diagnosticsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    diagnostic
    dispensaires {
      id
      name
      count
    }
    total
  }
}
```

**Utilité**: Retourne une table croisée diagnostics × dispensaires pour la section "Désignations des maladies / Diagnostics" du rapport Tatitra.

**Différences avec topDiagnostics**:
- `topDiagnostics`: Agrégation globale, retourne uniquement le total par diagnostic
- `diagnosticsByZone`: Agrégation par dispensaire ET diagnostic, retourne des compteurs détaillés par zone

**Voir**: ANALYTICS_API.md pour la documentation complète de `diagnosticsByZone`
