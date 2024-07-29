const { getDefaultConfig } = require("@expo/metro-config");

const defaultconfig = getDefaultConfig(__dirname);
defaultconfig.resolver.sourceExts.push("cjs");

module.exports = defaultconfig;
