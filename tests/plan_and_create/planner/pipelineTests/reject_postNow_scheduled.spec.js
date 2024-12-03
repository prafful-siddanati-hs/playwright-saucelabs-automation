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

test('Reject send now and scheduled message from manage approvals view', async ({ page }) => {
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	let accounts = {
		twitter: ['postNowScheduleToTwitter'],
	};
	let orgName = 'Manage_approvals_' + Math.floor(Math.random() * 10000);
	const postNowText = `Post now message to reject ${Date.now()}`;
	const scheduleText = `Schedule message to reject ${Date.now()}`;
	const scheduleTime = addHours(new Date(), 2);

	await test.step('Setup test user and accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName,'postNowSchedule_reject_admin', accounts);
		await createNewUser.command('postNowSchedule_limited_user');
		await addUserToNewOrg.command('postNowSchedule_limited_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'postNowScheduleToTwitter', 'postNowSchedule_limited_user');
		limitedUserMemberId = global.member[1].memberId;
	});

	await test.step('Login as an admin user', async () => {
		await loginPage.signInSkipOnboarding('postNowSchedule_reject_admin');
	});

	await test.step('Create a post now message for twitter using limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.twitter}`).socialProfile.socialProfileId,
						text: postNowText,
					}
				]
			}
		);
	});

	await test.step('Schedule a twitter message using limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.twitter}`).socialProfile.socialProfileId,
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleTime),
					}
				]
			}
		);
	});

	await test.step('Navigate to Planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Navigate to approvals view (Assigned to me)', async () => {
		await expect(plannerPage.contentTab).toBeVisible(); //Giving it some time so that entitlements check completes and approvals tab loads up
		await expect(plannerPage.approvalstab).toBeVisible();
		await plannerPage.approvalstab.click();
	});

	await test.step('Verify the post now message', async () => {
		await plannerPage.verifyMessageOnApprovalsView(postNowText);
		await plannerPage.showPreviewPane(postNowText);
	});

	await test.step('Verify content in preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(postNowText);
		await expect(plannerPage.sidePaneCloseButton).toBeVisible();
		await plannerPage.sidePaneCloseButton.click();
	});

	await test.step('Reject the post now message', async () => {
		await plannerPage.rejectFromApprovalsListView(postNowText, 'Post', 'Wrong content');
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Verify the scheduled message', async () => {
		await expect(plannerPage.feCallOut).not.toBeVisible();
		await plannerPage.verifyMessageOnApprovalsView(scheduleText);
		await plannerPage.showPreviewPane(scheduleText);
	});

	await test.step('Verify content in preview pane', async () => {
		await plannerPage.verifyTextInPreviewPane(scheduleText);
		await expect(plannerPage.sidePaneCloseButton).toBeVisible();
		await plannerPage.sidePaneCloseButton.click();
	});

	await test.step('Reject the scheduled message', async () => {
		await plannerPage.rejectFromApprovalsListView(scheduleText, 'Post', 'Wrong content');
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Verify the approved message is removed from the view', async () => {
		await plannerPage.verifyScheduledMessageNotPresent(scheduleText);
	});
});
