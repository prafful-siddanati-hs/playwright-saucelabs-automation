//This test is to validate the LinkedIn and instagram accounts preview for link settings shorteners

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

test('Linkedin and instagram accounts preview validations for link and existing link shortener', async ({ page }) => {
	const composeBasicText = `Test ${URL} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const liAccount = 'Standard Publisher Account One';
	const liCompanyAccount = 'DevtestCo';
	const igbAccount = 'hoottel_var';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_li_igb_preview_shortener', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('pw_li_igb_preview_shortener');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin and instagram accounts from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.searchSocialProfile(liAccount);
		await composePage.searchSocialProfile(liCompanyAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview')).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyLinkedInCompanyPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await expect(page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody p')).toContainText(composeBasicText);
		await expect(page.locator('.rc-Composer [type="LINKEDIN"] .vk-LinkedInPreview .vk-MessageLinkPreview .vk-LinkPreviewTitle')).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkedInCompanyPreview(composeBasicText);
		await expect(composePage.linkedinLinkCompanyPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkCompanyPreviewSource).toContainText(URL);
		await expect(composePage.linkedinCompanyLinkPrevewMedia).toBeVisible();
		await composePage.verifyInstagramPreview(composeBasicText);
	});

	await test.step('Select add tracker and apply existing shortener on link settings modal', async () => {
		await composePage.selectAddTrackingButton();
		await expect(linkSettingsModal.linkSettingsModal, 'Link settings modal pop up is visible').toBeVisible();
		await linkSettingsModal.selectCustomizeButton();
		await linkSettingsModal.selectLinkShortenerDropdown();
		await linkSettingsModal.selectMenuItemByName('test');
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(2000);
	});

	await test.step('Verify applied presets on composer preview', async () => {
		await composePage.verifyInstagramPreview('Test');
		await composePage.verifyLinkInInstagramPreview(SHORTENER);

		await composePage.verifyLinkedInCompanyPreview('Test');
		await expect(composePage.linkedinCompanyLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInLinkedInCompanyPreview(SHORTENER);

		await expect(page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody p')).toContainText('Test');
		await expect(page.locator('.vk-ComposerModal [type="LINKEDIN"] .vk-LinkedInPreview .vk-ContentBody a')).toContainText(SHORTENER);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
	});

});
