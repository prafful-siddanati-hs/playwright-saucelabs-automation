const { test, expect } = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser');
const createUser = require('../../../../custom-commands/createUser');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');
const { getObjectByName, plan_create} = require('../../../../globals');
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

test('Verify that link settings are maintained via approval workflow', async ({ page }) => {
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const updateSNPermissions = new modifySocialProfilePermissions();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	let accounts = {
		plan_create_facebookpage: ['caLinkFB']
	};
	let orgName = 'CA_LINK_SETTINGS_' + Math.floor(Math.random() * 10000);
	const url = plan_create.getSBETestUrl();
	const scheduleText = `Approve a message with image & link ${url} ${Date.now()}`;
	const scheduleTime = addHours(new Date(), 2);

	await test.step('Setup test user and accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'ca_link_settings', accounts);
		await createNewUser.command('caLink_limited_user');
		await addUserToNewOrg.command('caLink_limited_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'caLinkFB', 'caLink_limited_user');
		limitedUserMemberId = global.member[1].memberId;
	});

	await test.step('Login as an admin user', async () => {
		await loginPage.signInSkipOnboarding('ca_link_settings');
	});

	await test.step('Schedule a facebook message with image and link using limited user', async () => {
		await createScheduleMessage.command(
			parseInt(limitedUserMemberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.socialProfileId,
						text: scheduleText,
						scheduledSendTime: formatISO(scheduleTime),
						mediaUrls: [
							{url: plan_create.image_url}
						]
					}
				]
			}
		);
	});

	await test.step('Navigate to Planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled image and link message is present on planner list view', async () => {
		await plannerPage.selectListView();
		await plannerPage.verifyScheduledMessage(scheduleText, getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.username);
		await plannerPage.showPreviewPane(scheduleText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Pending approval');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toHaveText(getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.username);
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
		await loginPage.signInSkipOnboarding('caLink_limited_user');
	});

	await test.step('Navigate to planner as limited user', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message is present on planner list view', async () => {
		await plannerPage.selectListView();
		await expect(plannerPage.postVolumeCalendarContainer).toBeVisible();
		await expect(plannerPage.listViewCards).toHaveCount(1);
		await plannerPage.verifyScheduledMessage(scheduleText, getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).socialProfile.username);
		await expect(plannerPage.mediaThumbnailListView).toBeVisible();
		await plannerPage.showPreviewPane(scheduleText);
		await expect(plannerPage.viewApprovalHistory).toBeVisible();
		await plannerPage.viewApprovalHistory.click();
		await expect(page.getByText(`Approved by ${(global.member[0].username)}`, { exact: true })).toBeVisible();
		await expect(plannerPage.closeApprovalHistoryModal).toBeVisible();
		await plannerPage.closeApprovalHistoryModal.click();
	});
});
