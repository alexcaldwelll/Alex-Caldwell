import { defineConfig } from '@playwright/test';

// Local development diagnostic: actual installed Chrome, hardware WebGL,
// Vite development modules/private R3F internals, externally managed server.
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/hardware-diagnostic.spec.ts',
  workers: 1,
  timeout: 45_000,
  use: {
    baseURL: process.env.HARDWARE_BASE_URL ?? 'http://localhost:5173',
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
});
