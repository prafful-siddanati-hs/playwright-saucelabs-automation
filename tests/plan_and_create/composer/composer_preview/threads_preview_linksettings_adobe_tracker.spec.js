//This test is to validate the threads preview for Adobe link settings

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {LinkSettingsModal} = require('../../../../pages/planandcreate/linkSettingsModal');
const getFixture = require('../../../../custom-commands/getFixture');

const URL = 'https://www.pinterest.com';
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = 'value';
let thAccount = 'freshestdonut';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Threads preview validations for adobe link settings', async ({ page }) => {
	const composeBasicText = `Adobe ${URL}`;
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const  linkSettingsModal = new LinkSettingsModal(page);
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_th_preview_adobe', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('pw_th_preview_adobe');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select threads account from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(thAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
	});

	await test.step('Write a message and verify threads preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyThreadsPreview(composeBasicText);
		await composePage.verifyLinkInThreadsPreview(URL);
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
		await composePage.verifyLinkInThreadsPreview(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
	});

});
