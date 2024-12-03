//Test to verify scheduled messages can be viewed in planner list view
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, addMinutes } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount, snId, scheduleText, postNowText;
const EXPECTED_LIST_VIEW_POSTS = 2;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled messages can be viewed in planner list view', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const addSocialNetwork = new addSocialToOrg();

	let orgName = 'ListViewBasic_' + Math.floor(Math.random() * 10000);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('list_view_basic', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_listBasic', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_listBasic');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_listBasic').socialProfile.username;
		snId = getObjectByName(global.fixture, 'fb_listBasic').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('list_view_basic');
	});

	await test.step('Create post now message for test user', async () => {
		postNowText = `Post now message for list view ${fbAccount}`;
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(snId, 10),
						text: postNowText,
					},
				],
			}
		);
	});

	await test.step('Schedule a message for test user', async () => {
		scheduleText = `Scheduled message for list view ${fbAccount}`;
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(snId, 10),
						text: scheduleText,
						scheduledSendTime: formatISO(addMinutes(new Date(), 10)),
					},
				],
			}
		);
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled messages in planner week view', async () => {
		await plannerPage.verifyScheduledMessage(scheduleText);
		await plannerPage.showPreviewPane(scheduleText);
		await expect(plannerPage.detailPane).toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
	});

	await test.step('Switch to list view', async () => {
		await plannerPage.selectListView();
	});

	await test.step('Verify messages & count on list view by post type', async () => {
		await expect(plannerPage.postVolumeCalendarContainer).toBeVisible();
		await expect(plannerPage.listViewCards).toHaveCount(EXPECTED_LIST_VIEW_POSTS);
		await plannerPage.verifyScheduledMessage(scheduleText);
	});

	await test.step('Verify clicking on cards opens detail pane', async () => {
		await plannerPage.showPreviewPane(postNowText);
		await expect(plannerPage.detailPane).toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Published');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
	});
});
