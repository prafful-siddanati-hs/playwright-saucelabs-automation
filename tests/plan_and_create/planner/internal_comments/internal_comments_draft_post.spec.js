/* Test to verify internal comments on draft posts is maintained when they are scheduled */
const { test, expect} = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const tearDown = require('../../../../custom-commands/tearDown');

const draftScheduleTime = addDays(new Date(), 1);
let enterpriseUserMemberId, profileName, userName;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify internal comments added to drafts are maintained when scheduled', async ({page}) => {
	let orgName = 'internal_comments_actions_org_' + Math.floor(Math.random() * 10000);
	const draftText = 'Add internal comment to this draft ';
	const draftCommentText = 'This is an internal comment on draft post ';
	let accounts = {
		plan_create_facebookpage: []
	};
	accounts.plan_create_facebookpage.push('fb_draft_internal_comments');

	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const draftsPage = new DraftsPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'internal_comment_drafts', accounts);
		profileName = getObjectByName(global.fixture, 'fb_draft_internal_comments').socialProfile.username;
		enterpriseUserMemberId = global.member[0].memberId;
		userName = global.member[0].username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('internal_comment_drafts');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(enterpriseUserMemberId);
		await plannerPage.hideRecommendedTimes(enterpriseUserMemberId);
	});

	await test.step('Delete residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(enterpriseUserMemberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Create an unscheduled draft', async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				enterpriseUserMemberId,
				null,
				getObjectByName(global.fixture, 'fb_draft_internal_comments').socialProfile.socialProfileId,
				draftText,
				'FACEBOOKPAGE',
				null,
				formatISO(draftScheduleTime),
			);
		} catch (error) {
			throw new Error(`Failed to create unscheduled draft: ${error}`);
		}
	});

	await test.step('Navigate to drafts', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(1);
	});

	await test.step('Verify scheduled draft message', async () => {
		await draftsPage.verifyDraftMessage(profileName, draftText, userName);
		await draftsPage.showPreviewPane(draftText);
	});

	await test.step('Verify internal comments is available for enterprise user', async () => {
		await plannerPage.verifyTextInPreviewPane(draftText);
		await expect(plannerPage.internalCommentsTab).toBeVisible();
		await plannerPage.internalCommentsTab.click();
		await expect(page.getByText('Comments will only be seen by you and your teammates. They won\'t be published.')).toBeVisible();
	});

	await test.step('Type an internal comment for draft post', async () => {
		await expect(plannerPage.internalCommentTextArea).toBeVisible();
		await plannerPage.internalCommentTextArea.click();
		await expect(plannerPage.saveInternalComment).toBeDisabled();
		await plannerPage.internalCommentTextArea.fill(draftCommentText);
		await expect(plannerPage.saveInternalComment).toBeEnabled();
		await plannerPage.saveInternalComment.click();
	});

	await test.step('Verify internal comment is successfully added', async () => {
		await expect(page.getByText(draftCommentText)).toBeVisible();
		await expect(plannerPage.editInternalComment).toBeVisible();
		await expect(plannerPage.copyInternalCommentLink).toBeVisible();
		await expect(plannerPage.deleteInternalComment).toBeVisible();
	});

	await test.step('Open the draft', async () => {
		await expect(draftsPage.editButtonOnSidePane).toBeVisible();
		await draftsPage.editButtonOnSidePane.click();
	});

	await test.step('Schedule the draft', async () => {
		await composePage.verifyFacebookPreview(draftText);
		await expect(composePage.scheduleButton).toBeVisible();
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify scheduled message in planner preview', async () => {
		await expect(plannerPage.calendarTab).toBeVisible();
		await plannerPage.calendarTab.click();
		await plannerPage.showPreviewPane(draftText);
	});

	await test.step('Verify internal comments is displayed as read-only for scheduled post', async () => {
		await plannerPage.internalCommentsTab.click();
		await page.getByRole('button', { name: 'Show 1 draft comment' }).click();
		await expect(page.getByText(draftCommentText)).toBeVisible();
		await expect(plannerPage.editInternalComment).not.toBeVisible(); // All comment actions should be hidden
		await expect(plannerPage.copyInternalCommentLink).not.toBeVisible();
		await expect(plannerPage.deleteInternalComment).not.toBeVisible();
		await expect(plannerPage.hideDraftComments).toBeVisible();
		await plannerPage.hideDraftComments.click();
		await expect(page.getByText(draftCommentText)).not.toBeVisible();
	});
});
