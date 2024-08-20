//This test is to validate the twitter composer preview validations for GA link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');
const createUser = require('../../../../custom-commands/createUser');
const {getObjectByName} = require('../../../../globals');

const URL = 'cbc.ca';
const TRACKER = 'Custom';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = '';
let twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Twitter preview validations for google analytics link settings', async ({ page }) => {
	const composeBasicText = `GA ${URL}`;
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & twitter account', async () => {
		await createNewUser.command('twitter_custom_link_settings', 'professional');
		await addFixture.command('tw1_custom','twitter', true, 300);
		twAccount = getObjectByName(global.fixture, 'tw1_custom').socialProfile.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('twitter_custom_link_settings');
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

	await test.step('Select add tracker button', async () => {
		await composePage.openLinkSettingsDialog();
		await linkSettingsModal.verifyLinkSettingsModal();
	});

	await test.step('Add a tracker for link',async () => {
		await expect(linkSettingsModal.customizePresetButton).toBeVisible();
		await linkSettingsModal.customizePresetButton.click();
		await expect(linkSettingsModal.linkSettingsTrackerDropdown).toBeVisible();
		await linkSettingsModal.linkSettingsTrackerDropdown.click();
		await linkSettingsModal.selectTracker(TRACKER);
		await linkSettingsModal.setLinkTrackingParameter(2, 'Social Network', PARAMETER_VALUE, PARAMETER_NAME);
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText('cbc.ca?utm_source=hootsuite&utm=twitter');
		await expect(linkSettingsModal.linkSettingsApplyButton).toBeVisible();
		await linkSettingsModal.linkSettingsApplyButton.click();
		await page.waitForTimeout(2000);
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
	});

	await test.step('Verify composer preview after applying tracking parameters', async () => {
		await composePage.verifyLinkInTwitterPreview('http://cbc.ca?utm_source=hootsuite&utm=twitter');
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(URL);
		await expect(composePage.twitterLinkPrevewMedia).toBeVisible();
	});
});
