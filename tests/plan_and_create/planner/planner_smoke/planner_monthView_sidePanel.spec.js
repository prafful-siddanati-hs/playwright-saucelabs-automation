//Test to verify count of scheduled messages in planner month view side panel
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, addMonths, subMonths } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount, snId, scheduleText;
const scheduleTime = addMonths(new Date(), 1);
const NUMBER_OF_SCHEDULED_MESSAGES = 3;
const NEXT_DAY_DATE_STRING = scheduleTime.toISOString().split('T')[0];
const FIRST_DAY_FROM_LAST_MONTH = subMonths(new Date(), 1).toISOString().split('T')[0];

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify count of scheduled messages in planner month view side panel', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);


	let orgName = 'MonthViewSidePanel_' + Math.floor(Math.random() * 10000);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('month_view_side_panel', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_monthSidePanel', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_monthSidePanel');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_monthSidePanel').socialProfile.username;
		snId = getObjectByName(global.fixture, 'fb_monthSidePanel').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('month_view_side_panel');
	});

	await test.step('Schedule a message for test user', async () => {
		let messageText = `Schedule messages for future month ${fbAccount}`;

		for (let i = 0; i < NUMBER_OF_SCHEDULED_MESSAGES; i++) {
			scheduleText = `${messageText} ${i + 1}`;
			await createScheduleMessage.command(
				parseInt(memberId, 10),
				{
					messages: [
						{
							socialProfileId: parseInt(snId, 10),
							text: scheduleText,
							scheduledSendTime: formatISO(scheduleTime)
						},
					],
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

	await test.step('Verify scheduled messages in next month', async () => {
		await plannerPage.selectMonthView();
		await expect(plannerPage.nextButton).toBeVisible();
		await plannerPage.nextButton.click();
		await expect(plannerPage.messageCountOnMonthView).toBeVisible();
		await expect(plannerPage.messageCountOnMonthView).toHaveText(`${NUMBER_OF_SCHEDULED_MESSAGES}`);
		await expect(plannerPage.messageStatusOnMonthView).toHaveText('Scheduled');
	});

	await test.step('Verify scheduled message cards on month side pane', async () => {
		await plannerPage.selectMonthDay(NEXT_DAY_DATE_STRING);
		await expect(plannerPage.hourCardBlockTitle).toBeVisible();
		await expect(plannerPage.monthSidePaneCards).toHaveCount(NUMBER_OF_SCHEDULED_MESSAGES);
		await expect(plannerPage.hourCardBlockShowMore).not.toBeVisible();
	});

	await test.step('Verify composer can be opened from month side pane', async () => {
		await plannerPage.openComposerFromMonthSidePane();
	});

	await test.step('Verify profile is selected in composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifySocialProfileSelected(fbAccount);
	});

	await test.step('Create a new scheduled post', async () => {
		let newMessage = 'New message for month side panel';
		await composePage.writeMessage(newMessage);
		await composePage.verifyFacebookPreview(newMessage);
		await expect(composePage.scheduleButton).toBeVisible();
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
		await expect(composePage.feCallOuts).not.toBeVisible();
	});

	await test.step('Verify count has updated in month cell', async () => {
		const new_scheduled_count = `//*[contains(@class,'vk-CountByPostTypeWrapper')]//span[contains(text(),"${NUMBER_OF_SCHEDULED_MESSAGES + 1}")]`;
		await expect(page.locator(new_scheduled_count)).toBeVisible();
	});

	await test.step('Verify new card is added to month side pane', async () => {
		if (await plannerPage.hourCardBlockShowMore.isVisible()) {
			await plannerPage.hourCardBlockShowMore.click();
			await expect(plannerPage.monthSidePaneCards).toHaveCount(NUMBER_OF_SCHEDULED_MESSAGES + 1);
		} else {
			await expect(plannerPage.monthSidePaneCards).toHaveCount(NUMBER_OF_SCHEDULED_MESSAGES + 1);
		}
	});

	await test.step('Verify hour block card details', async () => {
		await expect(plannerPage.hourCardBlockFirstCard).toBeVisible();
		await plannerPage.hourCardBlockFirstCard.click();
		await expect(plannerPage.monthSidePaneBackButton).toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
	});

	await test.step('Verify month side panel closes on back button click', async () => {
		await plannerPage.monthSidePaneBackButton.click();
		await expect(plannerPage.monthSidePaneCloseButton).toBeVisible();
		await plannerPage.monthSidePaneCloseButton.click();
		await expect(plannerPage.detailPane).not.toBeVisible();
		await expect(plannerPage.hourCardBlockTitle).not.toBeVisible();
	});

	await test.step('Verify create button is not available in previous months', async () => {
		await expect(plannerPage.prevButton).toBeVisible();
		await plannerPage.prevButton.click();
		await plannerPage.prevButton.click();
		await plannerPage.selectMonthDay(FIRST_DAY_FROM_LAST_MONTH);
		await expect(plannerPage.monthSidePaneCreateButton).not.toBeVisible();
	});
});
