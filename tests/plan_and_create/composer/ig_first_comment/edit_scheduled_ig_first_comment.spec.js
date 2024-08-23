/* Test to edit a scheduled IG first comment */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const scheduleDate = addHours(new Date(), 2);
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit scheduled instagram first comment', async ({ page }) => {
	const scheduleText = 'Schedule IG with comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Edit first comment #igFirstComment';
	const editedFirstCommentText = firstCommentText.concat('--editing the comment ');
	const scheduleTime = new Date();
	scheduleTime.setHours(scheduleTime.getHours() + 1);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_first_comment_edit', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_first_comment_edit');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Schedule an IG post with first comment', async () => {
		await plannerPage.scheduleIGPostWithFirstComment(
			memberId,
			getObjectByName(global.fixture, 'igb_first_comment_edit').instagramBusiness.id,
			scheduleText,
			formatISO(scheduleDate),
			firstCommentText
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await plannerPage.verifyFirstCommentInPreviewPane(firstCommentText);
	});

	await test.step('Edit scheduled message', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Verify the post in composer', async () => {
		await composePage.verifyInstagramPreview(scheduleText);
	});

	await test.step('Edit the first comment', async () => {
		await expect(composePage.firstCommentSubHeader).toBeVisible();
		await composePage.firstCommentTextArea.click();
		await composePage.firstCommentTextArea.fill(editedFirstCommentText);
	});

	await test.step('Verify first comment in preview', async () => {
		await composePage.verifyInstagramFirstCommentPreview(editedFirstCommentText);
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited first comment in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(scheduleText); //Verify post is not edited
		await plannerPage.verifyFirstCommentInPreviewPane(editedFirstCommentText); //Verify only first comment is edited
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
