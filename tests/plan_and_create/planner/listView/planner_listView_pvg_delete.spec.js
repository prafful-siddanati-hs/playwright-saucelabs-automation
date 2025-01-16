//Test to verify post volume graph updates correctly when posts are deleted
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, startOfMonth, addMonths } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify post volume graph updates correctly when posts are deleted', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const addSocialNetwork = new addSocialToOrg();

	let orgName = 'ListViewPVG_Delete_' + Math.floor(Math.random() * 10000);
	let scheduleText = 'Schedule & delete a message to check PVG is updated correctly';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('listView_pvg_delete', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_pvg_delete', 'twitter', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('tw_pvg_delete');
		memberId = global.member[0].memberId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('listView_pvg_delete');
	});

	await test.step('Schedule a post for 1st of next month', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'tw_pvg_delete').socialProfile.socialProfileId, 10),
						text: scheduleText,
						scheduledSendTime: formatISO(addMonths(startOfMonth(new Date()), 1)),
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

	await test.step('Switch to list view', async () => {
		await plannerPage.selectListView();
	});

	await test.step('Navigate to first day of next month', async () => {
		await expect(plannerPage.datePickerButton).toBeVisible();
		await plannerPage.datePickerButton.click();
		await expect(plannerPage.nextMonthFromDateRange).toBeVisible();
		await plannerPage.nextMonthFromDateRange.click();
		await expect(plannerPage.firstDayFromMonthCalendar).toBeVisible();
		await plannerPage.firstDayFromMonthCalendar.click();
	});

	await test.step('Verify post volume graph has single bar', async () => {
		await expect(plannerPage.singlePvgBar).toBeVisible();
		await expect(plannerPage.postVolumeGraphWeek).toHaveCount(4);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await plannerPage.deleteFromListView();
	});

	await test.step('Verify post volume graph is updated', async () => {
		await expect(plannerPage.listViewCards).toHaveCount(0);
		await expect(plannerPage.singlePvgBar).not.toBeVisible();
	});
});
