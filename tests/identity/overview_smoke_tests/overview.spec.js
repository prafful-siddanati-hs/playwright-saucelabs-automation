const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const { LoginPage } = require('../../../pages/login');
const { OverviewPage } = require('../../../pages/identity/T&O/overview');
const { SetUpEnterpriseUser } = require('../../../custom-commands/setUpEnterpriseUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Header functional tests', async ({ page }) => {
	let overviewPage;

	await test.step('Login as enterprise user', async() => {
		const orgName = 'identity_test_org_' + Math.floor(Math.random() * 10000);
		let accounts = {
			twitter: []
		};

		const userSetUp = new SetUpEnterpriseUser();
		const loginPage = new LoginPage(page);

		await userSetUp.setUpEnterpriseUser(orgName, 'identity', accounts, 'enterprise_user_identity');
		await loginPage.signInSkipOnboarding('identity');

		overviewPage = new OverviewPage(page);
		await overviewPage.visit();
	});

	await test.step('New button should be visible and clickable', async () => {

		await expect(overviewPage.pageHeaderActionButton).toBeVisible();
		await expect(overviewPage.pageHeaderActionButton).toBeEnabled();
	});

	await test.step('Click the new button opens dropdown with expected options', async () => {
		await overviewPage.pageHeaderActionButton.click();

		await expect(overviewPage.createNewTeamOption).toBeVisible();
		await expect(overviewPage.inviteNewMembersOption).toBeVisible();
		await expect(overviewPage.addSocialAccountsOption).toBeVisible();
	});

	await test.step('Dropdown closes when clicking outside', async () => {
		await page.click('body');

		await expect(overviewPage.createNewTeamOption).not.toBeVisible();
		await expect(overviewPage.inviteNewMembersOption).not.toBeVisible();
		await expect(overviewPage.addSocialAccountsOption).not.toBeVisible();
	});
});
