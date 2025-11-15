const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo support
 * This configuration allows the mobile app to access the shared module
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [
    path.resolve(__dirname, '..'), // Watch parent directory (monorepo root)
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'), // Support shared dependencies
    ],
    extraNodeModules: {
      // Map shared module for easy access
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
