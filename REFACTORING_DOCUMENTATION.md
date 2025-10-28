# Refactoring Documentation

This document describes the refactoring performed on `DataEntries.jsx` and `CreateDataEntryModal.jsx` to improve code maintainability and reusability.

## Summary

The refactoring extracted reusable components and custom hooks from two large files, reducing code complexity and improving maintainability while maintaining the exact same functionality.

### File Size Reduction
- **DataEntries.jsx**: 457 lines → 340 lines (26% reduction)
- **CreateDataEntryModal.jsx**: 773 lines → 394 lines (49% reduction)

## Extracted Components

### From DataEntries.jsx

#### 1. SearchBar Component
**Location**: `web/src/components/SearchBar.jsx`

A reusable search input component for filtering data.

**Props**:
- `value` (string): Current search value
- `onChange` (Function): Callback when search value changes
- `placeholder` (string): Placeholder text for the input
- `className` (string): Optional additional CSS class

**Usage**:
```jsx
<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Rechercher par patient, diagnostic, date..."
/>
```

#### 2. Pagination Component
**Location**: `web/src/components/Pagination.jsx`

A reusable pagination component for navigating through pages of data.

**Props**:
- `currentPage` (number): Current page number (1-indexed)
- `totalPages` (number): Total number of pages
- `totalItems` (number): Total number of items
- `startIndex` (number): Index of first item on current page (0-indexed)
- `endIndex` (number): Index of last item on current page (0-indexed)
- `onPageChange` (Function): Callback when page changes

**Usage**:
```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredEntries.length}
  startIndex={indexOfFirstItem}
  endIndex={indexOfLastItem}
  onPageChange={handlePageChange}
/>
```

#### 3. DataEntryRow Component
**Location**: `web/src/components/DataEntryRow.jsx`

Renders a single data entry row in the table with formatted date, patient info, diagnostic, prescription, and action buttons.

**Props**:
- `entry` (Object): The data entry object
- `onEdit` (Function): Callback when edit button is clicked
- `onDelete` (Function): Callback when delete button is clicked

**Usage**:
```jsx
<DataEntryRow
  key={entry.id}
  entry={entry}
  onEdit={(entry) => { /* handle edit */ }}
  onDelete={(entry) => { /* handle delete */ }}
/>
```

#### 4. useSortedPaginatedData Hook
**Location**: `web/src/hooks/useSortedPaginatedData.js`

Custom hook for managing sorting and pagination of data arrays.

**Parameters**:
- `data` (Array): The data array to sort and paginate
- `options` (Object):
  - `itemsPerPage` (number): Number of items per page
  - `initialSortColumn` (string): Initial column to sort by
  - `initialSortDirection` (string): Initial sort direction ('asc' or 'desc')
  - `getSortValue` (Function): Function to extract sort value from an item given column name

**Returns**: Object containing:
- `currentItems`: Current page's items
- `sortedData`: All sorted data
- `sortColumn`: Current sort column
- `sortDirection`: Current sort direction
- `handleSort`: Function to change sorting
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `indexOfFirstItem`: Index of first item on current page
- `indexOfLastItem`: Index of last item on current page
- `handlePageChange`: Function to change page

**Usage**:
```jsx
const {
  currentItems,
  sortColumn,
  sortDirection,
  handleSort,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  handlePageChange,
} = useSortedPaginatedData(filteredEntries, {
  itemsPerPage: 10,
  initialSortColumn: "dateConsultation",
  initialSortDirection: "desc",
  getSortValue: (entry, column) => { /* return sort value */ },
});
```

### From CreateDataEntryModal.jsx

#### 5. PatientAutocomplete Component
**Location**: `web/src/components/PatientAutocomplete.jsx`

Autocomplete input for patient selection with search, filtering, and patient creation functionality.

**Props**:
- `value` (string): Current patient full name value
- `patientId` (string): Selected patient ID
- `numeroPatient` (string): Selected patient number
- `patients` (Array): Array of patient objects
- `onChange` (Function): Callback when input changes (value, patientId, numeroPatient)
- `onCreatePatient` (Function): Optional callback when "Create Patient" is clicked
- `disabled` (boolean): Whether input is disabled
- `isEdit` (boolean): Whether in edit mode
- `loading` (boolean): Whether form is loading
- `error` (string): Error message to display

**Usage**:
```jsx
<PatientAutocomplete
  value={form.fullName}
  patientId={form.patientId}
  numeroPatient={form.numeroPatient}
  patients={patients}
  onChange={(fullName, patientId, numeroPatient) => {
    setForm(f => ({ ...f, fullName, patientId, numeroPatient }));
  }}
  onCreatePatient={handleCreatePatient}
  isEdit={isEdit}
  loading={loading}
  error={errors.patientId}
/>
```

#### 6. CategoriesSelector Component
**Location**: `web/src/components/CategoriesSelector.jsx`

Manages disease category selection with search, principal category marking, and notes.

**Props**:
- `categories` (Array): Array of all available categories
- `selectedCategories` (Array): Array of selected categories with metadata
- `onChange` (Function): Callback when categories change
- `loading` (boolean): Whether form is loading
- `error` (string): Error message to display

**Usage**:
```jsx
<CategoriesSelector
  categories={categories}
  selectedCategories={selectedCategories}
  onChange={setSelectedCategories}
  loading={loading}
  error={errors.categories}
/>
```

#### 7. PrescriptionList Component
**Location**: `web/src/components/PrescriptionList.jsx`

Manages structured prescription items with add, remove, and edit functionality.

**Props**:
- `items` (Array): Array of prescription items
- `onChange` (Function): Callback when items change
- `loading` (boolean): Whether form is loading

**Usage**:
```jsx
<PrescriptionList
  items={prescriptionItems}
  onChange={setPrescriptionItems}
  loading={loading}
/>
```

## Benefits

1. **Improved Maintainability**: Each component has a single responsibility and can be modified independently
2. **Better Reusability**: Components like SearchBar, Pagination, and PatientAutocomplete can be reused in other parts of the application
3. **Easier Testing**: Smaller, focused components are easier to test in isolation
4. **Enhanced Readability**: Main files are now more readable with clear component composition
5. **Separation of Concerns**: Business logic (hooks) is separated from presentation (components)

## Migration Notes

### No Breaking Changes
All refactored code maintains the exact same API and functionality as before. No changes are required in parent components or services.

### Styles
All CSS modules remain unchanged and are properly referenced in the extracted components.

### Future Improvements
- Consider adding unit tests for each extracted component
- Consider extracting table header into a separate component if needed elsewhere
- Consider creating a generic AutocompleteInput component for other use cases

## Validation

- ✅ Build passes successfully
- ✅ No new linting errors introduced
- ✅ All functionality preserved
- ✅ File sizes significantly reduced
