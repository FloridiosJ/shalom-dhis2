This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

> **📖 For detailed setup instructions including environment configuration, SDK installation, and troubleshooting, see [guide_local.md](./guide_local.md).**

## Step 0: Configure Environment

Before running the app, you need to configure the backend GraphQL endpoint:

1. Copy the `.env.example` file to `.env`:
   ```sh
   cp .env.example .env
   ```

2. Edit the `.env` file and set the `GRAPHQL_ENDPOINT` variable:
   - **For Android Emulator**: `http://10.0.2.2:4000/graphql`
   - **For iOS Simulator**: `http://localhost:4000/graphql`
   - **For Physical Device**: `http://YOUR_COMPUTER_IP:4000/graphql`

3. To find your computer's IP address:
   - **Windows**: Open Command Prompt and run `ipconfig`
   - **macOS/Linux**: Open Terminal and run `ifconfig` or `ip addr show`

4. Make sure the backend server is running on port 4000 before starting the mobile app.

## Step 1: Install Dependencies and Link Native Modules

After cloning the repository or pulling new changes that include native dependencies, you need to install dependencies and rebuild the app:

### Install Node Dependencies

```sh
# Using npm
npm install

# OR using Yarn
yarn install
```

### Android Setup

For Android, the native modules are automatically linked with autolinking. You just need to rebuild the app:

```sh
# Clean the build (recommended after pulling changes with new native dependencies)
cd android
./gradlew clean
cd ..

# Run the app (this will rebuild automatically)
npm run android
```

**Important:** If you encounter errors like `NativeModule.RNCNetInfo is null` or similar, you need to:
1. Stop the Metro bundler
2. Clean the build: `cd android && ./gradlew clean && cd ..`
3. Rebuild and run: `npm run android`

### iOS Setup

For iOS, you need to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps):

```sh
# First time only: Install CocoaPods
bundle install

# Every time native dependencies change
cd ios
bundle exec pod install
cd ..

# Run the app
npm run ios
```

## Step 2: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 3: Build and run your app

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 3: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Troubleshooting Native Module Errors

If you see errors like:
- `NativeModule.RNCNetInfo is null`
- `Cannot read property 'NetworkProvider' of undefined`
- Other native module errors

**Solution:**
1. Make sure you've run `npm install` to install all dependencies
2. For **Android**:
   ```sh
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```
3. For **iOS**:
   ```sh
   cd ios
   bundle exec pod install
   cd ..
   npm run ios
   ```
4. If the error persists, try:
   - Stop Metro bundler (Ctrl+C)
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Clear Metro cache: `npm start -- --reset-cache`
   - Rebuild the app

## Step 4: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## App Structure

### Navigation

The app uses a bottom tab navigation pattern with the following screens:

- **Consultation**: Access to consultation list, creation/editing, and synchronization (placeholder - in development)
- **Patient**: Access to patient records, search, and creation/editing (placeholder - in development)

The navigation is only accessible after successful login. Both screens include a logout button in the header.

### Screens

- `LoginScreen`: Authentication screen
- `ConsultationScreen`: Consultation management (placeholder)
- `PatientScreen`: Patient management (placeholder)

### Future Enhancements

The navigation structure is prepared to add additional sections such as:
- Data quality monitoring
- Synchronization management
- Settings

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Debugging Best Practices

### React List Keys

When rendering lists with FlatList or similar components, always ensure each item has a unique and stable key:

```typescript
// ✅ Good: Use unique IDs from the backend
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({item}) => <ItemCard item={item} />}
/>

// ✅ Good: Use clientTempId for offline items
keyExtractor={(item) => item.id || item.clientTempId}

// ⚠️ Caution: Only use index as last resort fallback
keyExtractor={(item, index) => item.id || `fallback-${index}`}

// ❌ Bad: Never use only index as key
keyExtractor={(item, index) => `${index}`}
```

**Key principles:**
- Keys must be **unique** across all items in the list
- Keys should be **stable** (not change when list is re-rendered)
- Never use array index alone as key if items can be reordered, added, or removed
- Log warnings in DEV mode if duplicate keys are detected

### Handling Async Operations

For deferred or background work that shouldn't block the UI:

```typescript
import {runAfterInteractions} from '../utils/requestIdleCallback';

// Defer heavy computation until UI is idle
runAfterInteractions(() => {
  // Heavy processing, calculations, or non-urgent updates
  processLargeDataset();
});
```

**Note:** The app provides a `requestIdleCallback` polyfill as a replacement for the deprecated `InteractionManager.runAfterInteractions()`. Use `runAfterInteractions()` from `utils/requestIdleCallback.ts` for all deferred work.

**Library Deprecation Warning:** You may see deprecation warnings about `InteractionManager` from the `@react-navigation/stack` library (v7.4.10). This is a known issue in the navigation library itself and will be resolved when the library updates. The warnings are cosmetic and don't affect functionality. Our application code doesn't use `InteractionManager` directly.

### Preventing Duplicate Data

When loading paginated data or merging data from multiple sources:

```typescript
// Deduplicate based on unique ID
const existingIds = new Set(previousItems.map(item => item.id));
const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
const mergedItems = [...previousItems, ...uniqueNewItems];
```

### Development Mode Validations

The app includes DEV-only validations to catch common issues:

- **Duplicate key detection**: Warns when list items have duplicate keys
- **Missing ID detection**: Warns when consultations lack both `id` and `clientTempId`
- **Duplicate data detection**: Warns when the same consultation ID appears multiple times

Check the console in DEV mode for these warnings to identify data integrity issues early.

## Offline-First Architecture

The application is designed with an offline-first approach, allowing field agents to work seamlessly without internet connectivity.

### Key Features

1. **Automatic Network Detection**
   - Real-time monitoring of network connectivity
   - Automatic switch between online and offline modes
   - Visual indicators for connection status

2. **Local Data Storage**
   - Consultations and patient data stored locally using AsyncStorage
   - Data persists across app restarts
   - Secure storage on device

3. **Automatic Synchronization**
   - Triggered on network reconnection
   - Triggered when app returns to foreground
   - Exponential backoff retry logic (2s, 4s, 8s)
   - Maximum 3 automatic retry attempts

4. **Visual Feedback**
   - Network status banner on home screen
   - Sync progress indicators
   - Pending items counter
   - Error list with retry options

### Components

- **NetworkContext**: Provides network state across the app
- **useAutoSync**: Manages automatic sync on reconnection
- **useOfflineConsultation**: Handles offline consultation creation
- **NetworkStatusBanner**: Visual indicator for network status
- **SyncScreen**: Detailed sync management interface

### Usage Example

```typescript
// Creating a consultation with offline support
const {createConsultation, isOffline} = useOfflineConsultation();

const handleSubmit = async (data) => {
  const result = await createConsultation(data);
  
  if (result.offline) {
    alert('Saved offline - will sync when online');
  } else {
    alert('Saved successfully');
  }
};
```

### User Documentation

For detailed user instructions, see [GUIDE_UTILISATEUR_OFFLINE.md](./GUIDE_UTILISATEUR_OFFLINE.md)

### Technical Documentation

For API documentation and backend integration, see [OFFLINE_SYNC_GUIDE.md](./OFFLINE_SYNC_GUIDE.md)

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

