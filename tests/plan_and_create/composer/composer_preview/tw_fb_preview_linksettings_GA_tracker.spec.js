//This test is to validate the twitter and facebook preview for GA link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../../globals');

const URL = 'hootsuite.com';
const TRACKER = 'Google Analytics';
let twAccount, fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter preview and facebook page validations for google analytics link settings', async ({ page }) => {
	const composeBasicText = `GA ${URL} `;
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tw_fb_GA_link_settings', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'tw_fb_GA_link_settings').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'tw_fb_GA_link_settings').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('tw_fb_GA_link_settings');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select twitter and facebook page accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message and verify twitter and facebook preview', async () => {
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
		await composePage.verifyLinkInTwitterPreview(`http://hootsuite.com?utm_source=hootsuite&utm_medium=twitter&utm_term=${twAccount.toLowerCase()}`);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInFacebookPagePreview('http://hootsuite.com?utm_source=hootsuite&utm_medium=facebook');
		await expect(composePage.facebookLinkPreviewTitle).toBeVisible();
		await expect(composePage.facebookLinkPreviewSource).toContainText(URL);
		await expect(composePage.facebookLinkPrevewMedia).toBeVisible();
	});

});
