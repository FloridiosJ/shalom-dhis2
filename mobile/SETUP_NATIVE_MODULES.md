# Quick Fix: Native Module Errors After Pulling Changes

If you're seeing errors like:
- `@react-native-community/netinfo: NativeModule.RNCNetInfo is null`
- `Cannot read property 'NetworkProvider' of undefined`

This happens when native dependencies are added but the app hasn't been rebuilt with the new native modules.

## Solution

### For Android (Redmi 10A or any Android device)

```sh
# 1. Make sure dependencies are installed
npm install

# 2. Clean the Android build
cd android
./gradlew clean
cd ..

# 3. Rebuild and run the app
npm run android
```

### For iOS

```sh
# 1. Make sure dependencies are installed
npm install

# 2. Install native modules via CocoaPods
cd ios
bundle exec pod install
cd ..

# 3. Rebuild and run the app
npm run ios
```

## Why This Happens

React Native apps have two parts:
1. **JavaScript code** - Runs in Metro bundler
2. **Native code** (Android/iOS) - Compiled into the app

When new native modules like `@react-native-community/netinfo` are added:
- The JavaScript code can load immediately
- But the native code needs to be **compiled into the app binary**

Simply running `npm start` only refreshes the JavaScript. You need to rebuild the entire app to include the new native modules.

## Additional Steps If Still Not Working

1. **Stop Metro bundler** (Ctrl+C in the terminal running `npm start`)

2. **Clear caches:**
   ```sh
   # Clear Metro cache
   npm start -- --reset-cache
   ```

3. **Clean node_modules (if needed):**
   ```sh
   rm -rf node_modules
   npm install
   ```

4. **For Android - more aggressive clean:**
   ```sh
   cd android
   ./gradlew clean
   ./gradlew cleanBuildCache
   cd ..
   ```

5. **Rebuild the app:**
   ```sh
   npm run android  # or npm run ios
   ```

## Verification

After rebuilding, you should see:
- ✅ No errors in the console about `RNCNetInfo` or `NetworkProvider`
- ✅ Network status banner appears on the home screen
- ✅ App functions normally with offline/online detection

## Related Files Changed

The following native dependencies were added in this PR:
- `@react-native-community/netinfo@11.4.1` - Network connectivity detection

These require native linking, which is why a rebuild is necessary.
