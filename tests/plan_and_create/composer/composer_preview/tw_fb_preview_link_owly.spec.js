//This test is to validate the twitter and facebook preview for link with ow.ly shortener

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');

const URL = 'slack.com';
const SHORTENER = 'https://ow.ly';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter and facebook page preview validations for link and ow.ly shortener', async ({ page }) => {
	const composeBasicText = `Test ${URL}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const twAccount = 'pnc_hoot_sparky';
	const fbAccount = 'Li\'s Tong Emporium';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_tw_fb_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_tw_fb_preview');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter and facebook page accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message and verify twitter and facebook page preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
		await composePage.verifyFacebookPreview(composeBasicText);
		await composePage.verifyLinkInFacebookPagePreview(URL);
		await expect(composePage.facebookLinkPreviewTitle).toBeVisible();
		await expect(composePage.facebookLinkPreviewSource).toContainText(URL);
		await expect(composePage.facebookLinkPrevewMedia).toBeVisible();
		await expect(page.locator('//label[contains(text(),"Links")]//following::*[contains(text(), "(1)")]')).toBeVisible();
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with image').toBeVisible();
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
		await expect(composePage.facebookPreviewSingleImage, 'Facebook preview is updated with image').toBeVisible();
		await expect(composePage.facebookPreviewSingleImage).toHaveAttribute('src', /staging/);
		await composePage.verifyLinkInFacebookPagePreview(URL);
		await expect(composePage.facebookLinkPrevewMedia).not.toBeVisible();
	});

	await test.step('Shorten the link to ow.ly shortener', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
		await expect(composePage.facebookLinkPrevewMedia).not.toBeVisible();
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Select edit link shortening and select existing presets', async () => {
		const linkPreset = page.locator('[data-testid="With Owly-select-item"]', { hasText: 'With Owly' });

		await composePage.selectAddTrackingButton();
		await linkSettingsModal.selectLinkPresetsDropDown();
		await expect(linkPreset).toBeVisible();
		await linkPreset.click();
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(2000);
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyTwitterPreview('Test');
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
		await composePage.verifyFacebookPreview('Test');
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
		await expect(composePage.facebookLinkPrevewMedia).not.toBeVisible();
	});

});
