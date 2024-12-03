//Test to verify admin user can edit and then approve a post
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
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const tearDown = require('../../../../custom-commands/tearDown');

let adminUserMemberId, limitedUserMemberId, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify admin user can edit and then approve a post', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewUser = new createUser();
	const createNewOrg = new createOrg();
	const addUserToNewOrg = new addUserToOrg();
	const addSocialNetwork = new addSocialToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);

	let orgName = 'edit_approve_message_' + Math.floor(Math.random() * 10000);
	const messageText = `Schedule post to edit ${Math.floor(Math.random() * 1000)}`;
	const editedText = ', approve with additional text';
	const scheduleTime = formatISO(addMinutes(new Date(), 30));

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('admin_edit_message', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_edit_approve', 'twitter', false, 300);
		await createNewUser.command('limited_user_ca');
		await createNewOrg.command(orgName);
		await addUserToNewOrg.command('limited_user_ca', orgName);
		await addSocialNetwork.command('tw_edit_approve');
		await updateSNPermissions.command('SN_LIMITED', 'tw_edit_approve', 'limited_user_ca');
		adminUserMemberId = global.member[0].memberId;
		limitedUserMemberId = global.member[1].memberId;
		twAccount = getObjectByName(global.fixture, 'tw_edit_approve').socialProfile.username;
	});

	await test.step('Schedule a message for limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'tw_edit_approve').socialProfile.socialProfileId, 10),
						text: messageText,
						scheduledSendTime: scheduleTime
					}
				]
			}
		);
	});

	await test.step('Login as admin user', async () => {
		await loginPage.signInSkipOnboarding('admin_edit_message');
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(adminUserMemberId);
		await plannerPage.hideRecommendedTimes(adminUserMemberId);
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

	await test.step('Open message from planner preview pane', async () => {
		await plannerPage.editFromPreviewPane();
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyTwitterPreview(messageText);
	});

	await test.step('Edit & verify preview is updated', async () => {
		await composePage.writeMessage(editedText);
		await composePage.verifyTwitterPreview(messageText.concat(editedText));
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(messageText.concat(editedText)); // Verify the edited message in preview pane
	});

	await test.step('Approve message from planner side pane', async () => {
		await expect(plannerPage.previewPaneApproveButton).toBeVisible();
		await plannerPage.previewPaneApproveButton.click();
		await expect(plannerPage.feCallOut).toBeVisible();
	});

	await test.step('Verify approved message in planner', async () => {
		await expect(plannerPage.feCallOut).not.toBeVisible();
		await plannerPage.showPreviewPane(messageText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(messageText.concat(editedText));
	});
});
