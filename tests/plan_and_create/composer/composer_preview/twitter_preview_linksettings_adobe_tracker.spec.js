//This test is to validate the twitter composer preview validations for Adobe link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const createUser = require('../../../../custom-commands/createUser');
const {getObjectByName} = require('../../../../globals');

const URL = 'https://www.pinterest.com';
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = 'value';
let twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter preview validations for adobe link settings', async ({ page }) => {
	const composeBasicText = `Adobe ${URL}`;
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const  linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & twitter account', async () => {
		await createNewUser.command('twitter_adobe_link_settings', 'professional');
		await addFixture.command('tw_adobe','twitter', true, 300);
		twAccount = getObjectByName(global.fixture, 'tw_adobe').socialProfile.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('twitter_adobe_link_settings');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Verify account is selected', async () => {
		await composePage.verifySocialProfileSelected(twAccount);
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyLinkInTwitterPreview(URL);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
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
	});

	await test.step('Verify composer preview after applying tracking parameters', async () => {
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
		await composePage.verifyLinkInTwitterPreview(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
	});


});
