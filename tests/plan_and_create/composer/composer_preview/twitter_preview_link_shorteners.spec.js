//This test is to validate the twitter composer preview validations for link settings shorteners

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');

const URL = 'slack.com';
const SHORTENER = 'https://bit.ly';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter preview validations for link and link settings', async ({ page }) => {
	const composeBasicText = `Test ${URL}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const twAccount = 'pnc_hoot_sparky';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_tw_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_tw_preview');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems, 'Social accounts are visible on network picker dropdown').toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPreviewTitle, 'Link preview title is visible on composer preview').toBeVisible();
		await expect(composePage.twitterLinkPreviewSource, 'Link preview source is visible on composer preview').toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia, 'Link preview media is visible on composer preview').toBeVisible();
	});

	await test.step('Select add tracker and apply existing shortener on link settings modal', async () => {
		await composePage.selectAddTrackingButton();
		await expect(linkSettingsModal.linkSettingsModal, 'Link settings modal pop up is visible').toBeVisible();
		await linkSettingsModal.selectCustomizeButton();
		await linkSettingsModal.selectLinkShortenerDropdown();
		await linkSettingsModal.selectMenuItemByName('test');
		await linkSettingsModal.selectLinkSettingsApplyButton();
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyTwitterPreview('Test');
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.twitterLinkPrevewMedia, 'Link preview media is visible on composer preview').toBeVisible();
	});

});
