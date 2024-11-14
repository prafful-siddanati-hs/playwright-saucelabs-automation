const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const { LoginPage } = require('../../../pages/login');
const { OverviewPage } = require('../../../pages/identity/T&O/overview');
const { SetUpEnterpriseUser } = require('../../../custom-commands/setUpEnterpriseUser');
const { HomePage } = require('../../../pages/homepage');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Overview page functional tests', async ({ page }) => {
	const homePage = new HomePage(page);
	const overviewPage = new OverviewPage(page);

	await test.step('Login as an enterprise user', async () => {
		const orgName = 'identity_test_org_' + Math.floor(Math.random() * 10000);
		let accounts = {
			twitter: []
		};

		const userSetUp = new SetUpEnterpriseUser();
		const loginPage = new LoginPage(page);

		await userSetUp.setUpEnterpriseUser(orgName, 'identity', accounts, 'enterprise_user_identity');
		await loginPage.signInSkipOnboarding('identity');
	});

	await test.step('Navigate to Overview page via sidebar button on the Home page', async () => {
		await homePage.homePageAccountButton.click();
		await expect(homePage.homePageSocialAccountsAndTeamsButton).toBeVisible();

		await homePage.homePageSocialAccountsAndTeamsButton.click();
	});

	await test.step('Verify Overview page loads successfully', async() => {
		await expect(overviewPage.pageHeader).toBeVisible();
	});
});
