//This test is to validate the twitter preview when existing presets and shorteners are applied to the link

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');

const SHORTENER = 'https://ow.ly';
const URL = 'hootsuite.com';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter and facebook page preview validations for link and existing link shortener', async ({ page }) => {
	const composeBasicText = `Test ${URL}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const twAccount = 'pnc_hoot_sparky';
	const fbAccount = 'Li\'s Tong Emporium';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_tw_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_tw_preview');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter and facebook page accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems, 'Social accounts are visible on network picker dropdown').toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
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
		await linkSettingsModal.selectLinkPresetsDropDown();
		await linkSettingsModal.selectPresetByName('Preset 1');
		await linkSettingsModal.selectCustomizeButton();
		await linkSettingsModal.selectLinkShortenerDropdown();
		await linkSettingsModal.selectMenuItemByName('Ow.ly');
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(3000);
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyTwitterPreview('Test');
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
	});

});
