/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.app.json",
      useESM: true,
      diagnostics: { ignoreCodes: ["TS151001", "TS2591"] },
    }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "\\.(svg|png|jpg|jpeg|gif|webp)$": "<rootDir>/src/tests/__mocks__/fileMock.ts",
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "^(.*)/config/env(.*)$": "<rootDir>/src/tests/__mocks__/envMock.ts",
    "^(.*)/store/storage(.*)$": "<rootDir>/src/tests/__mocks__/storageMock.ts",
    "^(.*)/api/axios(.*)$": "<rootDir>/src/tests/__mocks__/axiosMock.ts",
  },
  setupFiles: ["<rootDir>/src/tests/setup/polyfills.ts"],
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.{ts,tsx}"],
};
