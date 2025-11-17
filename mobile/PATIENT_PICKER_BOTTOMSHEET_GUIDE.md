# PatientPicker BottomSheet Refactoring Guide

## Overview
The PatientPicker component has been refactored to use a BottomSheet instead of a Modal for improved mobile UX. This provides a more native and intuitive interaction pattern for selecting patients on mobile devices.

## What Changed

### Before
- Used React Native Modal with full-screen presentation on Android
- Used page sheet on iOS
- Limited gesture support
- Basic keyboard handling

### After
- Uses @gorhom/bottom-sheet for native bottom sheet behavior
- Supports swipe-to-dismiss gesture
- Dynamic height with 75% and 90% snap points
- Improved keyboard handling with interactive behavior
- Backdrop with tap-to-close
- Platform-specific shadows and elevation

## New Dependencies

### @gorhom/bottom-sheet (v4.6.4)
A performant, feature-rich bottom sheet component for React Native.

**Why this library?**
- Battle-tested with excellent community support
- Supports dynamic sizing and snap points
- Built-in keyboard handling
- Accessibility features
- Smooth animations via react-native-reanimated

### react-native-reanimated (v3.3.0)
Required peer dependency for @gorhom/bottom-sheet animations. This version is compatible with React Native 0.82.

## Architecture

### BottomSheetWrapper Component
`src/components/common/BottomSheetWrapper.tsx`

A reusable wrapper component that encapsulates @gorhom/bottom-sheet functionality.

**Key Features:**
- Imperative API via ref (open/close methods)
- Configurable snap points
- Dynamic sizing support
- Keyboard behavior options
- Backdrop with configurable opacity
- Platform-specific styling

**Props:**
```typescript
interface BottomSheetWrapperProps {
  children: React.ReactNode;
  snapPoints?: string[];  // e.g., ['50%', '75%']
  enableDynamicSizing?: boolean;  // default: true
  onClose?: () => void;
  enablePanDownToClose?: boolean;  // default: true
  keyboardBehavior?: 'interactive' | 'fillParent' | 'extend';
}
```

**Ref Methods:**
```typescript
interface BottomSheetWrapperRef {
  open: () => void;
  close: () => void;
}
```

### Updated PatientPicker Component
`src/components/form/PatientPicker.tsx`

**Changes:**
1. Replaced Modal with BottomSheetWrapper
2. Uses BottomSheetFlatList instead of FlatList for better scrolling
3. Configured with 75% and 90% snap points
4. Interactive keyboard behavior
5. Maintained all existing props and functionality

**No Breaking Changes:**
The component API remains unchanged - all existing props work as before:
- `value`: Selected patient ID
- `onChange`: Patient selection callback
- `onCreatePatient`: New patient creation callback
- `error`: Error message
- `patients`: List of patients
- `onSearchPatients`: Search callback
- `loading`: Loading state

## Usage Example

### Basic Usage
```typescript
import PatientPicker from '../components/form/PatientPicker';

<PatientPicker
  value={selectedPatientId}
  onChange={setSelectedPatientId}
  onCreatePatient={handleCreatePatient}
  patients={patients}
  onSearchPatients={handleSearch}
  loading={loading}
/>
```

### Using BottomSheetWrapper Directly
```typescript
import BottomSheetWrapper, { BottomSheetWrapperRef } from '../components/common/BottomSheetWrapper';

const MyComponent = () => {
  const bottomSheetRef = useRef<BottomSheetWrapperRef>(null);

  const handleOpen = () => {
    bottomSheetRef.current?.open();
  };

  return (
    <>
      <Button onPress={handleOpen}>Open Sheet</Button>
      
      <BottomSheetWrapper
        ref={bottomSheetRef}
        snapPoints={['50%', '75%']}
        onClose={() => console.log('Sheet closed')}>
        <View>
          {/* Your content here */}
        </View>
      </BottomSheetWrapper>
    </>
  );
};
```

## Testing

### Test Setup
Updated Jest configuration to handle new dependencies:

**jest.config.js:**
- Added transform ignore patterns for @gorhom/bottom-sheet, react-native-reanimated, and react-native-gesture-handler
- Added setup file for global mocks

**jest.setup.js:**
- Mocks react-native-reanimated
- Mocks react-native-gesture-handler
- Mocks AsyncStorage globally

### Running Tests
```bash
# Run all tests
npm test

# Run specific component tests
npm test -- PatientPicker.test.tsx
npm test -- BottomSheetWrapper.test.tsx
```

### Test Coverage
- ✅ PatientPicker renders correctly
- ✅ PatientPicker renders with selected patient
- ✅ PatientPicker renders with error
- ✅ BottomSheetWrapper renders correctly
- ✅ BottomSheetWrapper works with custom snap points
- ✅ BottomSheetWrapper works with dynamic sizing

## Babel Configuration

Added react-native-reanimated plugin to babel.config.js:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... other plugins
    'react-native-reanimated/plugin',  // Must be last
  ],
};
```

**Important:** The reanimated plugin must be listed last in the plugins array.

## Accessibility

The BottomSheet implementation maintains all accessibility features:

- ✅ Screen reader support
- ✅ Accessibility labels and hints
- ✅ Touch target sizes (44x44pt minimum)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Accessible tap targets

## Performance Considerations

### Optimizations
1. Uses `useCallback` for event handlers to prevent unnecessary re-renders
2. BottomSheetFlatList for efficient list rendering
3. Reanimated for 60fps animations
4. Gesture handler for native gesture recognition

### Memory Management
- BottomSheet is only rendered once and reused
- List items use `keyExtractor` for efficient recycling
- Search query state cleared on close to prevent memory leaks

## Platform Support

### iOS
- Native bottom sheet behavior
- Shadow effects
- Smooth animations
- Full gesture support

### Android
- Native bottom sheet behavior
- Elevation for depth
- Smooth animations
- Full gesture support

## Troubleshooting

### BottomSheet not appearing
- Ensure GestureHandlerRootView wraps your app (handled by BottomSheetWrapper)
- Check that react-native-reanimated is properly configured in babel.config.js
- Verify ref is properly passed and open() is called

### Keyboard issues
- The component uses 'interactive' keyboard behavior by default
- On Android, ensure `android:windowSoftInputMode="adjustResize"` is set in AndroidManifest.xml

### Test failures
- Ensure all mocks are properly configured in test files
- Check jest.config.js has correct transformIgnorePatterns
- Verify jest.setup.js is included in setupFiles

## Future Enhancements

Potential improvements for future iterations:

1. **Preset Heights**: Add common preset snap point configurations
2. **Custom Backdrop**: Allow custom backdrop components
3. **Animation Configs**: Expose animation timing configurations
4. **Multi-step Sheets**: Support for multi-step bottom sheets
5. **Nested Sheets**: Support for nested bottom sheets
6. **Portal Support**: Integration with react-native-portal for advanced use cases

## Migration Guide

If you're migrating from the old Modal-based PatientPicker:

1. **No code changes required** - The component API is unchanged
2. Install new dependencies: `npm install @gorhom/bottom-sheet react-native-reanimated`
3. Update babel.config.js with reanimated plugin
4. Rebuild your app: `npm run android` or `npm run ios`
5. Test the new behavior

## References

- [@gorhom/bottom-sheet Documentation](https://gorhom.github.io/react-native-bottom-sheet/)
- [react-native-reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)

## Support

For issues or questions:
1. Check this documentation first
2. Review @gorhom/bottom-sheet documentation
3. Open an issue in the repository with detailed description and steps to reproduce
