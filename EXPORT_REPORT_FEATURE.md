# Export Report Feature - Documentation

## Overview
The Export Report feature allows users to download consultation reports in CSV or PDF format with customizable filters. This document describes the implementation and usage of this feature.

## Features

### Export Formats
- **CSV**: Comma-separated values format, ideal for data analysis in spreadsheet applications
- **PDF**: Formatted report with title, filters, and data table

### Filters
The export respects the following filters from the Reports page:
- **Date Range**: Start date and end date for consultations
- **Dispensaire**: Filter by specific health facility (or all)
- **Type Consultation**: Filter by consultation type (optional)

### Data Included
Each export includes the following fields:
- ID
- Date Consultation
- Patient Name and Number
- Type Consultation
- Diagnostic
- Prescription
- Dispensaire Name
- Agent Name
- Status

## Backend Implementation

### Dependencies
- `json2csv` - CSV generation
- `pdfkit` - PDF generation

### File Structure
```
backend/
├── src/
│   ├── utils/
│   │   └── export/
│   │       ├── csvGenerator.js    # CSV generation utility
│   │       └── pdfGenerator.js    # PDF generation utility
│   ├── graphql/
│   │   └── resolvers/
│   │       └── reports.js         # exportReport mutation
│   └── server.js                  # Download endpoint
└── exports/                       # Temporary file storage (gitignored)
    └── .gitignore
```

### GraphQL Mutation
```graphql
mutation ExportReport($format: String!, $filters: ReportFiltersInput!) {
  exportReport(format: $format, filters: $filters) {
    success
    message
    url
    fileName
  }
}
```

### REST Endpoint
```
GET /download/:filename
```
Downloads the generated export file with appropriate Content-Type headers.

### File Management
- Files are stored in `backend/exports/` directory
- Automatic cleanup runs every 6 hours
- Files older than 24 hours are automatically deleted
- Exports directory is gitignored to prevent version control issues

### Error Handling
The mutation handles:
- Invalid format (non-CSV/PDF)
- No data available for filters
- File generation errors
- Database query errors

## Frontend Implementation

### Export UI
Located in `web/src/pages/Reports.jsx`:
- Two export buttons: "Exporter CSV" and "Exporter PDF"
- Loading state while export is being generated
- Success/error messages displayed to user
- Automatic download when export is ready

### Export Service
Located in `web/src/services/reports.js`:
```javascript
exportReport(format, filters)
```

### User Flow
1. User applies filters (date range, dispensaire, etc.)
2. User clicks "Exporter CSV" or "Exporter PDF" button
3. Export button shows "Export en cours..." loading state
4. Success message appears with file name
5. Browser automatically downloads the file
6. Message disappears after 5 seconds

## Usage

### From Frontend
1. Navigate to the Reports & Analytics page
2. Apply desired filters (optional):
   - Select a dispensaire or keep "Tous les dispensaires"
   - Choose a period (day/week/month/year)
   - Set date range
3. Click "Exporter CSV" or "Exporter PDF"
4. Wait for the export to complete
5. File will be automatically downloaded

### From GraphQL API
```graphql
mutation {
  exportReport(
    format: "csv"
    filters: {
      startDate: "2025-01-01"
      endDate: "2025-01-31"
      dispensaireId: "disp-123"
    }
  ) {
    success
    message
    url
    fileName
  }
}
```

Then use the returned URL to download the file:
```
GET http://localhost:4000/download/report_1234567890.csv
```

## Testing

### Unit Tests
Two test scripts are provided:

1. **test-export.js** - Basic functionality test
   ```bash
   cd backend
   node test-export.js
   ```
   Tests both CSV and PDF generation with sample data.

2. **test-export-samples.js** - Generate sample files
   ```bash
   cd backend
   node test-export-samples.js
   ```
   Generates sample CSV and PDF files for manual inspection.

### Manual Testing
1. Start the backend server
2. Start the frontend application
3. Login with valid credentials
4. Navigate to Reports & Analytics
5. Test CSV export with various filters
6. Test PDF export with various filters
7. Verify files are downloaded correctly
8. Check file content is accurate

## Configuration

### Environment Variables
```bash
# Optional: Set custom API base URL for download links
API_BASE_URL=http://localhost:4000
```

If not set, defaults to `http://localhost:4000`.

### File Size Limits
- Maximum 1000 consultations per export (prevents performance issues)
- Can be adjusted in `reports.js` resolver if needed

### Cleanup Schedule
- Runs every 6 hours (configurable in `server.js`)
- Files older than 24 hours are deleted

## Troubleshooting

### Export button doesn't work
- Check browser console for errors
- Verify backend is running
- Check authentication token is valid

### No data in export
- Verify filters are correct
- Check that consultations exist for the selected period
- Ensure user has access to the selected dispensaire

### Download fails
- Check that file exists in `backend/exports/` directory
- Verify download endpoint is accessible
- Check file hasn't been cleaned up already

### PDF formatting issues
- Check PDFKit is installed correctly
- Verify sample data doesn't have special characters causing issues

## Future Improvements

Potential enhancements not in current scope:
- Asynchronous job queue for large exports
- Email notification when export is ready
- Excel format support
- Custom column selection
- Scheduled/recurring exports
- Export history and download tracking

## Security Considerations

- Authentication required for export mutation
- User can only export data they have access to
- Files are temporarily stored and auto-deleted
- Download endpoint doesn't allow directory traversal
- File names are auto-generated (no user input in filename)

## License
Part of the Shalom DHIS2 project.
