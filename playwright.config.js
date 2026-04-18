import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "npx live-server --port=3000 --no-browser --quiet",
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
  ],
});
