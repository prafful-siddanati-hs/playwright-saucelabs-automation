// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 * @see {https} ://playwright.dev/docs/test-configuration
 * @param {string} key
 * @param {string} defaultValue
 */

function getEnv (key, defaultValue) {
	let v = process.env[key] || '';
	return v !== '' ? v : defaultValue;
}

module.exports = defineConfig({
	testDir: './tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on SAUCE_VM & CI only */
	retries: (process.env.CI || process.env.SAUCE_VM) ? 1 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : 5,
	timeout: 60 * 2 * 1000,
	expect: {
		/**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
		timeout: 20000,
	},
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [['html',{outputFile: 'playwright-report/index.html', open: 'never'}],
		['json', {outputFile: 'test-results/test_result.json'}]],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: 'https://staging.hootsuite.com/',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: (process.env.CI || process.env.SAUCE_VM) ? 'retry-with-trace' : 'on',
		ignoreHTTPSErrors: true,
		screenshot: 'only-on-failure',
		timezoneId: 'America/Vancouver',
		video: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
		longTimeout: 30 * 1000,
	},
	outputDir: 'screenshots',

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				saucelabs: {
					username: getEnv('SAUCE_USERNAME', ''),
					access_key: getEnv('SAUCE_ACCESS_KEY', ''),
					launchOptions: {
						args: [
							'--headless',
							'--no-sandbox',
							'--ignore-certificate-errors',
							'--allow-insecure-localhost',
							'--disable-infobars'
						]
					},
					contextOptions: {
						ignoreHTTPSErrors: true,
						viewport: { width: 1920, height: 1200 },
					},
					video: 'on-first-retry'
				}
			},
		},
		// {
		// 	name: 'firefox',
		// 	use: {
		// 		...devices['Desktop Firefox'],
		// 		saucelabs: {
		// 			username: getEnv('SAUCE_USERNAME', ''),
		// 			access_key: getEnv('SAUCE_ACCESS_KEY', ''),
		// 			launchOptions: {
		// 				args: [
		// 					'--headless',
		// 					'--no-sandbox',
		// 					'--ignore-certificate-errors',
		// 					'--allow-insecure-localhost',
		// 					'--disable-infobars'
		// 				]
		// 			},
		// 			contextOptions: {
		// 				ignoreHTTPSErrors: true,
		// 				viewport: { width: 1920, height: 1080 },
		// 			},
		// 			video: 'on-first-retry'
		// 		}
		// 	},
		// },
		{
			name: 'webkit',
			use: {
				...devices['Desktop Safari'],
				saucelabs: {
					username: getEnv('SAUCE_USERNAME', ''),
					access_key: getEnv('SAUCE_ACCESS_KEY', ''),
					launchOptions: {
						args: [
							'--headless',
							'--no-sandbox',
							'--ignore-certificate-errors',
							'--allow-insecure-localhost',
							'--disable-infobars'
						]
					},
					contextOptions: {
						ignoreHTTPSErrors: true,
						viewport: { width: 1600, height: 1200 },
					},
					video: 'on-first-retry'
				}
			},
		},
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://127.0.0.1:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
});

