const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const createUser = require('../../../custom-commands/createUser');
const { getObjectByName, plan_create } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const SHORTENER = 'https://ow.ly';

/* Test to verfy link settings on composer. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify links settings on composer', async ({ page }) => {
	const url = plan_create.getRandomUrl();
	const linkText = `Link settings ${url} ${Math.floor(Math.random() * 100)} `;
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Create user & add social network', async () => {
		await createNewUser.command('pw_link_settings', 'professional');
		await addFixture.command('fb_link_settings', 'plan_create_facebookpage', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('pw_link_settings');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
		await composePage.exitButton.click();
	});

	await test.step('Verify facebook is selected on social network picker', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'fb_link_settings').username);
		await expect(composePage.profileListItemTitle).not.toBeVisible();
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
	});

	await test.step('Verify the shortened url is updated in preview', async () => {
		await composePage.verifyFacebookPreview(SHORTENER);
		await expect(composePage.facebookPreviewText).not.toContainText(url);
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
	});

	await test.step('Select a date to schedule the message', async () => {
		await page.waitForTimeout(1000);
		await composePage.selectMessageScheduleDate();
	});
});
