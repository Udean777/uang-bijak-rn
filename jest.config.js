module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(expo-constants|expo-modules-core|expo-device|expo-notifications)/)",
  ],
};
