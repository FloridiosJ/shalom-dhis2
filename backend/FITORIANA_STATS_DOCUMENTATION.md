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
