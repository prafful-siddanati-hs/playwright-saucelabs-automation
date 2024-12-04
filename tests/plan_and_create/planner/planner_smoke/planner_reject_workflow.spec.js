// Test to verify messages can be rejected by admin user
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const createUser = require('../../../../custom-commands/createUser');
const createOrg = require('../../../../custom-commands/createOrg');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { formatISO, addMinutes } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const tearDown = require('../../../../custom-commands/tearDown');

let limitedUserMemberId, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify messages can be rejected by admin user', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewUser = new createUser();
	const createNewOrg = new createOrg();
	const addUserToNewOrg = new addUserToOrg();
	const addSocialNetwork = new addSocialToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	let orgName = 'pw_reject_message_' + Math.floor(Math.random() * 10000);
	const messageText = `Scheduled message to reject ${Date.now()}`;
	const scheduleTime = formatISO(addMinutes(new Date(), 20));
	const rejectReason = 'Message is not relevant';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('admin_reject_message', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_reject', 'twitter', false, 300);
		await createNewUser.command('limited_user_reject');
		await createNewOrg.command(orgName);
		await addUserToNewOrg.command('limited_user_reject', orgName);
		await addSocialNetwork.command('tw_reject');
		await updateSNPermissions.command('SN_LIMITED', 'tw_reject', 'limited_user_reject');
		limitedUserMemberId = global.member[1].memberId;
		twAccount = getObjectByName(global.fixture, 'tw_reject').socialProfile.username;
	});

	await test.step('Schedule a message for limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'tw_reject').socialProfile.socialProfileId, 10),
						text: messageText,
						scheduledSendTime: scheduleTime
					}
				]
			}
		);
	});

	await test.step('Login as admin user', async () => {
		await loginPage.signInSkipOnboarding('admin_reject_message');
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner', async () => {
		await plannerPage.verifyScheduledMessageInCurrentOrNextWeek(messageText);
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(messageText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(messageText);
	});

	await test.step('Reject scheduled message by admin user', async () => {
		await plannerPage.rejectScheduledMessage(rejectReason);
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Verify rejected message in planner', async () => {
		await expect(plannerPage.feCallOut).not.toBeVisible();
		await plannerPage.showPreviewPane(messageText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Rejected');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(messageText);
	});
});
