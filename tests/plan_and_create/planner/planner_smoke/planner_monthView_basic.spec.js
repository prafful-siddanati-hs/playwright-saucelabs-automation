//Test to verify scheduled messages can be viewed in planner month view
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, addDays, addMinutes } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, twAccount, snId, messageScheduleTime, scheduleText;
const scheduleTime = addDays(new Date(), 1);
const NUMBER_OF_SCHEDULED_MESSAGES = 3;
const NEXT_DAY_DATE_STRING = scheduleTime.toISOString().split('T')[0];

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled messages can be viewed in planner month view', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const addSocialNetwork = new addSocialToOrg();

	let orgName = 'MonthViewBasic_' + Math.floor(Math.random() * 10000);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('month_view_basic', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_monthBasic', 'twitter', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('tw_monthBasic');
		memberId = global.member[0].memberId;
		twAccount = getObjectByName(global.fixture, 'tw_monthBasic').socialProfile.username;
		snId = getObjectByName(global.fixture, 'tw_monthBasic').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('month_view_basic');
	});

	await test.step('Schedule a message for test user', async () => {
		let messageText = `Schedule messages for month view ${twAccount}`;

		for (let i = 0; i < NUMBER_OF_SCHEDULED_MESSAGES; i++) {
			scheduleText = `${messageText} ${i + 1}`;
			messageScheduleTime = formatISO(addMinutes(scheduleTime, i * 4));
			await createScheduleMessage.command(
				parseInt(memberId, 10),
				{
					messages: [
						{
							socialProfileId: parseInt(snId, 10),
							text: scheduleText,
							scheduledSendTime: messageScheduleTime,
						}
					]
				}
			);
		}
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
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
	});

	await test.step('Switch to month view', async () => {
		await plannerPage.selectMonthView();
	});

	await test.step('Verify messages & count on month view by post type', async () => {
		await expect(plannerPage.messageCountOnMonthView).toBeVisible();
		await expect(plannerPage.messageCountOnMonthView).toHaveText(`${NUMBER_OF_SCHEDULED_MESSAGES}`);
		await expect(plannerPage.messageStatusOnMonthView).toHaveText('Scheduled');
	});

	await test.step('Verify messages & count on month view by social network', async () => {
		await plannerPage.toggleMonthView();
		await expect(plannerPage.messageSNCountOnMonthView).toBeVisible();
		await expect(plannerPage.messageSNCountOnMonthView).toHaveText(`${NUMBER_OF_SCHEDULED_MESSAGES}`);
	});

	await test.step('Verify the message cards are listed on side panel', async () => {
		await plannerPage.selectMonthDay(NEXT_DAY_DATE_STRING);
		await expect(plannerPage.monthSidePaneCreateButton).toBeVisible();
		await expect(plannerPage.monthSidePaneCards).toHaveCount(NUMBER_OF_SCHEDULED_MESSAGES);
	});

	await test.step('Navigate to week view and ensure month side panel closes', async () => {
		await plannerPage.selectWeekView();
		await expect(plannerPage.detailPane).not.toBeVisible();
	});
});
