const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const os = require("os");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

const finalConfig = withNativeWind(config, { input: "./app/global.css" });

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Exclude home directory node_modules
const userNodeModules = path.resolve(os.homedir(), "node_modules");
const exclusionRegex = new RegExp(`${escapeRegExp(userNodeModules)}.*`);

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
