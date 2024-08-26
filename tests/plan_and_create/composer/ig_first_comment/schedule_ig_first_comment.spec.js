/* Test to schedule Instagram message with first comment */

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
let profile, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Schedule instagram message with first comment', async ({ page }) => {
	const scheduleText = 'Schedule IGB with comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Schedule with first comment #igFirstComment';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_first_comment_schedule', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'igb_first_comment_schedule').instagramBusiness.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_first_comment_schedule');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select IGB account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(profile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Upload media to the post', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(scheduleText);
		await composePage.verifyInstagramPreview(scheduleText);
	});

	await test.step('Add first comment', async () => {
		await expect(composePage.firstCommentHeader).toBeVisible();
		await composePage.firstCommentTextArea.click();
		await composePage.firstCommentTextArea.type(firstCommentText);
	});

	await test.step('Verify first comment in preview', async () => {
		await composePage.verifyInstagramFirstCommentPreview(firstCommentText);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(scheduleText);
	});

	await test.step('Verify first comment in planner preview pane', async () => {
		await plannerPage.verifyFirstCommentInPreviewPane(firstCommentText);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
