/* Test to approve an IG post that has first comment */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {getObjectByName} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
let creatorMemberId, reviewerMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Approve an IG post with first comment', async ({ page }) => {
	const scheduleText = 'PW_Approve IG with comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Approve with comment #igFirstComment';
	const scheduleTime = new Date();
	scheduleTime.setHours(scheduleTime.getHours() + 1);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('approve_ig_first_comment_post', 'linkedin_enterprise', true, 300);
		creatorMemberId = global.member[0].memberId;
		reviewerMemberId = getObjectByName(global.fixture, 'approve_ig_first_comment_post').oneTimeReviewer.id;
	});

	await test.step('Schedule an IG post with first comment and reviewer', async () => {
		await plannerPage.scheduleIGPostWithFirstComment(
			creatorMemberId,
			getObjectByName(global.fixture, 'approve_ig_first_comment_post').instagramBusiness.id,
			scheduleText,
			scheduleTime,
			firstCommentText,
			reviewerMemberId
		);
	});

	await test.step('Remove creator details from global storage', async () => {
		new tearDown().command();
	});

	await test.step('Setup reviwer user', async () => {
		await addFixture.command('ig_first_comment_reviewer', 'teams_user', true, 300);
		reviewerMemberId = global.member[0].memberId;
	});

	await test.step('Login as reviewer', async () => {
		await loginPage.signInSkipOnboarding('ig_first_comment_reviewer');
		await expect(page.locator('//*[contains(@class, "homepage-welcome-header")]//*[contains(text(), "Create a post")]')).toBeVisible();
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Navigate to approvals view (Assigned to me)', async () => {
		await expect(plannerPage.contentTab).toBeVisible(); //Giving it some time so that entitlements check completes and approvals tab loads up
		await expect(plannerPage.approvalstab).toBeVisible();
		await plannerPage.approvalstab.click();
	});

	await test.step('Verify the scheduled message', async () => {
		await plannerPage.verifyScheduledMessage(scheduleText);
		await plannerPage.showPreviewPane(scheduleText);
	});

	await test.step('Verify content and first comment in preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await plannerPage.verifyFirstCommentInPreviewPane(firstCommentText);
	});

	await test.step('Approve the scheduled post', async () => {
		await expect(plannerPage.previewPaneApproveButton).toBeVisible();
		await plannerPage.previewPaneApproveButton.click();
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Verify the approved message is removed from the view', async () => {
		await plannerPage.verifyScheduledMessageNotPresent(scheduleText);
	});
});
