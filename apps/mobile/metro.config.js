const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const os = require("os");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Only resolve modules from the local project's node_modules.
// This prevents duplicate react/react-native from monorepo or parent directories.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

const finalConfig = withNativeWind(config, { input: "./app/global.css" });

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Exclude home directory node_modules and parent node_modules
const userNodeModules = path.resolve(os.homedir(), "node_modules");
const parentNodeModules = path.resolve(projectRoot, "..", "..", "node_modules");
const exclusionPatterns = [
  escapeRegExp(userNodeModules),
  escapeRegExp(parentNodeModules),
].join("|");
const exclusionRegex = new RegExp(`(${exclusionPatterns}).*`);

if (finalConfig.resolver.blockList) {
  if (finalConfig.resolver.blockList instanceof RegExp) {
    finalConfig.resolver.blockList = new RegExp(
      `${finalConfig.resolver.blockList.source}|${exclusionRegex.source}`
    );
  } else if (Array.isArray(finalConfig.resolver.blockList)) {
    finalConfig.resolver.blockList.push(exclusionRegex);
  } else {
    finalConfig.resolver.blockList = exclusionRegex;
  }
} else {
  finalConfig.resolver.blockList = exclusionRegex;
}

module.exports = finalConfig;
