//This test is to validate linkedin and instagram accounts preview for Adobe link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../../globals');

const URL = 'https://www.pinterest.com';
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = 'value';
let liAccount, igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Linkedin and instagram accounts preview validations for adobe link settings', async ({ page }) => {
	const composeBasicText = `Adobe ${URL} `;
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const  linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_igb_adobe_link_settings', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_igb_adobe_link_settings').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'li_igb_adobe_link_settings').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('li_igb_adobe_link_settings');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select linkedin and instagram accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify instagram and linkedin preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyInstagramPreview(composeBasicText);
		await composePage.verifyLinkInInstagramPreview(URL);
		await composePage.verifyLinkedInPreview(composeBasicText);
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInLinkedInPreview(URL);
	});

	await test.step('Select add tracker button on composer', async () => {
		await composePage.openLinkSettingsDialog();
		await linkSettingsModal.verifyLinkSettingsModal();
	});

	await test.step('Set a adobe tracking parameter', async () => {
		await linkSettingsModal.selectCustomizeButton();
		await expect(linkSettingsModal.linkSettingsTrackerDropdown).toBeVisible();
		await linkSettingsModal.linkSettingsTrackerDropdown.click();
		await linkSettingsModal.selectTracker(TRACKER);
		await linkSettingsModal.setAdobeTrackingParameter(PARAMETER_NAME, PARAMETER_VALUE);
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
		await linkSettingsModal.selectLinkSettingsApplyButton();
		await page.waitForTimeout(5000);
	});

	await test.step('Verify composer preview after applying tracking parameters', async () => {
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
		await composePage.verifyLinkInLinkedInPreview(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
		await expect(composePage.linkedinLinkPreviewTitle).toBeVisible();
		await expect(composePage.linkedinLinkPreviewSource).toContainText(URL);
		await expect(composePage.linkedinLinkPrevewMedia).toBeVisible();
		await composePage.verifyLinkInInstagramPreview(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
	});

});
