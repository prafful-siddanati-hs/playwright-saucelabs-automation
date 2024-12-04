//Test to verify scheduled messages in future and current month via planner month view
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, addMonths, startOfMonth } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount, snId;
const futureMonthTodayDate = addMonths(new Date(), 2);

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Test to verify scheduled messages in future and current month via planner month view', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);

	let orgName = 'MonthViewFuturePosts_' + Math.floor(Math.random() * 10000);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('month_view_future', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_month_future', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_month_future');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_month_future').socialProfile.username;
		snId = getObjectByName(global.fixture, 'fb_month_future').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('month_view_future');
	});

	await test.step('Schedule a message for test user', async () => {
		let scheduleText = `Schedule message for future month ${fbAccount}`;
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(snId, 10),
						text: scheduleText,
						scheduledSendTime: formatISO(futureMonthTodayDate),
					}
				]

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

	await test.step('Navigate to month view', async () => {
		await plannerPage.selectMonthView();
	});

	await test.step('Create post from month cell', async () => {
		await expect(plannerPage.monthDayTodayClickable).toBeVisible();
		await plannerPage.monthDayTodayClickable.click();
		await plannerPage.openComposerFromMonthSidePane();
	});

	await test.step('Verify profile is selected in composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifySocialProfileSelected(fbAccount);
	});

	await test.step('Create a new scheduled post', async () => {
		let newMessage = `Schedule message via month side panel ${Date.now()}`;
		await composePage.writeMessage(newMessage);
		await composePage.verifyFacebookPreview(newMessage);
		await expect(composePage.scheduleButton).toBeVisible();
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
	});

	await test.step('Verify scheduled message in current month', async () => {
		await expect(plannerPage.feCallOut).not.toBeVisible();
		await expect(plannerPage.messageCountOnMonthView).toBeVisible();
		await expect(plannerPage.messageCountOnMonthView).toHaveText('1');
		await expect(plannerPage.messageStatusOnMonthView).toHaveText('Scheduled');
	});

	await test.step('Verify scheduled message in future month', async () => {
		const futureMonthDateString = startOfMonth(futureMonthTodayDate).toISOString().split('T')[0];
		const futureMonthRangeSelectorButton = page.locator(`//*[contains(@id, "popper")]//button[contains(@data-date, "${futureMonthDateString}")]`, { locateStrategy: 'xpath' });

		await expect(plannerPage.monthDateRangeButton).toBeVisible();
		await plannerPage.monthDateRangeButton.click();

		if (await futureMonthRangeSelectorButton.isVisible()) {
			await futureMonthRangeSelectorButton.click();
		} else {
			await expect(plannerPage.nextYearNavigationButton).toBeVisible();
			await plannerPage.nextYearNavigationButton.click();
			await expect(futureMonthRangeSelectorButton).toBeVisible();
			await futureMonthRangeSelectorButton.click();
		}

		const futureMonthTodayDateString = futureMonthTodayDate.toISOString().split('T')[0];
		const futureMonthTodaySelectorButton = page.locator(`//*[contains(@class, 'vk-Row')]//*[contains(@class, 'vk-Day') and contains(@id, 'Date-${futureMonthTodayDateString}')]//span[contains(@data-testid, 'DayOfMonthCount-SCHEDULED')]`, { locateStrategy: 'xpath' });
		await expect(futureMonthTodaySelectorButton).toBeVisible();
		await expect(futureMonthTodaySelectorButton).toHaveText('1');
		await expect(plannerPage.messageStatusOnMonthView).toHaveText('Scheduled');
	});
});
