import { defineConfig } from '@playwright/test';

// Portable browser coverage uses Playwright Chromium. Installed Chrome checks run separately.
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/hardware-diagnostic.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5188 --strictPort',
    url: 'http://127.0.0.1:5188',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:5188',
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
});
