/* Test to duplicate a scheduled draft with IG first comment */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
let profileName, userName, memberId;
const draftScheduleTime = addHours(new Date() , 2);

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Duplicate a scheduled draft with IG first comment', async ({ page }) => {
	const scheduledDraftText = 'Scheduled IG draft with comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Draft first comment';
	const updateFirstCommentText = firstCommentText.concat('--updating #igFirstComment');
	const scheduleTime = new Date();
	scheduleTime.setHours(scheduleTime.getHours() + 1);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('duplicate_ig_first_comment_draft', 'pro_user_composer', true, 300);
		profileName = getObjectByName(global.fixture, 'duplicate_ig_first_comment_draft').instagramBusiness.username;
		memberId = global.member[0].memberId;
		userName = global.member[0].username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('duplicate_ig_first_comment_draft');
	});

	await test.step('Delete residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step('Create a scheduled draft with IG first comment', async () => {
		try {
			await draftsPage.createIGBDraftViaApi(
				memberId,
				null,
				getObjectByName(global.fixture, 'duplicate_ig_first_comment_draft').instagramBusiness.id,
				'IG_FEED',
				scheduledDraftText,
				'INSTAGRAMBUSINESS',
				formatISO(draftScheduleTime),
				firstCommentText
			);
		} catch (error) {
			throw new Error(`Error creating draft: ${error}`);
		}
	});

	await test.step('Navigate to drafts page', async () => {
		await draftsPage.visit();
	});

	await test.step('Verify scheduled draft message', async () => {
		await draftsPage.verifyDraftMessage(profileName, scheduledDraftText, userName);
		await draftsPage.showPreviewPane(scheduledDraftText);
		await plannerPage.verifyFirstCommentInPreviewPane(firstCommentText);
	});

	await test.step('Duplicate the scheduled post', async () => {
		await page.waitForTimeout(2000);
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Verify the post & first comment in composer', async () => {
		await composePage.verifyInstagramPreview(scheduledDraftText);
		await plannerPage.verifyFirstCommentInPreviewPane(firstCommentText);
	});

	await test.step('Update the draft', async () => {
		await composePage.writeMessage('--Duplicated');
	});

	await test.step('Update the first comment', async () => {
		await composePage.firstCommentTextArea.click();
		await composePage.firstCommentTextArea.fill(updateFirstCommentText);
		await expect(composePage.firstCommentSubHeader).toBeVisible();
	});

	await test.step('Verify updated first comment in preview', async () => {
		await composePage.verifyInstagramFirstCommentPreview(updateFirstCommentText);
	});

	await test.step('Schedule the draft', async () => {
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Verify scheduled message in planner', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.calendarTab).toBeVisible();
		await plannerPage.calendarTab.click();
		await plannerPage.showPreviewPane(scheduledDraftText.concat('--Duplicated'));
		await plannerPage.verifyTextInPreviewPane(scheduledDraftText.concat('--Duplicated'));
		await plannerPage.verifyFirstCommentInPreviewPane(updateFirstCommentText);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
