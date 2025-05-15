// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Cualquier import que empiece por "react" o por "react-native"
// debe apuntar a tu node_modules
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native-web'),
  // Alias directo para node:react
  'node:react': path.resolve(projectRoot, 'node_modules/react'),
};

module.exports = config;
