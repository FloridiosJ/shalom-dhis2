# New Consultation Screen Implementation

## Overview

This document describes the implementation of the New Consultation screen for the Shalom DHIS2 mobile application. The screen allows healthcare workers to create new medical consultations with patient information, clinical data, and attachments.

## Features

### 1. Patient Selection
- **Search Modal**: Full-screen modal with search functionality
- **Patient Display**: Shows patient name and number
- **Create Patient Button**: Link to create new patients
- **Validation**: Required field with error messages

### 2. Date and Time Selection
- **Date Picker**: Native date picker with maximum date validation (no future dates)
- **Time Picker**: Native time picker with 24-hour format
- **Default Values**: Current date and time pre-populated
- **Validation**: Prevents future consultations

### 3. Clinical Information
- **Diagnostic**: Required text input with minimum 3 characters
- **Prescriptions**: Optional multiline text input
- **Notes**: Optional multiline text input for additional comments
- **Real-time Validation**: Immediate feedback on input errors

### 4. Attachments
- **Photo Capture**: Launch camera to take photos
- **File Selection**: Select images from gallery
- **Permission Handling**: Android camera permissions properly managed
- **Attachment Display**: List of added files with size and type
- **Remove Option**: Delete attachments with confirmation

### 5. Draft Management
- **Auto-save**: Automatic draft saving every second after changes
- **Draft Indicator**: "Sauvegardé" badge in header when draft exists
- **Recovery**: Draft automatically loaded on screen mount
- **Persistence**: Uses AsyncStorage for offline persistence

### 6. Form Actions
- **Save Draft**: Manually save current form state
- **Send**: Validate and submit consultation (clears draft on success)
- **Validation**: Send button disabled until form is valid
- **Loading States**: Activity indicators during save/send operations

## Technical Architecture

### Components

#### Core Components
- `NewConsultationScreen.tsx` - Main screen component with form logic
- `PatientPicker.tsx` - Patient selection with search modal
- `DateTimeField.tsx` - Date and time picker wrapper
- `TextInputField.tsx` - Reusable text input with validation
- `AttachmentField.tsx` - File/photo picker with permissions

#### Types
```typescript
interface ConsultationFormData {
  patientId: string | null;
  dateConsultation: Date;
  heureConsultation: Date;
  diagnostic: string;
  prescriptions: string;
  notes: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  uri: string;
  name: string;
  type: string;
  size?: number;
}
```

#### Validation Schema (Yup)
```typescript
consultationValidationSchema = {
  patientId: required string
  dateConsultation: required date, max today
  heureConsultation: required date, not future
  diagnostic: required string, min 3 chars
  prescriptions: optional string
  notes: optional string
  attachments: optional array
}
```

### Dependencies

#### New Dependencies
- `yup` - Form validation schema
- `@hookform/resolvers` - React Hook Form integration with Yup
- `react-native-image-picker` - Camera and gallery access

#### Existing Dependencies
- `react-hook-form` - Form state management
- `@react-native-async-storage/async-storage` - Draft persistence
- `@react-native-community/datetimepicker` - Date/time pickers
- `react-native-paper` - UI components
- `@react-navigation/stack` - Screen navigation

### Navigation Structure

```
MainNavigator (TabNavigator)
  └── Consultation (StackNavigator)
      ├── ConsultationList
      └── NewConsultation ← NEW
```

The FAB button in ConsultationScreen navigates to NewConsultation screen.

## Accessibility Features

1. **Labels**: All form fields have descriptive labels
2. **Accessibility Roles**: Buttons properly labeled with roles
3. **Accessibility Hints**: Helpful hints for complex interactions
4. **Touch Targets**: Minimum 44x44 pixels for all interactive elements
5. **Error Messages**: Clear, readable error text
6. **Keyboard Support**: Full keyboard navigation support

## Keyboard Handling

- `KeyboardAvoidingView` wrapper for iOS
- Proper keyboard dismiss on scroll
- `keyboardShouldPersistTaps="handled"` for modal interactions
- Auto-scroll to focused inputs

## Offline Support

1. **Draft Auto-save**: Form data saved locally every second
2. **AsyncStorage**: Persistent storage across app restarts
3. **Draft Recovery**: Automatically restore unsaved work
4. **Queue System**: Ready for offline sync implementation (TODO)

## Testing

### Test Coverage
- **12 test suites** with **44 passing tests**
- Component rendering tests
- Validation logic tests
- Error state tests
- User interaction tests

### Test Files
- `PatientPicker.test.tsx` - Patient selection tests
- `DateTimeField.test.tsx` - Date/time picker tests
- `TextInputField.test.tsx` - Text input tests
- `AttachmentField.test.tsx` - Attachment tests
- `NewConsultationScreen.test.tsx` - Screen integration tests
- `consultationValidation.test.ts` - Validation logic tests

## Usage

### Creating a New Consultation

1. Navigate to Consultations tab
2. Tap the FAB (+) button
3. Select a patient (or create new)
4. Set date and time
5. Enter diagnostic (required)
6. Add prescriptions and notes (optional)
7. Add attachments (optional)
8. Tap "Envoyer" to submit or "Enregistrer broui..." to save draft

### Resuming a Draft

1. Open New Consultation screen
2. Draft automatically loaded if exists
3. "Sauvegardé" badge shown in header
4. Continue editing and submit

## Future Enhancements

1. **Patient API Integration**: Connect to actual patient service
2. **Consultation API**: Implement create consultation mutation
3. **Diagnostic Autocomplete**: Add diagnosis code lookup
4. **Prescription Templates**: Common prescription suggestions
5. **Offline Sync Queue**: Retry failed submissions
6. **Image Compression**: Optimize photo attachments
7. **Multiple Languages**: i18n support for all text
8. **Field Validation**: Additional business rules

## Known Limitations

1. **Mock Patient Data**: Currently uses hardcoded patients
2. **No Server Sync**: Submissions are simulated
3. **Basic Permissions**: iOS camera permissions not fully handled
4. **No File Type Validation**: All image types accepted
5. **Single Draft**: Only one draft stored at a time

## Code Style and Best Practices

### Clean Code Principles
- ✅ Small, focused components
- ✅ Single Responsibility Principle
- ✅ Reusable form components
- ✅ Type-safe with TypeScript
- ✅ Proper error handling
- ✅ Consistent naming conventions

### React Best Practices
- ✅ Hooks for state management
- ✅ useCallback for event handlers
- ✅ useMemo for expensive computations
- ✅ Proper dependency arrays
- ✅ No inline function definitions

### Mobile Best Practices
- ✅ Responsive layouts
- ✅ Proper keyboard handling
- ✅ Offline-first approach
- ✅ Performance optimized
- ✅ Accessibility compliant

## Maintenance Notes

### Adding New Fields
1. Update `ConsultationFormData` type
2. Add field to validation schema
3. Create/reuse form component
4. Add to NewConsultationScreen render
5. Update tests

### Modifying Validation
1. Edit `consultationValidation.ts`
2. Update validation tests
3. Test edge cases

### Styling Updates
1. Follow existing StyleSheet patterns
2. Use design system colors (#2196F3, #F5F5F5, etc.)
3. Maintain 44px minimum touch targets
4. Test on multiple screen sizes

## Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Yup Validation Schema](https://github.com/jquense/yup)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)

## Support

For issues or questions about this implementation, please:
1. Check this documentation
2. Review test files for examples
3. Check inline code comments
4. Contact the development team
