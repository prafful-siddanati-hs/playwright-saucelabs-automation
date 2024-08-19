//This test is to validate the twitter composer preview validations for link with ow.ly shortener

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');

const URL = 'slack.com';
const SHORTENER = 'https://ow.ly';

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
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with image').toBeVisible();
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
	});

	await test.step('Shorten the link to ow.ly shortener', async () => {
		await expect(composePage.shortenWithOwlyButton).toBeVisible();
		await composePage.shortenWithOwlyButton.click();
		await page.waitForTimeout(2000);
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
	});

	await test.step('Select edit link shortening and select existing presets', async () => {
		const linkPreset = page.locator('[data-testid="With Owly-select-item"]', { hasText: 'With Owly' });

		await expect(composePage.editLinkShorteningButton).toBeVisible();
		await composePage.editLinkShorteningButton.click();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await composePage.presetSelectDropdown.click();
		await expect(linkPreset).toBeVisible();
		await linkPreset.click();
		await composePage.linkSettingsApplyButton.click();
		await page.waitForTimeout(2000);
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyTwitterPreview('Test');
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.twitterLinkPrevewMedia).not.toBeVisible();
	});

});
