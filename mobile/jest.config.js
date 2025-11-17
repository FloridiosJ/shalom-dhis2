module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|@gorhom/bottom-sheet|react-native-gesture-handler|@react-native-community|@react-native-async-storage|@react-navigation)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
