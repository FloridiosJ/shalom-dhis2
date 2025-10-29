# Analytics API Documentation

This document describes the analytics and reporting endpoints available in the Shalom DHIS2 GraphQL API.

## Table of Contents
- [Top Diagnostics](#top-diagnostics)
- [Top Medications](#top-medications)
- [Consultations Evolution](#consultations-evolution)
- [Dispensaire Statistics](#dispensaire-statistics)

---

## Top Diagnostics

Query the most frequent diagnostics/disease categories over a given period.

### Query

```graphql
topDiagnostics(
  limit: Int
  dispensaireId: ID
  startDate: String
  endDate: String
): [TopDiagnostic!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | Int | No | 10 | Maximum number of results to return |
| `dispensaireId` | ID | No | - | Filter by specific dispensaire |
| `startDate` | String | No | - | Start date in ISO format (YYYY-MM-DD) |
| `endDate` | String | No | - | End date in ISO format (YYYY-MM-DD) |

### Response Type

```graphql
type TopDiagnostic {
  diagnostic: String!    # Category name or diagnostic text
  count: Int!           # Number of occurrences
  percentage: Float!    # Percentage of total consultations
}
```

### Data Source

This query prioritizes **structured data** from the category associations:
1. **Primary**: Uses `categorieMaladieId` from `DataEntryCategorieMaladie` (principal categories only)
2. **Fallback**: Uses text from `diagnostic` field for consultations without structured categories
3. **Warning**: Logs a warning message if unstructured data is detected

### Example Usage

#### Basic query (top 10 diagnostics, all time)
```graphql
query {
  topDiagnostics(limit: 10) {
    diagnostic
    count
    percentage
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "topDiagnostics": [
      {
        "diagnostic": "PALUDISME",
        "count": 45,
        "percentage": 22.5
      },
      {
        "diagnostic": "INFECTION RESPIRATOIRE",
        "count": 38,
        "percentage": 19.0
      }
    ]
  }
}
```

#### Filtered by dispensaire and date range
```graphql
query {
  topDiagnostics(
    limit: 5
    dispensaireId: "abc-123-def-456"
    startDate: "2025-01-01"
    endDate: "2025-01-31"
  ) {
    diagnostic
    count
    percentage
  }
}
```

#### Using GraphQL variables (recommended for dynamic queries)
```graphql
query TopDiagnostics($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
  topDiagnostics(
    limit: $limit
    dispensaireId: $dispensaireId
    startDate: $startDate
    endDate: $endDate
  ) {
    diagnostic
    count
    percentage
  }
}
```

**Variables:**
```json
{
  "limit": 5,
  "dispensaireId": "abc-123-def-456",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Example Response

```json
{
  "data": {
    "topDiagnostics": [
      {
        "diagnostic": "PALUDISME",
        "count": 45,
        "percentage": 22.5
      },
      {
        "diagnostic": "INFECTION RESPIRATOIRE",
        "count": 38,
        "percentage": 19.0
      },
      {
        "diagnostic": "DIARRHÉE",
        "count": 27,
        "percentage": 13.5
      }
    ]
  }
}
```

### Performance Considerations

- **Indexes**: The query leverages existing database indexes on:
  - `data_entries.dispensaireId`
  - `data_entries.dateConsultation`
  - `data_entries.isActive`
  - `data_entry_categorie_maladies.dataEntryId`
  - `data_entry_categorie_maladies.categorieMaladieId`
  - `data_entry_categorie_maladies.isPrincipal`

- **Optimization**: Uses SQL aggregations with `COUNT` and `GROUP BY` for efficient computation
- **Scalability**: Tested for large datasets (10,000+ consultations)

### Data Quality Notes

1. **Structured vs Unstructured**:
   - Consultations with assigned categories (via `DataEntryCategorieMaladie`) provide more accurate analytics
   - Consultations without categories fall back to text matching, which may have variations (e.g., "Paludisme" vs "PALUDISME")

2. **Principal Categories**:
   - Only principal categories (`isPrincipal: true`) are counted
   - This ensures one diagnosis per consultation is counted

3. **Warnings**:
   - If consultations without structured categories are found, a warning is logged to the console
   - This helps identify data quality issues

### Implementation Details

1. **Query Optimization**:
   - First fetches all matching DataEntry IDs with filters applied
   - Then aggregates category associations only for those IDs
   - Avoids nested queries and leverages database indexes
   - Uses `COUNT` and `GROUP BY` for efficient aggregation

2. **Edge Cases Handled**:
   - Empty result sets: Returns empty array
   - No categories assigned: Falls back to text diagnostics
   - Mixed structured/unstructured data: Combines both intelligently
   - Inactive categories: Filters out inactive categories from results
   - Limit parameter: Applied after combining all results to ensure top diagnostics

3. **Performance Characteristics**:
   - Query complexity: O(n) where n is number of matching consultations
   - Database queries: 3-4 queries total (optimized with indexes)
   - Memory usage: Minimal (processes results in streams where possible)

### Frontend Integration

This query can be used in:
- `Reports.jsx` - Main reports page
- `StatCard` - Display top diagnostic statistics
- `ChartCard` - Visualize diagnostic distribution

Example React usage:
```javascript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TOP_DIAGNOSTICS_QUERY = gql`
  query TopDiagnostics($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
    topDiagnostics(
      limit: $limit
      dispensaireId: $dispensaireId
      startDate: $startDate
      endDate: $endDate
    ) {
      diagnostic
      count
      percentage
    }
  }
`;

function DiagnosticsReport() {
  const { data, loading, error } = useQuery(TOP_DIAGNOSTICS_QUERY, {
    variables: {
      limit: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.topDiagnostics.map((item, index) => (
        <div key={index}>
          <span>{item.diagnostic}</span>
          <span>{item.count} ({item.percentage}%)</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Top Medications

Query the most frequently prescribed medications over a given period.

### Query

```graphql
topMedications(
  limit: Int
  dispensaireId: ID
  startDate: String
  endDate: String
): [TopMedication!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | Int | No | 10 | Maximum number of results to return |
| `dispensaireId` | ID | No | - | Filter by specific dispensaire |
| `startDate` | String | No | - | Start date in ISO format (YYYY-MM-DD) |
| `endDate` | String | No | - | End date in ISO format (YYYY-MM-DD) |

### Response Type

```graphql
type TopMedication {
  medicament: String!   # Medication name
  count: Int!          # Number of prescriptions
  avgDuree: String     # Average duration (e.g., "5j", null if no duration data)
  totalDuree: String   # Total duration (e.g., "60j", null if no duration data)
}
```

### Data Source

This query uses **structured prescription data** from the `prescription_items` table:
- **Primary**: Uses `prescriptionItems.medicament` for medication names
- **Ignores**: Free-text `prescription` field on DataEntry
- **Duration Parsing**: Automatically parses various duration formats:
  - Days: "5j", "5 jours", "5 days", "5d"
  - Weeks: "2 semaines", "2 weeks", "2w", "2s" (converted to days: × 7)
  - Months: "1 mois", "1 month", "1m" (converted to days: × 30)

### Example Usage

#### Basic query (top 10 medications, all time)
```graphql
query {
  topMedications(limit: 10) {
    medicament
    count
    avgDuree
    totalDuree
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "topMedications": [
      {
        "medicament": "Paracétamol",
        "count": 20,
        "avgDuree": "5j",
        "totalDuree": "100j"
      },
      {
        "medicament": "Amoxicilline",
        "count": 15,
        "avgDuree": "7j",
        "totalDuree": "105j"
      }
    ]
  }
}
```

#### Filtered by dispensaire and date range
```graphql
query {
  topMedications(
    limit: 5
    dispensaireId: "abc-123-def-456"
    startDate: "2025-01-01"
    endDate: "2025-01-31"
  ) {
    medicament
    count
    avgDuree
    totalDuree
  }
}
```

#### Using GraphQL variables (recommended for dynamic queries)
```graphql
query TopMedications($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
  topMedications(
    limit: $limit
    dispensaireId: $dispensaireId
    startDate: $startDate
    endDate: $endDate
  ) {
    medicament
    count
    avgDuree
    totalDuree
  }
}
```

**Variables:**
```json
{
  "limit": 5,
  "dispensaireId": "abc-123-def-456",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Example Response

```json
{
  "data": {
    "topMedications": [
      {
        "medicament": "Paracétamol",
        "count": 20,
        "avgDuree": "5j",
        "totalDuree": "100j"
      },
      {
        "medicament": "Amoxicilline",
        "count": 15,
        "avgDuree": "7j",
        "totalDuree": "105j"
      },
      {
        "medicament": "Ibuprofène",
        "count": 12,
        "avgDuree": "3j",
        "totalDuree": "36j"
      },
      {
        "medicament": "Vitamine C",
        "count": 8,
        "avgDuree": null,
        "totalDuree": null
      }
    ]
  }
}
```

### Performance Considerations

- **Indexes**: The query leverages existing database indexes on:
  - `prescription_items.dataEntryId`
  - `prescription_items.medicament`
  - `prescription_items.isActive`
  - `data_entries.dispensaireId`
  - `data_entries.dateConsultation`
  - `data_entries.isActive`

- **Optimization**: Uses SQL aggregations with `COUNT` and `GROUP BY` for efficient computation
- **Scalability**: Tested for large datasets (10,000+ prescriptions)

### Data Quality Notes

1. **Structured Prescriptions**:
   - Only uses structured prescription items from the `prescriptionItems` array
   - Ignores free-text prescriptions to ensure data quality and consistency
   - Each prescription item represents one medication entry

2. **Duration Parsing**:
   - Normalizes various duration formats to days
   - Handles missing or empty duration values gracefully (returns null)
   - Supports multiple languages and formats

3. **Null Values**:
   - Medications without duration data still appear in results
   - `avgDuree` and `totalDuree` are `null` when no valid duration data exists

### Implementation Details

1. **Query Optimization**:
   - First fetches all matching DataEntry IDs with filters applied
   - Then aggregates prescription items only for those IDs
   - Uses raw SQL for complex aggregations (array aggregation for durations)
   - Avoids nested queries and leverages database indexes

2. **Edge Cases Handled**:
   - Empty result sets: Returns empty array
   - Missing durations: Returns null for avgDuree and totalDuree
   - Mixed duration formats: Normalizes to days
   - Inactive items: Filters out inactive prescription items
   - Limit parameter: Applied after aggregation to ensure top medications

3. **Performance Characteristics**:
   - Query complexity: O(n) where n is number of matching prescription items
   - Database queries: 2 queries total (optimized with raw SQL)
   - Memory usage: Minimal (processes results in streams where possible)

### Frontend Integration

This query can be used in:
- `Reports.jsx` - Main reports page
- `StatCard` - Display top medication statistics
- `ChartCard` - Visualize medication distribution

Example React usage:
```javascript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const TOP_MEDICATIONS_QUERY = gql`
  query TopMedications($limit: Int, $dispensaireId: ID, $startDate: String, $endDate: String) {
    topMedications(
      limit: $limit
      dispensaireId: $dispensaireId
      startDate: $startDate
      endDate: $endDate
    ) {
      medicament
      count
      avgDuree
      totalDuree
    }
  }
`;

function MedicationsReport() {
  const { data, loading, error } = useQuery(TOP_MEDICATIONS_QUERY, {
    variables: {
      limit: 10,
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    }
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.topMedications.map((item, index) => (
        <div key={index}>
          <span>{item.medicament}</span>
          <span>{item.count} prescriptions</span>
          {item.avgDuree && <span>Durée moy: {item.avgDuree}</span>}
          {item.totalDuree && <span>Total: {item.totalDuree}</span>}
        </div>
      ))}
    </div>
  );
}
```

---

## Consultations Evolution

Query the evolution of consultations over time, grouped by period (day, week, month, year).

### Query

```graphql
consultationsEvolution(
  period: String!
  dispensaireId: ID
  startDate: String
  endDate: String
): [ConsultationEvolution!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `period` | String | Yes | - | Grouping period: "day", "week", "month", or "year" |
| `dispensaireId` | ID | No | - | Filter by specific dispensaire |
| `startDate` | String | No | Auto | Start date in ISO format (auto-calculated based on period) |
| `endDate` | String | No | Now | End date in ISO format |

### Response Type

```graphql
type ConsultationEvolution {
  period: String!   # Period identifier (e.g., "2025-01", "2025-W03")
  date: String!     # Same as period for compatibility
  count: Int!       # Number of consultations in that period
}
```

---

## Dispensaire Statistics

Get comprehensive statistics for a specific dispensaire.

### Query

```graphql
dispensaireStats(
  dispensaireId: ID!
  startDate: String
  endDate: String
): DispensaireStats!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dispensaireId` | ID | Yes | - | ID of the dispensaire |
| `startDate` | String | No | - | Start date in ISO format |
| `endDate` | String | No | - | End date in ISO format |

### Response Type

```graphql
type DispensaireStats {
  dispensaire: Dispensaire!
  totalConsultations: Int!
  totalPatients: Int!
  consultationsByType: [ConsultationByType!]!
  topCategories: [CategoryStat!]!
}
```

---

## Authentication

All analytics queries require authentication. Include a valid JWT token in the request headers:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns standard GraphQL errors:

```json
{
  "errors": [
    {
      "message": "Non authentifié",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

Common error codes:
- `UNAUTHENTICATED`: No valid authentication token provided
- `FORBIDDEN`: User doesn't have permission to access requested data
- `BAD_USER_INPUT`: Invalid parameters provided
- `INTERNAL_SERVER_ERROR`: Server-side error

## Rate Limiting

Currently, there are no rate limits on analytics queries. However, for production deployments, consider implementing rate limiting to prevent abuse.

## Future Enhancements

Planned improvements for the analytics API:
- [ ] Export functionality (PDF, Excel)
- [ ] Caching for frequently accessed reports
- [ ] Real-time subscriptions for live dashboards
- [ ] More granular filtering options
- [ ] Custom date ranges with timezone support
