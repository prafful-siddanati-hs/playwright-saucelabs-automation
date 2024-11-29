/* Test to add a one time approver while duplicating a scheduled post */
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
let authorMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Add one time approver while duplicating a scheduled post', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const createScheduleMessage = new scheduleV3Message();

	let accounts = {
		plan_create_facebookpage: ['fb_flex_approver_duplicate']
	};
	let orgName = 'add_flex_approver_duplicate_' + Math.floor(Math.random() * 10000);
	const scheduleText = 'Add one time approver while duplicating this post ';
	const editedText = scheduleText.concat('--included one time approver');

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'flex_approver_duplicate', accounts);
		await createNewUser.command('duplicate_author', 'professional');
		await addUserToNewOrg.command('duplicate_author', orgName);
		await updateSNPermissions.command('SN_ADVANCED', 'fb_flex_approver_duplicate', 'duplicate_author');
		authorMemberId = global.member[1].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInSkipOnboarding('duplicate_author');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(authorMemberId);
		await plannerPage.hideRecommendedTimes(authorMemberId);
	});

	await test.step('Schedule a post', async () => {
		await createScheduleMessage.command(
			parseInt(authorMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.socialProfileId,
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleDate),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
	});

	await test.step('Duplicate the scheduled post', async () => {
		await plannerPage.duplicateFromPreviewPane();
		await composePage.verifyFacebookPreview(scheduleText);
	});

	await test.step('Add a one time approver', async () => {
		await expect(page.getByRole('heading', { name: 'Ask for approval' })).toBeVisible();
		await expect(page.getByText('Invite a team member with access to the selected accounts to approve this post first.')).toBeVisible();
		await composePage.selectOneTimeApprover(`${global.member[0].username}`);
	});

	await test.step('Update the message', async () => {
		await composePage.messageArea.click();
		await composePage.messageArea.fill(`${editedText}`);
	});

	await test.step('Save the edited message', async () => {
		await composePage.verifyFacebookPreview(editedText);
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.weekViewPostCountHeader(2); //Check count to ensure new post is added
		await plannerPage.showPreviewPane(editedText);
		await plannerPage.verifyTextInPreviewPane(scheduleText);
	});

	await test.step('Verify approval history displays the added reviewer details for new post', async () => {
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Sent for approval by ${(global.member[1].fullName)}`, { exact: true })).toBeVisible();
		await expect(page.locator('#modalDialog').getByText(`Pending approval from ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});
});
