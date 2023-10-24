import { devices, PlaywrightTestConfig } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 * @see {https} ://playwright.dev/docs/test-configuration
 * @param {string} key
 * @param {string} defaultValue
 */

function getEnv (key: string, defaultValue: string): string {
  let v = process.env[key] || '';
  return v !== '' ? v : defaultValue;
}

const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html',{outputFile: 'tests.results.html', open: 'never'}]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://www.staging.com/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    timezoneId: 'America/Vancouver',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: {width: 1920, height: 1080}
      },
    }
  ]
};

process.env.SAUCE_USERNAME = getEnv('SAUCE_USERNAME', '');
process.env.SAUCE_ACCESS_KEY = getEnv('SAUCE_ACCESS_KEY', '');
process.env.RUN_ON_SAUCELABS = 'true';
process.env.TEST_WORKERS_ENABLED = 'true';
process.env.TEST_WORKERS = 'auto';

export default config;
