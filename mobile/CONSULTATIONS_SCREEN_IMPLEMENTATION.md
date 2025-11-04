# ConsultationsScreen Implementation Documentation

## Overview
This document describes the implementation of the ConsultationsScreen for the Shalom DHIS2 mobile application (React Native). The screen displays a list of consultations with filtering, search, and pagination capabilities, following best practices for UI/UX, accessibility, and performance.

## Architecture

### Screen Structure
```
ConsultationsScreen
├── SearchBar (component)
├── ConsultationFilterPills (component)
├── FlatList
│   └── ConsultationCard (component)
└── FloatingActionButton (FAB)
```

### Components

#### 1. **ConsultationsScreen** (`src/screens/ConsultationScreen.tsx`)
Main screen component that orchestrates the consultation list functionality.

**Features:**
- Search functionality for filtering consultations by patient name
- Status filtering (Tous, Brouillon, En attente, Envoyé)
- Paginated list with infinite scroll
- Pull-to-refresh capability
- Loading, error, and empty states
- Floating action button for creating new consultations
- Hamburger menu icon in the header

**State Management:**
- `consultations`: Array of consultation data
- `searchQuery`: Current search text
- `selectedFilter`: Selected status filter
- `loading`: Loading state for pagination
- `refreshing`: Refreshing state for pull-to-refresh
- `error`: Error message if fetch fails
- `page`: Current page number
- `hasMore`: Whether more pages are available

**Performance Optimizations:**
- `useCallback` for event handlers to prevent unnecessary re-renders
- `useMemo` for computed values (footer, empty state)
- FlatList optimizations:
  - `removeClippedSubviews={true}`
  - `maxToRenderPerBatch={10}`
  - `windowSize={10}`
  - `initialNumToRender={10}`
  - `keyExtractor` for efficient rendering

#### 2. **SearchBar** (`src/components/SearchBar.tsx`)
Reusable search input component.

**Props:**
- `value`: Current search text
- `onChangeText`: Callback for text changes
- `placeholder`: Placeholder text (optional)
- `accessibilityLabel`: Accessibility label (optional)

**Features:**
- Magnifying glass icon
- Minimum 44px touch target for accessibility
- Proper ARIA role (`search`)

#### 3. **ConsultationFilterPills** (`src/components/ConsultationFilterPills.tsx`)
Horizontal scrollable filter buttons.

**Props:**
- `selectedFilter`: Currently selected filter
- `onFilterChange`: Callback when filter changes

**Features:**
- Four filter options: Tous, Brouillon, En attente, Envoyé
- Visual distinction for selected filter (blue background)
- Horizontal scroll for small screens
- Minimum 44px touch targets
- Proper accessibility attributes

#### 4. **ConsultationCard** (`src/components/ConsultationCard.tsx`)
Individual consultation list item.

**Props:**
- `consultation`: Consultation data object
- `onPress`: Optional callback when card is pressed

**Features:**
- Patient name (bold)
- Diagnostic text (up to 2 lines)
- Formatted date
- Status badge with color coding:
  - Envoyé: Green (#2E7D32 on #E8F5E9)
  - En attente: Orange (#EF6C00 on #FFF3E0)
  - Brouillon: Gray (#616161 on #F5F5F5)
- Card elevation and rounded corners
- Proper accessibility labels

### Services

#### **consultationService** (`src/services/consultationService.ts`)
Service layer for fetching consultation data.

**Functions:**
- `fetchConsultations(variables)`: Fetches consultations from the GraphQL API

**GraphQL Query:**
```graphql
query GetConsultations(
  $filter: DataEntryFilterInput
  $pagination: PaginationInput
  $sort: SortInput
) {
  dataEntries(filter: $filter, pagination: $pagination, sort: $sort) {
    dataEntries { ... }
    totalCount
    hasNextPage
    hasPreviousPage
  }
}
```

### Types

#### **Consultation Types** (`src/types/index.ts`)
- `ConsultationStatus`: Union type for status values
- `DataEntry`: Base consultation/data entry interface
- `Consultation`: Alias for DataEntry with semantic meaning

## Accessibility

All components follow WCAG 2.1 guidelines:

1. **Touch Targets**: Minimum 44px × 44px for all interactive elements
2. **ARIA Roles**: Proper `accessibilityRole` on all interactive components
3. **Labels**: Descriptive `accessibilityLabel` on all components
4. **State**: `accessibilityState` used for toggle states
5. **Color Contrast**: Status badges use sufficient color contrast ratios

## Navigation

The ConsultationsScreen is integrated into the bottom tab navigator:

- **Tab Icon**: Stethoscope icon
- **Tab Label**: "Consultation"
- **Header Title**: "Consultations"
- **Header Left**: Hamburger menu icon (for future drawer/menu)
- **Header Right**: Logout button

## User Interactions

1. **Search**: Type in the search bar to filter consultations by patient name
2. **Filter**: Tap filter pills to show consultations by status
3. **Scroll**: Scroll down to load more consultations (infinite scroll)
4. **Refresh**: Pull down to refresh the list
5. **Tap Card**: Tap a consultation card to view details (TODO: navigation)
6. **New Consultation**: Tap the floating + button to create a new consultation (TODO: navigation)
7. **Menu**: Tap the hamburger icon to open the menu (TODO: drawer implementation)

## Error Handling

The screen handles three main states:

1. **Loading**: Shows spinner at the bottom during pagination
2. **Error**: Shows error message with retry button
3. **Empty**: Shows message when no consultations match the filters

## Future Enhancements

1. **Navigation**: Implement navigation to consultation detail and create screens
2. **Drawer**: Implement drawer navigation for the hamburger menu
3. **Offline Support**: Add local storage for offline consultation viewing
4. **Draft Management**: Local draft storage before sync
5. **Advanced Filters**: Add date range, diagnostic filters, etc.
6. **Dark Mode**: Full dark mode support (components are prepared)

## Testing

Tests are located in:
- `__tests__/ConsultationScreen.test.tsx`
- `__tests__/navigation.test.tsx` (updated to include ConsultationScreen)

Run tests with:
```bash
npm test
```

## Linting

The code follows ESLint rules configured in `.eslintrc.js`.

Run linter with:
```bash
npm run lint
```

## Dependencies

Key dependencies used:
- `react-native`: Core React Native framework
- `react-native-paper`: Material Design components (Card, FAB, Text)
- `react-native-vector-icons`: Icon library
- `@apollo/client`: GraphQL client
- `react-hook-form`: Form management (for future create/edit screens)

## Code Quality

The implementation follows these best practices:

1. **TypeScript**: Full type safety throughout
2. **Separation of Concerns**: Screen, components, and services are separated
3. **Reusability**: Components are generic and reusable
4. **Performance**: Proper use of hooks for optimization
5. **Accessibility**: WCAG 2.1 compliance
6. **Testing**: Comprehensive test coverage
7. **Documentation**: Inline comments and JSDoc where appropriate

## Screenshots

_Note: Screenshots should be added here after manual testing on device/emulator_

## References

- [React Native FlatList](https://reactnative.dev/docs/flatlist)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
