const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {getObjectByName} = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { SetUpEnterpriseUser } = require('../../../custom-commands/setUpEnterpriseUser');
const URL = 'slack.com';
const URL2 = 'https://www.facebook.com';
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = 'value';

/* Test to apply tracking parameters to links. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Track applied linksettings', async ({ page }) => {
	let linkSettingsTrackOrg = 'PW_linkSettings_Track_'.concat(Math.floor(Math.random() * 1000));
	const linkSettingTrackText = `Track links! ${URL} and ${URL2} ${Math.floor(Math.random() * 1000)} `;
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	let accounts = {
		plan_create_facebookpage: []
	};
	accounts.plan_create_facebookpage.push('pw_fb_link_track');

	await test.step('Setup enterprise user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(linkSettingsTrackOrg, 'pw_link_track', accounts);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_link_track');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify facebook is selected on social network picker', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'pw_fb_link_track').username);
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message with link', async () => {
		await composePage.writeMessage(linkSettingTrackText);
		await composePage.verifyFacebookPreview(linkSettingTrackText);
	});

	await test.step('Open link settings modal', async () => {
		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await expect(composePage.linkSettingsNoTracker).toBeVisible();
		await expect(composePage.linkSettingsNoShortner).toBeVisible();
	});

	await test.step('Add a tracker',async () => {
		await composePage.selectLink(URL);
		await expect(composePage.customizePresetButton).toBeVisible();
		await composePage.customizePresetButton.click();
		await expect(composePage.linkSettingsTrackerDropdown).toBeVisible();
		await composePage.linkSettingsTrackerDropdown.click();
		await composePage.selectTracker(TRACKER);
	});

	await test.step('Set a tracking parameter', async () => {
		await composePage.setTrackingParameter(PARAMETER_NAME, PARAMETER_VALUE);
	});

	await test.step('Verify & apply the tracking parameter', async () => {
		const exampleURL = page.getByTestId('LinkPreviewWithUTM');
		await expect(exampleURL).toContainText(`${URL}?${PARAMETER_NAME}=${PARAMETER_VALUE}`);
		await expect(composePage.linkSettingsApplyButton).toBeVisible();
		await composePage.linkSettingsApplyButton.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify the tracker is applied', async () => {
		await expect(composePage.facebookPreviewText).toContainText(PARAMETER_NAME);
		await expect(composePage.facebookPreviewText).toContainText(PARAMETER_VALUE);
		await expect(composePage.facebookPreviewText).toContainText(URL2);
	});

	await test.step('Schedule the message', async () => {
		await page.waitForTimeout(1000);
		await composePage.selectMessageScheduleDate();
	});
});
