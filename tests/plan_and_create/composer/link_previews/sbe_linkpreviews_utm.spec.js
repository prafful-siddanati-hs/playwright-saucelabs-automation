/**
 * [https://hootsuite.atlassian.net/browse/SBE-6310]
 * Test to verify that a link and its UTM preview in composer.
 */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const {plan_create} = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Link containing bad thumbnail in composer', async ({ page }) => {
	const sbe_url = 'https://www.groundworks.com/';
	const composeText = `${plan_create.getComposeMessage()} ${sbe_url} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const fbAccount = 'HS FB Page';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_utm_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_utm_preview');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
	});

	await test.step('Verify linkedin link preview', async () => {
		await composePage.verifyFacebookPreview(composeText);
		await composePage.verifyLinkInFacebookPagePreview(sbe_url);
		await expect(composePage.facebookLinkPreviewTitle).toBeVisible();
		await expect(composePage.facebookLinkPreviewSource).toHaveText(sbe_url);
	});

	await test.step('Apply existing bit.ly link presets', async () => {
		await composePage.selectAddTrackingButton();
		await expect(linkSettingsModal.linkSettingsModal, 'Link settings modal pop up is visible').toBeVisible();
		await linkSettingsModal.selectLinkPresetsDropDown();
		await linkSettingsModal.selectPresetByName('test_sbe_case');
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Follow the link', async () => {
		const href = await composePage.facebookMessageLink.getAttribute('href');

		if (href) {
			await page.goto(href);
			await expect(page).toHaveURL(/^https:\/\/www\.groundworks\.com\/.*utm_source=facebook/);
		}
	});
});
