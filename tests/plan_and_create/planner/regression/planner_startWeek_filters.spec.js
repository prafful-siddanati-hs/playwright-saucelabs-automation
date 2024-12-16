/* Test to verify scheduled posts are displayed correctly when start week filters are applied */
const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals.js');
const { formatISO, addDays, startOfWeek, set } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const tearDown = require('../../../../custom-commands/tearDown');

let memberId, tiktokAccount, fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled posts are displayed correctly when start week filters are applied', async ({ page }) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	const closestSundayDate = set(addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), 7), { hours: 12, minutes: 0, seconds: 0 });
	const CLOSEST_SUNDAY_DATE_STRING = closestSundayDate.toISOString().split('T')[0];
	const sundayBarSelector = page.locator(`//*[contains(@class, 'vk-Row')]//*[contains(@class, 'vk-Day') and contains(@id, 'Date-${CLOSEST_SUNDAY_DATE_STRING}')]//*[contains(@class, 'vk-SNCountBarWrapper')]`, { locateStrategy: 'xpath' });

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('start_week_filters', 'professional');
		await addFixture.command('fb_start_week_filters', 'plan_create_facebookpage', true, 300);
		await addFixture.command('tiktok_start_week_filters', 'tiktok', true, 300);
		memberId = global.member[0].memberId;
		tiktokAccount = getObjectByName(global.fixture, 'tiktok_start_week_filters').socialProfile.username;
		fbAccount = getObjectByName(global.fixture, 'fb_start_week_filters').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('start_week_filters');
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			hs.memberActionHistory.postScheduledOrSent = true;
			hs.memberActionHistory.hasDismissedPlannerRecommendedTimesFirstRunPopover = true;
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step(`Schedule messages for ${tiktokAccount} & ${fbAccount}`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages:[
					{
						socialProfileId: getObjectByName(global.fixture, 'tiktok_start_week_filters').socialProfile.socialProfileId,
						text: `Scheduled tiktok post for ${tiktokAccount} ${Date.now()}`,
						scheduledSendTime: formatISO(closestSundayDate),
						mediaUrls: [{ url: plan_create.tiktok_video_url}],
					},
					{
						socialProfileId: getObjectByName(global.fixture, 'fb_start_week_filters').socialProfile.socialProfileId,
						text: `Scheduled facebook post for ${fbAccount} ${Date.now()}`,
						scheduledSendTime: formatISO(closestSundayDate),
					}
				]
			}
		);
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideRecommendedTimes(memberId);
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled messages are present on Sunday of next week', async () => {
		await expect(plannerPage.ghostCard).toBeVisible();
		await expect(plannerPage.nextButton).toBeVisible();
		await plannerPage.nextButton.click();
		await plannerPage.weekViewPostCountHeader(2);
	});

	await test.step('Switch to planner month view', async () => {
		await plannerPage.selectMonthView();
		await expect(plannerPage.messageCountOnMonthView).toBeVisible();
		await expect(plannerPage.messageCountOnMonthView).toHaveText('2');
		await expect(plannerPage.messageStatusOnMonthView).toHaveText('Scheduled');
	});

	await test.step('Toggle month view to verify posts', async () => {
		await plannerPage.toggleMonthView();
		await expect(plannerPage.messageBarCountOnMonthSNView).toHaveCount(2);
		await plannerPage.selectMonthDay(CLOSEST_SUNDAY_DATE_STRING);
		await expect(plannerPage.monthSidePaneCards).toHaveCount(2);
	});

	await test.step('Verify scheduled posts count with \'Sunday\' as start of week', async () => {
		if (await page.locator('.vk-SNCountBarWrapper [data-testid="tiktok"]').isVisible()) {
			await expect(sundayBarSelector).toHaveCount(2);
		} else {
			await expect(plannerPage.nextButton).toBeVisible();
			await plannerPage.nextButton.click();
			await expect(sundayBarSelector).toHaveCount(2);
		}
	});

	await test.step('Change start of week to Monday', async () => {
		await expect(plannerPage.settingsButton).toBeVisible();
		await plannerPage.settingsButton.click();
		await expect(plannerPage.startOfWeekMondayButton).toBeVisible();
		await plannerPage.startOfWeekMondayButton.click();
	});

	await test.step('Verify scheduled posts count with \'Monday\' as start of week', async () => {
		if (await page.locator('.vk-SNCountBarWrapper [data-testid="facebook"]').isVisible()) {
			await expect(sundayBarSelector).toHaveCount(2);
		} else { // Handle case if closest sunday happens to be in the next month
			await expect(plannerPage.prevButton).toBeVisible();
			await plannerPage.prevButton.click();
			await expect(sundayBarSelector).toHaveCount(2);
		}
	});
});
