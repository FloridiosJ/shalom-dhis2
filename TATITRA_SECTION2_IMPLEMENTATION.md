# Tatitra PDF - Section 2 Enhancement Implementation

## Overview
This document describes the enhancement made to Section 2 of the Tatitra quarterly report PDF export, as requested in the issue "Ajouter la section MAHAKASIKA NY ASA FITSABOANA à l'export Tatitra PDF".

## Changes Summary

### Before
Section 2 ("MAHAKASIKA NY ASA FITSABOANA") contained only:
- A single subsection showing diseases by frequency

### After
Section 2 now contains two subsections:
1. **Ny olona notsaboina** (People treated) - NEW ✨
2. **Aretina matetim-pitranga** (Diseases by frequency) - EXISTING

## Implementation Details

### 1. New Subsection: Ny olona notsaboina

#### Table Structure
| CSB | Consultant | Consultation |
|-----|------------|-------------|
| Ampitsopitsoka | XX | XX |
| Boeny Aranta | XX | XX |
| Ankelitaly | XX | XX |
| Ampanasina | XX | XX |
| Mananara | XX | XX |
| Onara | XX | XX |
| Andamonty | XX | XX |
| **Total** | **XXX** | **XXX** |

#### Column Definitions
- **CSB**: Name of the health center (dispensaire)
- **Consultant**: Number of unique patients treated in this CSB during the period
- **Consultation**: Total number of consultations performed in this CSB during the period

#### Data Calculation
The data is calculated dynamically from the database:

```javascript
// Count unique patients per CSB
const uniquePatients = new Set(consultations.map(c => c.patientId));
const consultants = uniquePatients.size;

// Count total consultations per CSB
const totalConsultations = consultations.length;
```

The **Total** row shows the sum of all consultants and consultations across all CSBs.

### 2. Existing Subsection: Aretina matetim-pitranga

This subsection was already implemented and remains unchanged. It shows:
- Diseases categorized by type
- Count of occurrences per CSB
- Total column (FITAMBARANY)

## Files Modified

### 1. Backend Resolver
**File**: `backend/src/graphql/resolvers/reports.js`

**New Function**:
```javascript
function aggregateConsultantsByZone(consultations, zones) {
  // For each zone:
  // 1. Filter consultations for that zone
  // 2. Count unique patients (using Set to deduplicate)
  // 3. Count total consultations
  // 4. Return array with totals appended
}
```

**Integration**:
```javascript
// In exportTatitraReport mutation
const consultantsSummary = aggregateConsultantsByZone(consultations, zones);

const section2Data = {
  consultantsByZone: consultantsSummary,  // NEW
  diseasesByZone: medicalData             // EXISTING
};
```

### 2. PDF Generator
**File**: `backend/src/utils/export/tatitraPdfGenerator.js`

**Modified Function**: `addSection2_AsaFitsaboana()`
- Added subsection title: "• Ny olona notsaboina :"
- Calls new `drawConsultantsTable()` function
- Maintains existing "• Aretina matetim-pitranga :" subsection

**New Function**: `drawConsultantsTable()`
- Creates 3-column table with proper formatting
- Column widths: 50% (CSB), 25% (Consultant), 25% (Consultation)
- Includes Total row in bold font
- Follows existing PDF styling conventions

**New Function**: `getDefaultConsultantsData()`
- Provides fallback data structure with zeros
- Ensures PDF generation works even with no data

### 3. Test File
**File**: `backend/test-tatitra-pdf.js`

**Changes**:
- Updated test data to include `consultantsByZone` array
- Removed "Consultants" and "Consultation" from diseases array (now separate table)

## Technical Specifications

### PDF Formatting
- **Section Title**: Font size 11pt, Bold
- **Subsection Titles**: Font size 10pt, Regular, bullet point
- **Table Headers**: Font size 9pt, Bold
- **Table Data**: Font size 8pt, Regular
- **Total Row**: Font size 9pt, Bold
- **Numbers**: Right-aligned, zero-padded (e.g., "05" not "5")

### Table Layout
- **Page**: A4 size
- **Margins**: 40pt
- **Table Width**: Page width minus margins (2 × 40pt)
- **Row Height**: 20pt for data rows, 25pt for headers, 22pt for total row
- **Cell Borders**: All cells have borders

### Data Flow
```
User Request (GraphQL Mutation)
    ↓
exportTatitraReport resolver
    ↓
Fetch Consultations (DataEntry + Patient + Dispensaire)
    ↓
aggregateConsultantsByZone()
    ├─ For each zone:
    │   ├─ Filter consultations by dispensaire.name
    │   ├─ Count unique patientId (Set deduplication)
    │   └─ Count total consultations
    └─ Calculate and append totals
    ↓
Pass to PDF Generator
    ↓
drawConsultantsTable()
    ├─ Draw header row
    ├─ Draw data rows (7 CSBs)
    └─ Draw total row (bold)
    ↓
PDF File
```

## Testing

### Test Results
```bash
$ node test-tatitra-pdf.js

✅ Tatitra PDF generated successfully!
   File: tatitra_EFATRA_2024_1762783648661.pdf
   Size: 10203 bytes
   Pages: 8

📋 Sections included:
   ✓ Section 1: Asa Fitoriana (Births by age group)
   ✓ Section 2: Asa Fitsaboana (Medical consultations)  ← ENHANCED
   ✓ Section 3: Fandriandram-piterahana (Education)
   ✓ Section 4: Momba ireo Reny Bevoaka (Maternal health)
   ✓ Section 5: Fanentanana natao (Events/Animations)

✅ Test passed!
```

### Unit Tests
```bash
$ npm test

PASS src/__tests__/reports.resolvers.integration.test.js
  Reports Resolvers - Integration Tests
    ✓ 18 tests passed
```

### Security Check
```bash
$ codeql_checker

Analysis Result for 'javascript'. Found 0 alerts:
- **javascript**: No alerts found.
```

## Example Data

### Sample consultantsByZone Array
```javascript
[
  { consultants: 32, consultations: 48 },   // Ampitsopitsoka
  { consultants: 100, consultations: 148 }, // Boeny Aranta
  { consultants: 43, consultations: 91 },   // Ankelitaly
  { consultants: 267, consultations: 278 }, // Ampanasina
  { consultants: 33, consultations: 38 },   // Mananara
  { consultants: 206, consultations: 219 }, // Onara
  { consultants: 124, consultations: 152 }, // Andamonty
  { consultants: 805, consultations: 974 }  // Total
]
```

## GraphQL Usage

### Mutation
```graphql
mutation ExportTatitraReport {
  exportTatitraReport(
    quarter: "EFATRA"
    year: 2024
    dispensaireId: null  # Optional: filter by specific CSB
  ) {
    success
    message
    url
    fileName
  }
}
```

### Response
```json
{
  "data": {
    "exportTatitraReport": {
      "success": true,
      "message": "Rapport Tatitra QEFATRA 2024 généré avec succès",
      "url": "http://localhost:4000/download/tatitra_EFATRA_2024_[timestamp].pdf",
      "fileName": "tatitra_EFATRA_2024_[timestamp].pdf"
    }
  }
}
```

## Notes

### Why Separate Consultants and Consultations?
- **Consultants**: Unique patients help understand the reach of the CSB (how many different people were served)
- **Consultations**: Total visits help understand the workload (some patients may have multiple consultations)

### Example Scenario
If a CSB has:
- Patient A: 3 consultations
- Patient B: 1 consultation
- Patient C: 2 consultations

Then:
- **Consultants**: 3 (A, B, C)
- **Consultations**: 6 (3 + 1 + 2)

This distinction is important for health statistics and reporting.

## Future Enhancements

Potential improvements that could be made:
1. Add consultation types breakdown (CPN, general, emergency, etc.)
2. Add time-based trends (comparison with previous quarter)
3. Add gender breakdown in consultants table
4. Add age group breakdown
5. Export additional formats (Excel, CSV)

## Conclusion

This enhancement successfully integrates the "Ny olona notsaboina" subsection into Section 2 of the Tatitra PDF export, providing clear visibility into the number of patients treated and consultations performed at each CSB during the reporting period.

---

**Document Version**: 1.0  
**Date**: November 10, 2025  
**Implementation Status**: ✅ Complete  
**Security Status**: ✅ No vulnerabilities found
