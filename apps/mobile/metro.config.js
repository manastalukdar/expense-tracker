const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for monorepo
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Watch the monorepo root and shared packages
    path.resolve(__dirname, '../../'),
  ],
  resolver: {
    // Look for modules in multiple locations
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // Enable symlinks for workspace dependencies
    unstable_enableSymlinks: true,
    // Add TypeScript extensions for workspace packages
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
  transformer: {
    // Enable TypeScript transformation
    babelTransformerPath: require.resolve('@react-native/metro-babel-transformer'),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);