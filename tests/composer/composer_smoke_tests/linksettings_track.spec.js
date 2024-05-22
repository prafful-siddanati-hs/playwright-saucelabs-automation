const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const {getObjectByName} = require('../../../globals');
const { LoginPage } = require('../../../pages/login');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const {PlannerPage} = require('../../../pages/planandcreate/planner');
const URL = 'slack.com';
const URL2 = 'https://www.facebook.com';
const TRACKER = 'Adobe Analytics';
const PARAMETER_NAME = 'utm';
const PARAMETER_VALUE = 'value';
let fbAccount, memberId;
/* Test to apply tracking parameters to links. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Track applied linksettings', async ({ page }) => {
	const linkSettingTrackText = `Track links! ${URL} and ${URL2} ${Math.floor(Math.random() * 1000)} `;
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup enterprise user & account', async () => {
		await addFixture.command('pw_link_track', 'enterprise_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'pw_link_track').facebookPage.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signIn('pw_link_track');
		const isViewVisible = await Promise.race([
			loginPage.streamsView.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			loginPage.homePageWidget.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isViewVisible).toBeTruthy();
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook page from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
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
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
	});

	await test.step('Verify the tracker is applied', async () => {
		await expect(composePage.facebookPreviewText).toContainText(PARAMETER_NAME);
		await expect(composePage.facebookPreviewText).toContainText(PARAMETER_VALUE);
		await expect(composePage.facebookPreviewText).toContainText(URL2);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

});
