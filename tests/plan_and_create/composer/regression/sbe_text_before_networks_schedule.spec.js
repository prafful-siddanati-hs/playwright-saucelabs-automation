/**
 * [https://hootsuite.atlassian.net/browse/SBE-6257]
 * Tests whether entering the text before selecting networks schedules the post properly.
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const createUser = require('../../../../custom-commands/createUser.js');
const getFixture = require('../../../../custom-commands/getFixture.js');
const tearDown = require('../../../../custom-commands/tearDown.js');
const { getObjectByName } = require('../../../../globals.js');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Enter text before selecting networks and schedule', async ({ page }) => {
	const textbeforeNetworks = 'Entering text before networks '.concat(Math.floor(Math.random() * 1000));
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_enter_text_before_networks', 'professional');
		await addFixture.command('fb_1', 'plan_create_facebookpage', true, 240);
		await addFixture.command('fb_2', 'plan_create_facebookpage', true, 240);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('pw_enter_text_before_networks');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Add text to the message', async () => {
		await composePage.writeMessage(textbeforeNetworks);
		await composePage.verifyGenericPreview(textbeforeNetworks);
	});

	await test.step('Select both networks from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'fb_1').username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'fb_2').username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Verify preview is loaded for both networks', async () => {
		await expect(composePage.basePreviewLayout).toHaveCount(2);
		await expect(composePage.facebookPreviewText).toHaveCount(2);
		await expect(composePage.facebookPreviewText.first()).toHaveText(textbeforeNetworks);
		await expect(composePage.facebookPreviewText.last()).toHaveText(textbeforeNetworks);
	});

	await test.step('Schedule the post', async () => {
		await composePage.schedule();
	});

	await test.step('Verify there are two posts scheduled on planner', async () => {
		await expect(plannerPage.exitOnboardingPopover).toBeVisible();
		await plannerPage.exitOnboardingPopover.click();
		await plannerPage.weekViewPostCountHeader(2);
	});
});
