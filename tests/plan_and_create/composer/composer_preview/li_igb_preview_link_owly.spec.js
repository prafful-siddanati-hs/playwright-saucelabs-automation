//This test is to validate the linkedin and instagram preview for link with ow.ly shortener

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

test('Linkedin and instagram business accounts preview validations for link and ow.ly shortener', async ({ page }) => {
	const composeBasicText = `Test ${URL} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const liAccount = 'Standard Publisher Account One';
	const liCompanyAccount = 'DevtestCo';
	const igbAccount = 'hoottel_var';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_li_igb_preview', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_li_igb_preview');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin and instagram business accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.searchSocialProfile(liAccount);
		await composePage.searchSocialProfile(liCompanyAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyLinkedInCompanyPreview).toBeVisible();
	});

	await test.step('Write a message and verify linkedin and instagram preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyLinkedInPreview(composeBasicText);
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkedInCompanyPreview(composeBasicText);
		await expect(composePage.linkedinLinkCompanyPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkCompanyPreviewSource).toContainText(URL);
		await expect(composePage.linkedinCompanyLinkPrevewMedia).toBeVisible();
		await composePage.verifyInstagramPreview(composeBasicText);
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');

		await composePage.verifyLinkInInstagramPreview(URL);
		await expect(composePage.instagramPreviewSingleImage, 'Instagram preview is updated with image').toBeVisible();

		await composePage.verifyLinkInLinkedInPreview(URL);
		await expect(composePage.linkedInPreviewSingleImage, 'LinkedIn preview is not updated with image').toBeVisible();
		await expect(composePage.linkedinLinkPrevewMedia).not.toBeVisible();

		await composePage.verifyLinkInLinkedInCompanyPreview(URL);
		await expect(composePage.linkedInCompanyPreviewSingleImage, 'LinkedIn company preview is not updated with image').toBeVisible();
		await expect(composePage.linkedinCompanyLinkPrevewMedia).not.toBeVisible();
	});

	await test.step('Shorten the link to ow.ly shortener', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkInInstagramPreview(SHORTENER);
		await composePage.verifyLinkInLinkedInPreview(SHORTENER);
		await expect(composePage.linkedinLinkPrevewMedia).not.toBeVisible();
		await composePage.verifyLinkInLinkedInCompanyPreview(SHORTENER);
		await expect(composePage.linkedinCompanyLinkPrevewMedia).not.toBeVisible();
	});

	await test.step('Select edit link shortening and select existing presets', async () => {
		const linkPreset = page.locator('[data-testid="With Owly-select-item"]', { hasText: 'With Owly' });

		await composePage.selectEditLinkShorteningButton();
		await linkSettingsModal.selectLinkPresetsDropDown();
		await expect(linkPreset).toBeVisible();
		await linkPreset.click();
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(2000);
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyLinkedInPreview('Test');
		await composePage.verifyLinkInLinkedInPreview(SHORTENER);

		await composePage.verifyLinkedInCompanyPreview('Test');
		await composePage.verifyLinkInLinkedInCompanyPreview(SHORTENER);

		await composePage.verifyInstagramPreview('Test');
		await composePage.verifyLinkInInstagramPreview(SHORTENER);
	});

});
