/* Test to verify that one time approver for a scheduled post can be updated, but only by the author of the post */
const { test,expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const tearDown = require('../../../../custom-commands/tearDown');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addDays } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');

const scheduleDate = addDays(new Date(), 1);
let adminMemberId, limitedUserMemberId, oneTimeApproverMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Change one time approver for a scheduled post', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const createScheduleMessage = new scheduleV3Message();

	let accounts = {
		twitter: ['tw_flex_approver_update']
	};
	let orgName = 'edit_flex_approver_' + Math.floor(Math.random() * 10000);
	const scheduleText = 'Update one time approver for this scheduled post ';

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'update_flex_approver', accounts);
		await createNewUser.command('limited_author_flex_approver');
		await addUserToNewOrg.command('limited_author_flex_approver', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'tw_flex_approver_update', 'limited_author_flex_approver');
		await createNewUser.command('team3s_flex_approver', 'team3s');
		await addUserToNewOrg.command('team3s_flex_approver', orgName);
		await updateSNPermissions.command('SN_ADVANCED', 'tw_flex_approver_update', 'team3s_flex_approver');
		limitedUserMemberId = global.member[1].memberId;
		adminMemberId = global.member[0].memberId;
		oneTimeApproverMemberId = global.member[2].memberId;
	});

	await test.step('Login as limited author user', async () => {
		await loginPage.signIn('limited_author_flex_approver');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(limitedUserMemberId);
		await plannerPage.hideRecommendedTimes(limitedUserMemberId);
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Schedule a post with one time approver', async () => {
		const options = {
			messages: [
				{
					socialProfileId: getObjectByName(global.fixture, 'tw_flex_approver_update').socialProfile.socialProfileId,
					text: scheduleText,
					scheduledSendTime: formatISO(scheduleDate),
					oneTimeReviewerId: parseInt(adminMemberId, 10)
				}
			]
		};
		await createScheduleMessage.command(parseInt(limitedUserMemberId, 10), options);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
	});

	await test.step('Verify Pending approval status and approval history', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Pending approval from ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});

	await test.step('Edit and change one time approver as author of the post', async () => {
		await plannerPage.editFromPreviewPane();
	});

	await test.step('Verify the post in composer', async () => {
		await composePage.verifyTwitterPreview(scheduleText);
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).toBeVisible();
		await expect(page.getByText('Invite a team member with access to the selected accounts to approve this post first.')).toBeVisible();
	});

	await test.step('Change the one time approver', async () => {
		await page.getByLabel(`Clear selection ${global.member[0].username}`).click();
		await page.getByRole('heading', { name: 'Ask for approval' }).click();
		await composePage.selectOneTimeApprover(`${global.member[2].fullName}`);
	});

	await test.step('Save the post with new one time approver', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.weekViewPostCountHeader(1); //Check count to ensure original post is edited instead of creating a new post
		await plannerPage.verifyTextInPreviewPane(scheduleText);
	});

	await test.step('Verify approval history shows the updated reviewer details', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Edited by ${(global.member[1].fullName)}`, { exact: true })).toBeVisible();
		await expect(page.locator('#modalDialog').getByText(`Pending approval from ${(global.member[2].fullName)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});

	await test.step('Logout from limited author user', async () => {
		await loginPage.logout();
	});

	await test.step('Login as team3s user', async () => {
		await loginPage.signInSkipOnboarding('team3s_flex_approver');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(oneTimeApproverMemberId);
	});

	await test.step('Navigate to planner for teams user', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify the scheduled message', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyScheduledMessage(scheduleText);
	});

	await test.step('Try to change one time approver as non-author user', async () => {
		await plannerPage.editFromPreviewPane();
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).toBeVisible();
		await expect(page.locator('.-messageSettingsContainer [disabled]')).toBeVisible(); // Ensure the one time approver dropdown is disabled
	});

	await test.step('Close the composer', async () => {
		await composePage.exitComposer();
	});

	await test.step('Verify save your changes pop up modal', async () => {
		await expect(composePage.saveDraftModalTitle).toHaveText('Save your changes?');
		await expect(composePage.discardChanges).toBeVisible();
		await composePage.discardChanges.click();
	});

	await test.step('Verify approval workflow is maintained & approve the scheduled post', async () => {
		await expect(page.locator('.vk-AuthorText').getByText(`Pending approval from ${(global.member[2].fullName)} (1 of 2)`, { exact: true })).toBeVisible();
		await expect(plannerPage.previewPaneApproveButton).toBeVisible();
		await plannerPage.previewPaneApproveButton.click();
		await expect(plannerPage.feCallOut).toBeVisible();
	});
});
