const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const { getObjectByName } = require('../../../../globals');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
let igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify schedule message as instagram story from planner', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const plannerPage = new PlannerPage(page);
	const composeBasicText = `Schedule Instagram Story! ${Date.now()}`;

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_story_schedule_planner', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igb_story_schedule_planner').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('igb_story_schedule_planner');
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Select new post from planner', async () => {
		await plannerPage.selectPost(plannerPage.newPost);
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

	await test.step('Schedule the message', async () => {
		await composePage.scheduleButton.click();
		await expect(composePage.scheduleButton, 'Schedule message failed from composer').not.toBeVisible();
		await expect(composePage.feCallOuts).toHaveCount(1);
	});

	await test.step('Verify scheduled message in week view', async () => {
		await plannerPage.verifyScheduledMessage(igbAccount, composeBasicText);
		await plannerPage.showPreviewPane(composeBasicText);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
		await page.waitForTimeout(1000);
	});
});
