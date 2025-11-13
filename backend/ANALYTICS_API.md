# Analytics API Documentation

This document describes the analytics and reporting endpoints available in the Shalom DHIS2 GraphQL API.

## Table of Contents
- [Top Diagnostics](#top-diagnostics)
- [Top Medications](#top-medications)
- [Consultations Evolution](#consultations-evolution)
- [Dispensaire Statistics](#dispensaire-statistics)
- [Diagnostics by Zone](#diagnostics-by-zone)
- [Education by Zone](#education-by-zone)
- [Maternal Health by Zone](#maternal-health-by-zone)
- [Events by Zone](#events-by-zone)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

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

## Diagnostics by Zone

Query diagnostics aggregated by dispensaire/zone for a given period. Returns a cross-tabulation table (diagnostics × dispensaires) useful for Tatitra reports and analytics dashboards.

### Query

```graphql
diagnosticsByZone(
  dateFrom: String!
  dateTo: String!
  dispensaireIds: [ID!]
  limit: Int
): [DiagnosticsByZone!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dateFrom` | String | Yes | - | Start date in ISO format (YYYY-MM-DD) |
| `dateTo` | String | Yes | - | End date in ISO format (YYYY-MM-DD) |
| `dispensaireIds` | [ID!] | No | All active | Filter by specific dispensaires |
| `limit` | Int | No | Unlimited | Maximum number of diagnostics to return |

### Response Type

```graphql
type DiagnosticsByZone {
  diagnostic: String!                          # Category name or diagnostic text
  dispensaires: [DispensaireDiagnosticCount!]! # Count per dispensaire
  total: Int!                                  # Total across all dispensaires
}

type DispensaireDiagnosticCount {
  id: ID!       # Dispensaire ID
  name: String! # Dispensaire name
  count: Int!   # Number of consultations for this diagnostic at this dispensaire
}
```

### Data Source

This query prioritizes **structured data** from the category associations:
1. **Primary**: Uses `categorieMaladieId` from `DataEntryCategorieMaladie` (principal categories only)
2. **Fallback**: Uses text from `diagnostic` field for consultations without structured categories
3. **Warning**: Logs a warning message if unstructured data is detected
4. **Aggregation**: Groups by both diagnostic AND dispensaire for cross-tabulation
5. **Sorting**: Results sorted by total count descending

### Features

- **Cross-tabulation**: Returns counts broken down by both diagnostic and dispensaire
- **Structured + Unstructured**: Combines structured categories with text fallback
- **Filtering**: Support for date range and dispensaire filters
- **Limiting**: Optional limit parameter to return only top N diagnostics
- **Comprehensive**: Includes all active dispensaires in results (with 0 counts if needed)

### Example Usage

#### Basic query (all diagnostics, all dispensaires, Q1 2025)
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

**Expected Response:**
```json
{
  "data": {
    "diagnosticsByZone": [
      {
        "diagnostic": "PALUDISME",
        "dispensaires": [
          { "id": "uuid-1", "name": "Ampitsopitsoka", "count": 35 },
          { "id": "uuid-2", "name": "Boeny Aranta", "count": 30 },
          { "id": "uuid-3", "name": "Ankelitaly", "count": 28 }
        ],
        "total": 93
      },
      {
        "diagnostic": "INFECTION RESPIRATOIRE",
        "dispensaires": [
          { "id": "uuid-1", "name": "Ampitsopitsoka", "count": 25 },
          { "id": "uuid-2", "name": "Boeny Aranta", "count": 22 },
          { "id": "uuid-3", "name": "Ankelitaly", "count": 20 }
        ],
        "total": 67
      }
    ]
  }
}
```

#### Filtered by specific dispensaires and limited to top 10
```graphql
query {
  diagnosticsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["uuid-1", "uuid-2"]
    limit: 10
  ) {
    diagnostic
    dispensaires {
      name
      count
    }
    total
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "diagnosticsByZone": [
      {
        "diagnostic": "PALUDISME",
        "dispensaires": [
          { "name": "Ampitsopitsoka", "count": 35 },
          { "name": "Boeny Aranta", "count": 30 }
        ],
        "total": 65
      }
    ]
  }
}
```

### Use Cases

1. **Tatitra Reports**: Generate the "Désignations des maladies" section with diagnostic × dispensaire cross-tabulation
2. **Analytics Dashboard**: Visualize disease distribution across zones
3. **Comparative Analysis**: Compare diagnostic patterns between different dispensaires
4. **Trend Analysis**: Track changes in diagnostic patterns over time by comparing different periods

### Performance

- Uses optimized SQL aggregation with `GROUP BY` for efficient database queries
- Typical response time: <1 second for datasets with thousands of consultations
- Indexed on `dateConsultation`, `dispensaireId`, and `categorieMaladieId` for fast filtering

---

## Education by Zone

Query education statistics aggregated by dispensaire/zone, category (short-term/long-term), and gender for a given period. Returns a cross-tabulation structure useful for Tatitra Section III (Fandriandram-piterahana).

### Query

```graphql
educationByZone(
  dateFrom: String!
  dateTo: String!
  dispensaireIds: [ID!]
): [EducationCategoryByZone!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dateFrom` | String | Yes | - | Start date in ISO format (YYYY-MM-DD) |
| `dateTo` | String | Yes | - | End date in ISO format (YYYY-MM-DD) |
| `dispensaireIds` | [ID!] | No | All active | Filter by specific dispensaires |

### Response Type

```graphql
type EducationCategoryByZone {
  category: String!               # Education category name
  zones: [ZoneEducationCount!]!  # Counts per dispensaire
  totalMale: Int!                # Total male participants
  totalFemale: Int!              # Total female participants
}

type ZoneEducationCount {
  id: ID!       # Dispensaire ID
  name: String! # Dispensaire name
  male: Int!    # Number of male participants
  female: Int!  # Number of female participants
}
```

### Data Source

This query uses **consultation data** with keyword matching:
1. **Categories**: Fixed categories for education types
   - "Fanabeazana aiza tsy maharitra" (Short-term education)
   - "Fanabeazana aiza maharitra" (Long-term education)
2. **Keywords**: Searches in `diagnostic`, `notes`, and `typeConsultation` fields
3. **Gender**: Uses patient gender from associated Patient record
4. **Aggregation**: Groups by category, dispensaire, and gender

### Keywords Mapping

**Short-term education keywords:**
- fanabeazana fohy
- éducation courte
- formation courte
- sensibilisation
- court terme
- tsy maharitra

**Long-term education keywords:**
- fanabeazana lava
- éducation longue
- formation longue
- formation continue
- long terme
- maharitra

**General education keywords** (defaults to short-term):
- éducation
- fanabeazana
- formation
- sensibilisation

### Example Usage

#### Basic query (all education, all dispensaires, Q1 2025)
```graphql
query {
  educationByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    category
    zones {
      id
      name
      male
      female
    }
    totalMale
    totalFemale
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "educationByZone": [
      {
        "category": "Fanabeazana aiza tsy maharitra",
        "zones": [
          { "id": "uuid-1", "name": "Ampitsopitsoka", "male": 8, "female": 10 },
          { "id": "uuid-2", "name": "Boeny Aranta", "male": 6, "female": 9 },
          { "id": "uuid-3", "name": "Ankelitaly", "male": 5, "female": 7 }
        ],
        "totalMale": 19,
        "totalFemale": 26
      },
      {
        "category": "Fanabeazana aiza maharitra",
        "zones": [
          { "id": "uuid-1", "name": "Ampitsopitsoka", "male": 12, "female": 15 },
          { "id": "uuid-2", "name": "Boeny Aranta", "male": 10, "female": 13 },
          { "id": "uuid-3", "name": "Ankelitaly", "male": 8, "female": 11 }
        ],
        "totalMale": 30,
        "totalFemale": 39
      }
    ]
  }
}
```

#### Filtered by specific dispensaires
```graphql
query {
  educationByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["uuid-1", "uuid-2"]
  ) {
    category
    zones {
      name
      male
      female
    }
    totalMale
    totalFemale
  }
}
```

### Use Cases

1. **Tatitra Section III**: Generate the "Fandriandram-piterahana" section with education category × dispensaire × gender cross-tabulation
2. **Education Analytics**: Track education activities by location and type
3. **Gender Analysis**: Compare male vs female participation in education programs
4. **Comparative Analysis**: Compare education activity patterns between different dispensaires

### Performance

- Uses optimized queries with patient joins for gender information
- Typical response time: <1 second for datasets with thousands of consultations
- Indexed on `dateConsultation`, `dispensaireId`, and `patientId` for fast filtering

### Data Quality Notes

1. **Keyword-based**: This query relies on keyword matching in consultation data. For more accurate tracking, consider creating a dedicated EducationActivity model.
2. **Gender mapping**: Gender codes M/L are treated as male, F as female
3. **Zero counts**: Returns zero counts for dispensaires with no education activities
4. **Default categorization**: General education keywords without specific short/long term indicators default to short-term

---

## Maternal Health by Zone

Query maternal health statistics grouped by dispensaire for Tatitra Section IV (MOMBA IREO RENY BEVOAKA - Santé Maternelle).

### Query

```graphql
maternalHealthByZone(
  dateFrom: String!
  dateTo: String!
  dispensaireIds: [ID!]
): [MaternalHealthByZone!]!
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `dateFrom` | String | Yes | - | Start date in ISO format (YYYY-MM-DD) |
| `dateTo` | String | Yes | - | End date in ISO format (YYYY-MM-DD) |
| `dispensaireIds` | [ID!] | No | all active | Optional array of dispensaire IDs to filter |

### Response Type

```graphql
type MaternalHealthByZone {
  indicator: String!                              # Maternal health indicator name
  dispensaires: [DispensaireMaternalCount!]!     # Count per dispensaire
  total: Int!                                     # Total across all dispensaires
}

type DispensaireMaternalCount {
  id: ID!         # Dispensaire ID
  name: String!   # Dispensaire name
  count: Int!     # Number of cases for this indicator
}
```

### Indicators

The query returns statistics for the following maternal health indicators:

1. **Femmes ayant passé à la CPN** (Women who had prenatal consultations)
   - TypeConsultation: `CPN`
   - Keywords: cpn, consultation prénatale, prénatal, grossesse

2. **Femmes enceintes ayant fait le Test VIH** (Pregnant women who had HIV test)
   - TypeConsultation: `IST`
   - Keywords: vih, hiv, test vih, dépistage vih + pregnancy context (enceinte, grossesse)

3. **Femmes enceintes ayant fait le Test sérologique** (Pregnant women who had serological test)
   - TypeConsultation: `PREVENTIF`
   - Keywords: sérologique, test sérologique, syphilis + pregnancy context (enceinte, grossesse)

4. **Accouchements** (Deliveries)
   - TypeConsultation: `ACCOUCHEMENT`
   - Keywords: accouchement, naissance, délivrance, parturition

### Data Source

This query analyzes consultation records (`DataEntry`) with the following filters:
1. **Gender filter**: Only female patients (sexe = 'F')
2. **Type consultation**: Specific consultation types (CPN, IST, PREVENTIF, ACCOUCHEMENT)
3. **Keyword matching**: Text analysis of `diagnostic` and `notes` fields
4. **Pregnancy context**: For HIV and serological tests, requires both test keywords AND pregnancy context

### Example Usage

#### Basic query (all dispensaires)

```graphql
query {
  maternalHealthByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    indicator
    dispensaires {
      id
      name
      count
    }
    total
  }
}
```

**Expected Response:**

```json
{
  "data": {
    "maternalHealthByZone": [
      {
        "indicator": "Femmes ayant passé à la CPN",
        "dispensaires": [
          {
            "id": "abc-123",
            "name": "Ampitsopitsoka",
            "count": 35
          },
          {
            "id": "def-456",
            "name": "Boeny Aranta",
            "count": 30
          }
        ],
        "total": 65
      },
      {
        "indicator": "Femmes enceintes ayant fait le Test VIH",
        "dispensaires": [
          {
            "id": "abc-123",
            "name": "Ampitsopitsoka",
            "count": 32
          },
          {
            "id": "def-456",
            "name": "Boeny Aranta",
            "count": 28
          }
        ],
        "total": 60
      }
    ]
  }
}
```

#### Filtered by dispensaires

```graphql
query {
  maternalHealthByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["abc-123", "def-456"]
  ) {
    indicator
    total
  }
}
```

### Use Cases

1. **Tatitra Reports**: Generate Section IV of quarterly Tatitra reports
2. **Maternal Health Monitoring**: Track prenatal care and delivery statistics
3. **HIV/Syphilis Screening**: Monitor screening rates among pregnant women
4. **Comparative Analysis**: Compare maternal health service delivery across dispensaires

### Performance

- Uses optimized queries with patient joins for gender filtering
- Separate queries per indicator for better performance
- Typical response time: <2 seconds for datasets with thousands of consultations
- Indexed on `dateConsultation`, `dispensaireId`, `typeConsultation`, and `patientId` for fast filtering

### Data Quality Notes

1. **Gender-specific**: Only counts consultations for female patients (sexe = 'F')
2. **Keyword-based detection**: Relies on keyword matching in diagnostic and notes fields
3. **Pregnancy context validation**: HIV and serological tests require pregnancy context keywords
4. **Zero counts**: Returns zero counts for dispensaires with no matching consultations
5. **TypeConsultation mapping**: Uses existing consultation types (CPN, IST, PREVENTIF, ACCOUCHEMENT)

### Recommendations

For improved data quality and accuracy:
1. Use structured data entry for maternal health indicators
2. Ensure consistent terminology in diagnostic and notes fields
3. Consider creating a dedicated MaternalHealth model for precise tracking
4. Train staff to use standard keywords in consultations

---

## Events by Zone

Query awareness activities and sensibilization events grouped by dispensaire for Tatitra reports Section V: FANENTANANA NATAO.

### Query

```graphql
eventsByZone(
  dateFrom: String!
  dateTo: String!
  dispensaireIds: [ID!]
): [EventsByZone!]!
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateFrom` | String | Yes | Start date in ISO format (YYYY-MM-DD) |
| `dateTo` | String | Yes | End date in ISO format (YYYY-MM-DD) |
| `dispensaireIds` | [ID!] | No | Filter by specific dispensaires (returns all if not provided) |

### Response Type

```graphql
type EventsByZone {
  zone: String!                # Dispensaire name
  zoneId: ID!                  # Dispensaire ID
  events: [EventData!]!        # List of events for this zone
  totalParticipants: Int!      # Sum of all participants across events
  totalSessions: Int!          # Number of events/sessions
}

type EventData {
  theme: String!               # Event theme/type (from type_event)
  participants: Int!           # Number of participants
  date: String!                # Event date formatted in French (DD/MM/YYYY)
  sessions: Int                # Number of sessions (always 1 per event)
}
```

### Data Source

This query uses the `Event` model with the following filters:
- **Status**: Only includes events with status `termine` (completed) or `en_cours` (ongoing)
- **Date Range**: Filters events between `dateFrom` and `dateTo`
- **Active Events**: Only includes events where `isActive = true`
- **Dispensaire Association**: Groups by `dispensaireId`

### Example Usage

#### Basic query (all dispensaires for Q1 2025)
```graphql
query {
  eventsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
  ) {
    zone
    zoneId
    events {
      theme
      participants
      date
      sessions
    }
    totalParticipants
    totalSessions
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "eventsByZone": [
      {
        "zone": "Ampitsopitsoka",
        "zoneId": "abc-123-def-456",
        "events": [
          {
            "theme": "Allaitement exclusif",
            "participants": 30,
            "date": "15/01/2025",
            "sessions": 1
          },
          {
            "theme": "Planification familiale",
            "participants": 45,
            "date": "22/01/2025",
            "sessions": 1
          }
        ],
        "totalParticipants": 75,
        "totalSessions": 2
      },
      {
        "zone": "Boeny Aranta",
        "zoneId": "xyz-789-uvw-012",
        "events": [
          {
            "theme": "Prévention paludisme",
            "participants": 50,
            "date": "18/01/2025",
            "sessions": 1
          }
        ],
        "totalParticipants": 50,
        "totalSessions": 1
      },
      {
        "zone": "Ankelitaly",
        "zoneId": "ghi-345-jkl-678",
        "events": [],
        "totalParticipants": 0,
        "totalSessions": 0
      }
    ]
  }
}
```

#### Filtered by specific dispensaires
```graphql
query {
  eventsByZone(
    dateFrom: "2025-01-01"
    dateTo: "2025-03-31"
    dispensaireIds: ["abc-123-def-456", "xyz-789-uvw-012"]
  ) {
    zone
    totalParticipants
    totalSessions
    events {
      theme
      participants
      date
    }
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "eventsByZone": [
      {
        "zone": "Ampitsopitsoka",
        "totalParticipants": 75,
        "totalSessions": 2,
        "events": [
          {
            "theme": "Allaitement exclusif",
            "participants": 30,
            "date": "15/01/2025"
          },
          {
            "theme": "Planification familiale",
            "participants": 45,
            "date": "22/01/2025"
          }
        ]
      },
      {
        "zone": "Boeny Aranta",
        "totalParticipants": 50,
        "totalSessions": 1,
        "events": [
          {
            "theme": "Prévention paludisme",
            "participants": 50,
            "date": "18/01/2025"
          }
        ]
      }
    ]
  }
}
```

### Response Characteristics

- **All Dispensaires Included**: All active dispensaires are returned, even if they have no events (with empty events array and 0 totals)
- **Event Sorting**: Events are sorted by date in ascending order within each zone
- **Zone Sorting**: Zones are sorted alphabetically by name
- **Sessions Count**: Each event counts as 1 session
- **Date Format**: Dates are formatted in French locale (DD/MM/YYYY)

### Use Cases

1. **Tatitra Section V**: Display awareness/sensitization events for quarterly reports
2. **Event Analytics**: Analyze participation trends across different zones
3. **Activity Tracking**: Monitor outreach activities by dispensaire
4. **Report Generation**: Export event data for PDF reports

### Performance

- **Single Query**: Retrieves all necessary data in one database query per dispensaire
- **Efficient Grouping**: Uses in-memory aggregation for zone grouping
- **Response Time**: < 1 second for typical data volumes (100-200 events)

### Notes

- Events with status `planifie` (planned) or `annule` (cancelled) are excluded
- Events without a `dispensaireId` are not included in the results
- The `sessions` field is always 1 per event (for future enhancement if sessions tracking is added)
- Totals are calculated server-side to ensure accuracy

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
