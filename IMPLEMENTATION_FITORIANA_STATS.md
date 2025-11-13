# Fitoriana Statistics Resolver - Implementation Summary

## Overview
This implementation provides a backend GraphQL resolver for aggregating consultation statistics needed for the "MAHAKASIKA NY ASA FITORIANA" section of the Tatitra report.

## Key Features

### 1. Age Group Categorization
The resolver categorizes patients into three age groups according to Malagasy terminology:

- **Zaza (12 taona noho midina)**: Children aged 0-12 years
- **Tanora (13 taona - 30 taona)**: Youth aged 13-30 years  
- **Olon-dehibe maherin'ny 30 taona**: Adults over 30 years

### 2. Gender Split
Consultations are split by gender using Malagasy labels:

- **lahy**: Male (maps from database codes M or L)
- **vavy**: Female (maps from database code F)

### 3. Flexible Filtering

#### Date Range (Required)
```graphql
dateFrom: "2025-01-01"
dateTo: "2025-03-31"
```

#### Dispensaire Filter (Optional)
```graphql
dispensaireIds: ["uuid-1", "uuid-2", "uuid-3", "uuid-4"]
```

#### Religion Filter (Optional)
```graphql
# For Muslim statistics ("Isan'ny Hasila nitady fitsaboana tao")
religions: [Musulman]

# For non-Christians
religions: [Musulman, traditionnelle]

# For Christians only
religions: [Kristianina]
```

### 4. Automatic Totals (Fitambarany)
The resolver automatically calculates totals across all dispensaires for each age group and gender.

## Example Query

```graphql
query Q1_2025_FitorianaStats {
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

## Example Response

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
              "values": { "lahy": 8, "vavy": 10 }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": { "lahy": 87, "vavy": 124 }
            },
            {
              "dispensaireName": "Mahatsinjo",
              "values": { "lahy": 45, "vavy": 52 }
            },
            {
              "dispensaireName": "Antsahalava",
              "values": { "lahy": 23, "vavy": 31 }
            }
          ],
          "fitambarany": { "lahy": 163, "vavy": 217 }
        },
        {
          "label": "Tanora (13 taona - 30 taona)",
          "ageGroup": "TANORA",
          "valuesByDispensaire": [
            {
              "dispensaireName": "Ampitsopitsoka",
              "values": { "lahy": 15, "vavy": 20 }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": { "lahy": 45, "vavy": 60 }
            },
            {
              "dispensaireName": "Mahatsinjo",
              "values": { "lahy": 30, "vavy": 38 }
            },
            {
              "dispensaireName": "Antsahalava",
              "values": { "lahy": 18, "vavy": 22 }
            }
          ],
          "fitambarany": { "lahy": 108, "vavy": 140 }
        },
        {
          "label": "Olon-dehibe maherin'ny 30 taona",
          "ageGroup": "OLON_DEHIBE",
          "valuesByDispensaire": [
            {
              "dispensaireName": "Ampitsopitsoka",
              "values": { "lahy": 25, "vavy": 30 }
            },
            {
              "dispensaireName": "Boeny Aranta",
              "values": { "lahy": 55, "vavy": 70 }
            },
            {
              "dispensaireName": "Mahatsinjo",
              "values": { "lahy": 40, "vavy": 48 }
            },
            {
              "dispensaireName": "Antsahalava",
              "values": { "lahy": 20, "vavy": 28 }
            }
          ],
          "fitambarany": { "lahy": 140, "vavy": 176 }
        }
      ]
    }
  }
}
```

## Visual Representation

The response structure is designed to be easily displayed in a table format like the Tatitra report:

```
MAHAKASIKA NY ASA FITORIANA
Période: 01/01/2025 - 31/03/2025
Total Consultations: 500

┌─────────────────────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                                 │  Ampitsopitsoka  │  Boeny Aranta    │  Mahatsinjo      │  Antsahalava     │  Fitambarany     │
│  Tranche d'âge                  ├────────┬─────────┼────────┬─────────┼────────┬─────────┼────────┬─────────┼────────┬─────────┤
│                                 │  Lahy  │  Vavy   │  Lahy  │  Vavy   │  Lahy  │  Vavy   │  Lahy  │  Vavy   │  Lahy  │  Vavy   │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Zaza (12 taona noho midina)     │    8   │   10    │   87   │   124   │   45   │   52    │   23   │   31    │  163   │  217    │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Tanora (13 taona - 30 taona)    │   15   │   20    │   45   │   60    │   30   │   38    │   18   │   22    │  108   │  140    │
├─────────────────────────────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼─────────┤
│ Olon-dehibe maherin'ny 30 taona │   25   │   30    │   55   │   70    │   40   │   48    │   20   │   28    │  140   │  176    │
└─────────────────────────────────┴────────┴─────────┴────────┴─────────┴────────┴─────────┴────────┴─────────┴────────┴─────────┘
```

## Special Use Cases

### 1. Statistics for Muslims Only
For the "Isan'ny Hasila nitady fitsaboana tao" section:

```graphql
query MuslimStats {
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

### 2. Statistics for Non-Christians
For "Tsy Kristianina (Non-chrétiens)":

```graphql
query NonChristianStats {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    religions: [Musulman, traditionnelle]
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

### 3. Split Tables (4 dispensaires + 3 dispensaires)
The issue mentions splitting into two tables. This can be done by making two queries:

**Table 1: First 4 dispensaires**
```graphql
query FirstFourDispensaires {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["disp-1", "disp-2", "disp-3", "disp-4"]
  ) {
    rows {
      label
      valuesByDispensaire {
        dispensaireName
        values { lahy, vavy }
      }
    }
  }
}
```

**Table 2: Remaining 3 dispensaires + Fitambarany**
```graphql
query RemainingDispensaires {
  fitorianaStats(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["disp-5", "disp-6", "disp-7"]
  ) {
    rows {
      label
      valuesByDispensaire {
        dispensaireName
        values { lahy, vavy }
      }
      fitambarany {
        lahy
        vavy
      }
    }
  }
}
```

## Performance Characteristics

### Database Queries
- Single optimized query with joins (DataEntry → Patient → Dispensaire)
- Uses existing indexes: `dateConsultation`, `dispensaireId`, `religion`
- In-memory aggregation after database fetch

### Recommended Usage
- **Optimal**: Quarterly or semester reports (3-6 months)
- **Acceptable**: Annual reports (12 months)
- **Not recommended**: Multi-year reports without pagination

### Typical Response Times (estimated)
- 1,000 consultations: ~100-200ms
- 5,000 consultations: ~300-500ms
- 10,000 consultations: ~500-800ms

## Error Handling

The resolver returns clear error messages:

```
Invalid date format -> "Format de date invalide. Utilisez le format ISO (YYYY-MM-DD)"
Invalid date range -> "La date de début doit être antérieure à la date de fin"
Not authenticated -> "Non authentifié"
```

## Integration with Existing Reports

This resolver complements the existing `exportTatitraReport` mutation by:

1. Providing structured data for the Fitoriana section
2. Supporting flexible filtering for different report variations
3. Calculating totals server-side to ensure consistency
4. Being reusable across multiple report formats

## Testing

### Unit Tests: ✅ 21/21 passing
- Age group categorization
- Gender conversion
- Data aggregation
- Religion filtering
- Date validation
- Response structure
- Edge cases

### Integration Test Examples: ✅ Provided
- 17 test scenarios with mock data
- Example GraphQL queries
- Expected response structures

### Security Scan: ✅ 0 alerts
- CodeQL JavaScript analysis passed

## Next Steps for Frontend Integration

1. **Create Apollo Client Query Hook**
   ```javascript
   const { data, loading, error } = useFitorianaStats(dateFrom, dateTo, filters);
   ```

2. **Build Table Component**
   - Display rows with age groups
   - Show dispensaires as columns
   - Highlight Fitambarany totals

3. **Add to Tatitra Report Page**
   - Integrate with date picker
   - Add religion filter UI
   - Include in PDF export

4. **Handle Split Tables**
   - Query first 4 dispensaires
   - Query remaining 3 + totals
   - Display in two separate tables

## Conclusion

The fitorianaStats resolver is fully implemented, tested, and documented. It provides a flexible, performant solution for aggregating consultation statistics needed for the Tatitra report, with support for all the requirements specified in the issue.

**Status**: ✅ Production Ready
