//This test is to validate the twitter error validations when multiple Twitter accounts are selected

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter preview validations for link and link settings', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const twAccount1 = 'pnc_hoot_sparky';
	const twAccount2 = 'HootTellez';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_tw_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_tw_preview');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select two twitter accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount1);
		await composePage.searchSocialProfile(twAccount2);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Verify twitter error message', async () => {
		const twitterMultipleNetworkErrorTitle = page.locator('//div[contains(@class, "vk-ProfileSelectorError")]//*[(@role="alert")]//*[text()="Only one Twitter account can be selected"]' ,{locationStrategy: 'xpath'});
		const twitterMultipleNetworkErrorMessage = page.locator('//div[contains(@class, "vk-ProfileSelectorError")]//*[(@role="alert")]//*[text()="Twitter doesn\'t allow publishing to multiple accounts at once."]' ,{locationStrategy: 'xpath'});

		await expect(twitterMultipleNetworkErrorTitle, 'Twitter error title is visible').toBeVisible();
		await expect(twitterMultipleNetworkErrorMessage, 'Twitter error message is visible').toBeVisible();
	});

});
