//This test is to validate the linkedin and instagram preview for GA link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../../globals');

const URL = 'hootsuite.com';
const TRACKER = 'Google Analytics';
let liAccount, igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Linkedin  preview and instagram validations for google analytics link settings', async ({ page }) => {
	const composeBasicText = `GA ${URL} `;
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_igb_GA_link_settings', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_igb_GA_link_settings').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'li_igb_GA_link_settings').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('li_igb_GA_link_settings');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select instagram and linkedin accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify twitter and facebook preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyLinkedInPreview(composeBasicText);
		await composePage.verifyLinkInLinkedInPreview(URL);
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyInstagramPreview(composeBasicText);
		await composePage.verifyLinkInInstagramPreview(URL);
	});

	await test.step('Select add tracker button', async () => {
		await composePage.openLinkSettingsDialog();
		await linkSettingsModal.verifyLinkSettingsModal();
	});

	await test.step('Add a tracker for link',async () => {
		await linkSettingsModal.selectCustomizeButton();
		await linkSettingsModal.selectLinkSettingsTrackerDropDown();
		await linkSettingsModal.selectTracker(TRACKER);
		await linkSettingsModal.setLinkTrackingParameter(2, 'Social Network');
		await linkSettingsModal.setLinkTrackingParameter(3, 'Social Profile');
		await linkSettingsModal.setLinkTrackingParameter(4, 'Post ID');
		await linkSettingsModal.setLinkTrackingParameter(5, 'Custom', 'test1');
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText('hootsuite.com?utm_source=hootsuite&utm_medium=twitter&utm_term=edt2&utm_content=271723&utm_campaign=test1');
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(5000);
	});

	await test.step('Verify composer preview after applying tracking parameters', async () => {
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
		await composePage.verifyLinkInLinkedInPreview('http://hootsuite.com?utm_source=hootsuite&utm_medium=linkedin');
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInInstagramPreview('http://hootsuite.com?utm_source=hootsuite&utm_medium=instagram');
	});

});
