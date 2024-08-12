const { test, expect } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const SHORTENER = 'https://ow.ly';
let twAccount, memberId;

/* Test to verify link settings on composer. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify links settings on composer', async ({ page }) => {
	const url = plan_create.getRandomUrl();
	const linkText = `Link settings ${url} ${Math.floor(Math.random() * 100)} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Create user & add social network', async () => {
		await addFixture.command('pw_link_settings', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'pw_link_settings').twitter.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('pw_link_settings');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message with link', async () => {
		await composePage.writeMessage(linkText);
	});

	await test.step('Open link settings dialog', async () => {
		await composePage.openLinkSettingsDialog();
		await expect(composePage.presetSelectDropdown).toBeVisible();
		await expect(composePage.linkSettingsNoTracker).toBeVisible();
		await expect(composePage.linkSettingsNoShortner).toBeVisible();
	});

	await test.step('Verify tracking parameter options are displayed', async () => {
		await expect(composePage.customizePresetButton).toBeVisible();
		await composePage.customizePresetButton.click();
		await expect(composePage.linkSettingsTrackerDropdown).toBeVisible();
		await composePage.linkSettingsTrackerDropdown.click();
		await expect(composePage.linkSettingsCutomTracker).toBeVisible();
		await composePage.linkSettingsCutomTracker.click();
		await expect(composePage.trackingParametersTable).toBeVisible();
		await expect(composePage.linkSettingsAddParameterButton).toBeVisible();
	});

	await test.step('Shorten the url', async () => {
		await expect(composePage.linkSettingsShortenerDropdown).toBeVisible();
		await composePage.linkSettingsShortenerDropdown.click();
		await composePage.linkShortener.click();
		await expect(composePage.linkSettingsApplyButton).toBeVisible();
		await composePage.linkSettingsApplyButton.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(composePage.editCustomLinkSettingsButton).toBeVisible();
	});

	await test.step('Verify the shortened url is updated in preview', async () => {
		await composePage.verifyTwitterPreview(SHORTENER);
		await expect(composePage.twitterPreviewText).not.toContainText(url);
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

});
