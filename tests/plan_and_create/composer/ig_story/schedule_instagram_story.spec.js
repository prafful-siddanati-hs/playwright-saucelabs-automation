const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const { getObjectByName } = require('../../../../globals');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
let igbAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify schedule message as instagram story from composer', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const plannerPage = new PlannerPage(page);
	const composeBasicText = `Schedule Instagram Story! ${Date.now()}`;

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_story_schedule', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igb_story_schedule').instagramBusiness.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('igb_story_schedule');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select instagram and linkedin accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Select IG story toggle', async () => {
		await expect(composePage.igToggleDropdown).toBeVisible();
		await composePage.igToggleDropdown.click();
		await expect(composePage.igStoryToggleDropdown).toBeVisible();
		await composePage.igStoryToggleDropdown.click();
	});

	await test.step('Write a message and verify instagram preview', async () => {
		await composePage.writeMessage(composeBasicText);
	});

	await test.step('Upload an image from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramStoryPreviewSingleImage).toBeVisible();
	});

	await test.step('Schedule the messages', async () => {
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in week view', async () => {
		await plannerPage.verifyScheduledMessage(igbAccount, composeBasicText);
	});

	await test.step('Delete the scheduled messages', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
		await page.waitForTimeout(1000);
	});
});
