# Tatitra Quarterly Report Export Feature

## Overview
This feature enables the export of quarterly statistical reports (Tatitra) in PDF format for CSB Loterana. The reports follow a specific format matching traditional health reporting requirements for Madagascar health centers.

## Features

### Report Sections
The Tatitra report includes two main sections:

#### 1. Section 1: Health Statistics by Age Group (MAHAKASIKA NY ASA FITORIANA)
- Prayer meetings count
- Visitors received count
- Birth statistics by zone and gender
  - Children (0-12 years): Zaza (12 taona noho midina)
  - Youth (13-30 years): Tanora (13 taona - 30 taona)
  - Adults (30+ years): Olon-dehibe maherin'ny 30 taona

#### 2. Section 2: Medical Consultations by Disease (MAHAKASIKA NY ASA FITSABOANA)
- Disease classifications by zone
- Consultation counts
- Categorized by disease type
- Support for subcategories

### Zones Included
The report aggregates data across multiple zones:
- Ampitsopitsoka
- Boeny Aranta
- Ankelitaly
- Ampanasina
- Mananara
- Onara
- Andamonty
- Fitambarany (Total column)

## Usage

### Frontend (Web Interface)

1. Navigate to the **Reports & Analytics** page
2. Click the **"Rapport Tatitra"** button (purple gradient button)
3. In the modal that opens:
   - Select the desired quarter:
     - VOALOHANY (Q1: January-March)
     - FAHAROA (Q2: April-June)
     - FAHATELO (Q3: July-September)
     - EFATRA (Q4: October-December)
   - Select the year (current year and 4 previous years available)
4. Click **"Exporter PDF"** button
5. The PDF will be generated and automatically downloaded

### Backend (GraphQL API)

#### Mutation
```graphql
mutation ExportTatitraReport($quarter: String!, $year: Int!, $dispensaireId: ID) {
  exportTatitraReport(quarter: $quarter, year: $year, dispensaireId: $dispensaireId) {
    success
    message
    url
    fileName
  }
}
```

#### Parameters
- `quarter` (required): Quarter identifier in Malagasy
  - Valid values: "VOALOHANY", "FAHAROA", "FAHATELO", "EFATRA"
- `year` (required): Four-digit year (e.g., 2024)
- `dispensaireId` (optional): Filter by specific dispensary/zone
  - If omitted, includes all zones

#### Response
```json
{
  "success": true,
  "message": "Rapport Tatitra QEFATRA 2024 généré avec succès",
  "url": "http://localhost:4000/download/tatitra_EFATRA_2024_1762759597158.pdf",
  "fileName": "tatitra_EFATRA_2024_1762759597158.pdf"
}
```

## Implementation Details

### Backend Components

#### 1. PDF Generator (`tatitraPdfGenerator.js`)
- Located: `backend/src/utils/export/tatitraPdfGenerator.js`
- Uses: PDFKit library
- Features:
  - A4 page size
  - Multi-page support with automatic page numbering
  - Proper table formatting with borders
  - Mixed Malagasy/French text support
  - Header section with CSB information
  - Structured data tables

#### 2. GraphQL Resolver
- Located: `backend/src/graphql/resolvers/reports.js`
- Functions:
  - `exportTatitraReport`: Main mutation handler
  - `aggregateBirthsByZone`: Aggregates birth data by age group and zone
  - `aggregateDiseasesByZone`: Aggregates disease consultation data

#### 3. Data Aggregation
The system automatically:
- Calculates date ranges based on quarter selection
- Filters consultations by date range and dispensary
- Groups patients by age categories
- Aggregates disease diagnoses using structured categories
- Counts consultations per zone
- Generates totals across all zones

### Frontend Components

#### 1. TatitraExportModal Component
- Located: `web/src/components/TatitraExportModal.jsx`
- Features:
  - Quarter selection dropdown (Q1-Q4)
  - Year selection (current year - 4 years)
  - Loading state during generation
  - Responsive modal design
  - Accessible keyboard navigation

#### 2. Reports Page Integration
- Located: `web/src/pages/Reports.jsx`
- Changes:
  - Added "Rapport Tatitra" button
  - Integrated modal component
  - Connected to service layer
  - Toast notifications for success/error

#### 3. Service Layer
- Located: `web/src/services/reports.js`
- Function: `exportTatitraReport(quarter, year, dispensaireId)`
- Handles GraphQL mutation and error handling

## File Structure

```
backend/
├── src/
│   ├── graphql/
│   │   ├── resolvers/
│   │   │   └── reports.js (mutation handler)
│   │   └── schema.graphql (GraphQL schema)
│   └── utils/
│       └── export/
│           └── tatitraPdfGenerator.js (PDF generator)
└── exports/ (generated PDFs)

web/
├── src/
│   ├── components/
│   │   ├── TatitraExportModal.jsx
│   │   └── TatitraExportModal.module.css
│   ├── pages/
│   │   ├── Reports.jsx
│   │   └── Reports.module.css
│   └── services/
│       └── reports.js
```

## Testing

### Manual Testing
1. Run the test script:
   ```bash
   cd backend
   node test-tatitra-pdf.js
   ```

2. Check the generated PDF in `backend/exports/`

### Integration Testing
The feature integrates with existing:
- Patient records (age, gender)
- Consultation data (date, diagnosis)
- Dispensary/zone data
- Disease category system

## Notes and Considerations

### Data Requirements
- Consultations must have associated patients with age and gender
- Disease diagnoses should use structured categories (CategorieMaladie) for best results
- Dispensaries must be properly configured with correct names

### PDF Formatting
- The PDF follows the exact format shown in reference images
- Tables are designed to fit A4 paper size
- Print-friendly for official reporting
- Page breaks automatically handled for long reports

### Performance
- Large date ranges may result in longer generation times
- PDF generation is done server-side for consistency
- Files are temporarily stored in exports directory
- Consider cleanup strategy for old PDFs

### Future Enhancements
- Email delivery option
- Scheduled automatic generation
- Multi-language support
- Additional report formats (Excel, CSV)
- Customizable templates for different CSB types
- Batch export for multiple quarters

## Troubleshooting

### Common Issues

**Issue**: PDF not generating
- Check database connection
- Verify date range has data
- Check console for errors

**Issue**: Missing data in report
- Verify consultations exist for the selected period
- Check patient records have age/gender
- Ensure disease categories are properly assigned

**Issue**: Download fails
- Check exports directory permissions
- Verify API_BASE_URL environment variable
- Check network connectivity

## Support
For issues or questions, please create an issue in the repository with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Console error messages (if any)
