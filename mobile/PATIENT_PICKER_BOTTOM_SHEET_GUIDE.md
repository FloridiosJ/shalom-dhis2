# PatientPickerBottomSheet Component

## Overview

`PatientPickerBottomSheet` is a reusable React Native component for selecting patients through an elegant bottom sheet interface. It provides a smooth user experience with features like debounced search, keyboard management, and accessibility support.

## Features

- ✅ **Bottom Sheet Interface**: Uses `@gorhom/bottom-sheet` for smooth native animations
- ✅ **Debounced Search**: 300ms debounce to optimize API calls and performance
- ✅ **Keyboard Management**: Automatic keyboard dismissal on scroll and selection
- ✅ **Loading States**: Visual feedback during data fetching
- ✅ **Empty States**: Contextual messages and actions when no results found
- ✅ **Create Patient Action**: Quick access to patient creation when search yields no results
- ✅ **Accessibility**: Full accessibility support with proper labels and roles
- ✅ **Error Handling**: Clear error display with form validation integration

## Installation

The component requires the following dependencies (already included in the project):

```json
{
  "@gorhom/bottom-sheet": "^5.2.6",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "^4.1.5",
  "react-native-paper": "^5.14.5",
  "react-native-vector-icons": "^10.3.0"
}
```

## Usage

### Basic Example

```tsx
import PatientPickerBottomSheet from '../components/form/PatientPickerBottomSheet';

function NewConsultationScreen() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearchPatients = (query: string) => {
    // Filter patients based on search query
    // This is already debounced by the component
    const filtered = allPatients.filter(
      p =>
        p.displayName.toLowerCase().includes(query.toLowerCase()) ||
        p.numeroPatient.toLowerCase().includes(query.toLowerCase()),
    );
    setPatients(filtered);
  };

  const handleCreatePatient = () => {
    navigation.navigate('CreatePatient');
  };

  return (
    <PatientPickerBottomSheet
      value={patientId}
      onChange={setPatientId}
      onCreatePatient={handleCreatePatient}
      patients={patients}
      onSearchPatients={handleSearchPatients}
      loading={loading}
    />
  );
}
```

### With react-hook-form

```tsx
import {Controller} from 'react-hook-form';

<Controller
  control={control}
  name="patientId"
  render={({field: {onChange, value}}) => (
    <PatientPickerBottomSheet
      value={value}
      onChange={onChange}
      onCreatePatient={handleCreatePatient}
      error={errors.patientId?.message}
      patients={filteredPatients}
      onSearchPatients={handleSearchPatients}
      loading={loadingPatients}
    />
  )}
/>
```

### With Apollo Client

```tsx
import {useQuery} from '@apollo/client';
import {GET_PATIENTS} from '../services/patientService';

function MyComponent() {
  const [filteredPatients, setFilteredPatients] = useState([]);
  const {data, loading} = useQuery(GET_PATIENTS);

  useEffect(() => {
    if (data?.patients?.patients) {
      const patientOptions = data.patients.patients.map(p => ({
        id: p.id,
        displayName: p.displayName,
        numeroPatient: p.numeroPatient,
      }));
      setFilteredPatients(patientOptions);
    }
  }, [data]);

  const handleSearch = (query: string) => {
    // Local filtering (search is already debounced)
    if (!query.trim()) {
      setFilteredPatients(data?.patients?.patients || []);
      return;
    }
    
    const filtered = (data?.patients?.patients || []).filter(
      p =>
        p.displayName.toLowerCase().includes(query.toLowerCase()) ||
        p.numeroPatient.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredPatients(filtered);
  };

  return (
    <PatientPickerBottomSheet
      value={patientId}
      onChange={setPatientId}
      onCreatePatient={handleCreatePatient}
      patients={filteredPatients}
      onSearchPatients={handleSearch}
      loading={loading}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string \| null` | Yes | Currently selected patient ID |
| `onChange` | `(patientId: string \| null) => void` | Yes | Callback when patient is selected or cleared |
| `onCreatePatient` | `() => void` | Yes | Callback when "Create new patient" is clicked |
| `patients` | `PatientOption[]` | Yes | Array of patient options to display |
| `onSearchPatients` | `(query: string) => void` | Yes | Callback for search query changes (already debounced) |
| `loading` | `boolean` | No | Whether patients are being loaded |
| `error` | `string` | No | Error message to display |

### PatientOption Type

```typescript
interface PatientOption {
  id: string;
  displayName: string;
  numeroPatient: string;
}
```

## Features in Detail

### 1. Debounced Search

The component uses a custom `useDebounce` hook with a 300ms delay to optimize search performance:

```typescript
const debouncedSearchQuery = useDebounce(searchQuery, 300);
```

This means:
- User types are captured immediately for instant visual feedback
- API calls/filtering only happen 300ms after the user stops typing
- Reduces unnecessary API calls and improves performance

### 2. Keyboard Management

The bottom sheet automatically handles keyboard behavior:
- **On Scroll**: Keyboard is dismissed when user scrolls the patient list
- **On Selection**: Keyboard is dismissed when a patient is selected
- **On Close**: Keyboard is dismissed when bottom sheet is closed
- **Interactive Mode**: Keyboard behavior is set to `"interactive"` for smooth animations

### 3. Empty States

The component shows different messages based on context:

1. **Initial state** (no search): "Recherchez un patient par nom ou identifiant"
2. **Loading**: Shows spinner with "Recherche en cours..."
3. **No results**: "Aucun patient trouvé" + Create patient button

### 4. Accessibility

Full accessibility support including:
- Proper `accessibilityRole` attributes
- `accessibilityLabel` for screen readers
- `accessibilityHint` for context
- Minimum touch target sizes (44x44 points)
- Clear focus states

### 5. Bottom Sheet Snap Points

The bottom sheet has two snap points:
- **75%**: Default expanded height
- **90%**: Maximum expanded height for better visibility on smaller devices

Users can:
- Pull down to close
- Tap backdrop to close
- Use Android back button to close

## Styling

The component uses a predefined style following the app's design system:

- **Primary Color**: `#2196F3` (Blue)
- **Text Colors**: 
  - Primary: `#212121`
  - Secondary: `#757575`
  - Placeholder: `#9E9E9E`
- **Border Colors**: `#E0E0E0`
- **Error Color**: `#D32F2F`

## Testing

Tests are available in `__tests__/PatientPickerBottomSheet.test.tsx`:

```bash
npm test PatientPickerBottomSheet.test.tsx
```

Test coverage includes:
- ✅ Rendering with no selection
- ✅ Rendering with selected patient
- ✅ Error state display
- ✅ Loading state
- ✅ Empty patient list
- ✅ Selected patient information display

## Performance Considerations

1. **Debouncing**: Search queries are debounced to reduce unnecessary calls
2. **Memoization**: Callbacks are memoized with `useCallback` to prevent unnecessary re-renders
3. **FlatList**: Uses `BottomSheetFlatList` for efficient rendering of large patient lists
4. **Keyboard Dismissal**: Prevents keyboard from staying open unnecessarily

## Future Enhancements

Potential improvements for future versions:

1. **Pagination**: Add support for paginated patient lists
2. **Lazy Loading**: Load more patients as user scrolls
3. **Fuzzy Search**: Implement fuzzy search for better name matching
4. **Patient Photos**: Display patient photos in the list
5. **Additional Info**: Show more patient details (age, gender, etc.)
6. **Recent Patients**: Show recently selected patients at the top
7. **Favorites**: Allow marking patients as favorites for quick access

## Troubleshooting

### Bottom sheet not appearing

Make sure your app is wrapped with `GestureHandlerRootView`:

```tsx
import {GestureHandlerRootView} from 'react-native-gesture-handler';

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* Your app content */}
    </GestureHandlerRootView>
  );
}
```

### Keyboard not dismissing

Ensure you've set `keyboardShouldPersistTaps="handled"` on parent ScrollView components.

### Search not working

The `onSearchPatients` callback receives the debounced query. Make sure to:
1. Use the query parameter provided to the callback
2. Don't add additional debouncing in your implementation
3. Handle empty query (return all patients)

## Related Components

- `PatientPicker`: Original modal-based patient picker (legacy)
- `useDebounce`: Hook for debouncing values
- `useConsultationForm`: Hook that integrates this component

## License

This component is part of the Shalom DHIS2 mobile application.
