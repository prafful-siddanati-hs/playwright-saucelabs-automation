/* Test to verify that one time approver can be added to a saved draft before scheduling it */
const { test,expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const tearDown = require('../../../../custom-commands/tearDown');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');

let authorMemberId, reviewerMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Add one time approver to unscheduled draft', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const draftsPage = new DraftsPage(page);
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const updateSNPermissions = new modifySocialProfilePermissions();

	let accounts = {
		plan_create_facebookpage: []
	};
	accounts.plan_create_facebookpage.push('fb_flex_approver_draft');
	let orgName = 'add_one_time_approver_to_draft_' + Math.floor(Math.random() * 10000);
	const draftText = 'Add one time approver to this draft ';

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'draft_flex_reviewer', accounts);
		await createNewUser.command('draft_author', 'professional');
		await addUserToNewOrg.command('draft_author', orgName);
		await updateSNPermissions.command('SN_ADVANCED', 'fb_flex_approver_draft', 'draft_author');
		reviewerMemberId = global.member[0].memberId;
		authorMemberId = global.member[1].memberId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('draft_author');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(authorMemberId);
		await plannerPage.hideRecommendedTimes(authorMemberId);
	});

	await test.step('Delete residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(authorMemberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Create an unscheduled draft', async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				authorMemberId,
				null,
				getObjectByName(global.fixture, 'fb_flex_approver_draft').socialProfile.socialProfileId,
				draftText,
				'FACEBOOKPAGE'
			);
		} catch (error) {
			throw new Error(`Failed to create unscheduled draft: ${error}`);
		}
	});

	await test.step('Navigate to drafts', async () => {
		await draftsPage.visit();
		await expect(draftsPage.draftItem).toHaveCount(1);
	});

	await test.step('Edit the draft', async () => {
		await draftsPage.editDraftByContent(draftText);
		await composePage.verifyFacebookPreview(draftText);
	});

	await test.step('Add a one time approver', async () => {
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).toBeVisible();
		await expect(page.getByText('Invite a team member with access to the selected accounts to approve this post first.')).toBeVisible();
		await composePage.selectOneTimeApprover(`${global.member[0].username}`);
	});

	await test.step('Schedule the draft', async () => {
		await composePage.schedule();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify scheduled message in planner preview', async () => {
		await expect(plannerPage.calendarTab).toBeVisible();
		await plannerPage.calendarTab.click();
		await plannerPage.showPreviewPane(draftText);
	});

	await test.step('Verify approval history displays the added reviewer details', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Sent for approval by ${(global.member[1].fullName)}`, { exact: true })).toBeVisible();
		await expect(page.locator('#modalDialog').getByText(`Pending approval from ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});

	await test.step('Logout from author', async () => {
		await loginPage.logout();
	});

	await test.step('Login as reviewer (admin user)', async () => {
		await loginPage.signInSkipOnboarding('draft_flex_reviewer');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(reviewerMemberId);
		await plannerPage.hideRecommendedTimes(reviewerMemberId);
	});

	await test.step('Navigate to planner for author user', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify the scheduled message', async () => {
		await plannerPage.showPreviewPane(draftText);
		await plannerPage.verifyScheduledMessage(draftText, getObjectByName(global.fixture, 'fb_flex_approver_draft').socialProfile.username);
	});

	await test.step('Reject as one time reviewer', async () => {
		await expect(plannerPage.previewPaneRejectButton).toBeVisible();
		await plannerPage.previewPaneRejectButton.click();
		await expect(plannerPage.rejectModalInput).toBeVisible();
		await plannerPage.rejectModalInput.fill('Wrong Content');
		await expect(plannerPage.rejectModalRejectButton).toBeVisible();
		await plannerPage.rejectModalRejectButton.click();
		await expect(composePage.feCallOuts).toBeVisible();
	});
});
