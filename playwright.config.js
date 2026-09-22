import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    viewport: { width: 390, height: 844 },
  },
  // A plain static server: live-server's file watcher reloads open pages
  // whenever Playwright writes test artifacts, which breaks scroll tests.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "node scripts/serve.cjs 3000",
        port: 3000,
        reuseExistingServer: true,
      },
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
