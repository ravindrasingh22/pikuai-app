const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "node_modules", "expo-dev-menu", "ios", "DevMenuViewController.swift");

if (!fs.existsSync(target)) {
  process.exit(0);
}

const source = fs.readFileSync(target, "utf8");
const before = "    let isSimulator = TARGET_IPHONE_SIMULATOR > 0";
// Expo dev-menu uses this flag only to report dev-menu device metadata.
// The Swift conditional compiles for both simulator and physical devices.
const after = [
  "    #if targetEnvironment(simulator)",
  "    let isSimulator = true",
  "    #else",
  "    let isSimulator = false",
  "    #endif"
].join("\n");

if (source.includes(before)) {
  fs.writeFileSync(target, source.replace(before, after));
}
