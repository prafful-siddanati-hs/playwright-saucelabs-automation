const { test, expect } = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const createUser = require('../../../../custom-commands/createUser');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addHours } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { LoginPage } = require('../../../../pages/login');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const tearDown = require('../../../../custom-commands/tearDown');

let limitedUserMemberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Approve message with text only by admin user fom planner list view', async ({ page }) => {
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	let accounts = {
		plan_create_facebookpage: ['caTextFB']
	};
	let orgName = 'CA_TEXT_' + Math.floor(Math.random() * 10000);
	const scheduleText = `Schedule message for approvals ${Date.now()}`;
	const scheduleTime = addHours(new Date(), 2);

	await test.step('Setup test user and accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'ca_text_admin', accounts);
		await createNewUser.command('caText_limited_user');
		await addUserToNewOrg.command('caText_limited_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'caTextFB', 'caText_limited_user');
		limitedUserMemberId = global.member[1].memberId;
	});

	await test.step('Login as an admin user', async () => {
		await loginPage.signInSkipOnboarding('ca_text_admin');
	});

	await test.step('Schedule a facebook message with text only using limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.socialProfileId,
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleTime)
					}
				]
			}
		);
	});

	await test.step('Navigate to Planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message with text only is present on planner list view', async () => {
		await plannerPage.selectListView();
		await plannerPage.verifyScheduledMessage(scheduleText);
		await plannerPage.showPreviewPane(scheduleText);
	});

	await test.step('Approve message from planner side pane', async () => {
		await expect(plannerPage.previewPaneApproveButton).toBeVisible();
		await plannerPage.previewPaneApproveButton.click();
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Logout from admin user', async () => {
		await loginPage.logout();
	});

	await test.step('Login as limited user', async () => {
		await loginPage.signInSkipOnboarding('caText_limited_user');
	});

	await test.step('Navigate to planner as limited user', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message is present on planner list view', async () => {
		await plannerPage.selectListView();
		await plannerPage.verifyScheduledMessage(scheduleText);
		await plannerPage.showPreviewPane(scheduleText);
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Approved by ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});
});
