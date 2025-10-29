# Analytics API Documentation

This document describes the analytics and reporting endpoints available in the Shalom DHIS2 GraphQL API.

## Table of Contents
- [Top Diagnostics](#top-diagnostics)
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
