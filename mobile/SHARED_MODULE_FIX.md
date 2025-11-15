# Fixing Module Resolution for Shared Code

## Issue

React Native's Metro bundler was unable to resolve imports from the `shared` module located in the parent directory:

```
ERROR  Error: Unable to resolve module ../../../shared/constants/typeConsultations
```

## Solution

We've configured the mobile app to work in a monorepo environment by:

1. **Metro Configuration** (`metro.config.js`)
   - Added `watchFolders` to monitor the parent directory
   - Configured `extraNodeModules` to create a `@shared` alias
   - Added parent `node_modules` to the resolution path

2. **Babel Configuration** (`babel.config.js`)
   - Added `babel-plugin-module-resolver` to resolve the `@shared` alias
   - Configured alias mapping: `@shared` → `../shared`

3. **TypeScript Configuration** (`tsconfig.json`)
   - Added path mapping for `@shared/*` → `../shared/*`
   - Included shared directory in compilation

4. **Updated Imports**
   - Changed all imports from `../../../shared/...` to `@shared/...`
   - Updated files:
     - `mobile/src/components/form/TypeConsultationPicker.tsx`
     - `mobile/src/components/form/CategorySelector.tsx`
     - `mobile/src/components/form/PrescriptionList.tsx`
     - `mobile/src/components/form/DispensaireSelector.tsx`
     - `mobile/src/types/consultation.ts`
     - `mobile/src/utils/consultationValidation.ts`

## Installation Steps

After pulling these changes, run:

```bash
cd mobile
npm install  # Install babel-plugin-module-resolver
npm start -- --reset-cache  # Clear Metro cache
```

Then in a separate terminal:

```bash
npm run android  # or npm run ios
```

## Benefits of @shared Alias

1. **Cleaner imports**: `@shared/types/consultation` vs `../../../shared/types/consultation`
2. **Easier refactoring**: Move files without updating import paths
3. **Better IDE support**: TypeScript knows about the alias
4. **Monorepo support**: Proper handling of shared code across packages

## File Structure

```
shalom-dhis2/
├── shared/                    # Shared module (outside mobile)
│   ├── constants/
│   ├── types/
│   └── validation/
└── mobile/
    ├── metro.config.js       # ✅ Updated
    ├── babel.config.js       # ✅ Updated
    ├── tsconfig.json         # ✅ Updated
    ├── package.json          # ✅ Updated
    └── src/
        └── ...               # ✅ Imports updated to use @shared
```

## Troubleshooting

### Metro bundler still fails

1. Clear Metro cache:
   ```bash
   npm start -- --reset-cache
   ```

2. Clear watchman cache:
   ```bash
   watchman watch-del-all
   ```

3. Clean build:
   ```bash
   cd android && ./gradlew clean && cd ..
   # or for iOS
   cd ios && rm -rf build && pod install && cd ..
   ```

### TypeScript errors

If TypeScript doesn't recognize `@shared` imports:
1. Restart your IDE/editor
2. Reload TypeScript server
3. Check `tsconfig.json` has the correct paths configuration

### Build errors

If you get build errors about missing modules:
1. Ensure `npm install` was run in the mobile directory
2. Check that `babel-plugin-module-resolver` is installed
3. Verify Metro bundler is using the updated config

## What Changed

### Before (broken)
```typescript
import { TYPES_CONSULTATION } from '../../../shared/constants/typeConsultations';
```

### After (working)
```typescript
import { TYPES_CONSULTATION } from '@shared/constants/typeConsultations';
```

## Testing

To verify the fix works:

1. Start Metro bundler:
   ```bash
   cd mobile
   npm start -- --reset-cache
   ```

2. Build and run:
   ```bash
   npm run android  # or npm run ios
   ```

3. Navigate to "Nouvelle consultation" screen
4. Verify all components load without errors

The app should now successfully resolve all `@shared` imports and function correctly.
