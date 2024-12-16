/* Test to verify different post statuses can be filtered in month view */
const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals.js');
const { formatISO, addMinutes } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts');
const { ModifyScheduledPostStatus } = require('../../../../custom-commands/modifyScheduledPostStatus.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const tearDown = require('../../../../custom-commands/tearDown');

let memberId, fbAccount, messageScheduleTime;
const scheduleTime = addMinutes(new Date(), 6);
const NUMBER_OF_SCHEDULED_MESSAGES = 3;
const TODAY_DATE_STRING = scheduleTime.toISOString().split('T')[0];
const messageIds = [];

const STATUS_KEYS = {
	Published: 'SENT',
	Drafts: 'DRAFT',
	Failed: 'SEND_FAILED_PERMANENTLY',
};

const STATUS_CARD_LABELS = {
	Published: 'Published',
	Drafts: 'Draft',
	Failed: 'Failed',
};

const getPostTypeSelectors = type => {
	const statusKey = STATUS_KEYS[type];
	const statusCardLabel = STATUS_CARD_LABELS[type];
	const hasCount = statusKey !== STATUS_KEYS.Failed;
	return {
		card: `//*[contains(@class, "vk-DetailPane")]//*[contains(@class, "vk-Card")]//*[contains(@data-testid,"StateText") and text()="${statusCardLabel}"]`,
		count: hasCount
			? `//*[contains(@class, "vk-Day")]//*[contains(@data-testid, "DayOfMonthCount-${statusKey}")]`
			: '', // No count is displayed for failed posts
		icon: `//*[contains(@class, "vk-Day")]//*[contains(@data-status, "${statusKey}")]`,
	};
};

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify different post statuses can be filtered in month view', async ({ page }) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const draftsPage = new DraftsPage(page);
	const modifyScheduledPostStatus = new ModifyScheduledPostStatus();
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('month_post_status', 'professional');
		await addFixture.command('fb_post_status', 'plan_create_facebookpage', true, 300);
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_post_status').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('month_post_status');
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			hs.memberActionHistory.postScheduledOrSent = true;
			hs.memberActionHistory.hasDismissedPlannerRecommendedTimesFirstRunPopover = true;
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step(`Schedule messages for ${fbAccount}`, async () => {
		for (let i = 0; i < NUMBER_OF_SCHEDULED_MESSAGES; i++) {
			messageScheduleTime = formatISO(addMinutes(scheduleTime, i * 4));
			await createScheduleMessage.command(
				parseInt(memberId, 10),
				{
					messages: [
						{
							socialProfileId: getObjectByName(global.fixture, 'fb_post_status').socialProfile.socialProfileId,
							text: `Scheduled fb post for ${fbAccount} ${Date.now()}`,
							scheduledSendTime: messageScheduleTime,
						},
					],
				}, (data) => {
					const messageId = data.messages[0].id;
					if (messageId){
						messageIds.push(messageId);
					}
				}
			);
		}
	});

	await test.step(`Create a draft message for ${fbAccount}`, async () => {
		try {
			await draftsPage.createDraftViaApiByNetwork(
				memberId,
				null,
				getObjectByName(global.fixture, 'fb_post_status').socialProfile.socialProfileId,
				`Draft fb post for ${fbAccount} ${Date.now()}`,
				'FACEBOOK',
				[],
				formatISO(scheduleTime),
			);
		} catch (error) {
			throw new Error(`Error creating draft: ${error}`);
		}
	});

	await test.step('Change statuses of scheduled posts to \'PUBLISHED\' & \'FAILED\'', async () => {
		await modifyScheduledPostStatus.updatePostStatus(memberId, messageIds[0], 'PUBLISHED');
		await modifyScheduledPostStatus.updatePostStatus(memberId, messageIds[1], 'FAILED');
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideRecommendedTimes(memberId);
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Swtich to month view', async () => {
		await plannerPage.selectMonthView();
	});

	await test.step('Open month side panel to view posts are filtered by status', async () => {
		await plannerPage.selectMonthDay(TODAY_DATE_STRING);
	});

	await test.step('Verify all statuses post & icon are displayed', async () => {
		for (const status in STATUS_KEYS) {
			const { count, icon, card } = getPostTypeSelectors(status);

			if (count) {
				await expect(page.locator(count)).toBeVisible();
				await expect(page.locator(count)).toHaveText('1');
			}
			await expect(page.locator(icon)).toBeVisible();
			await expect(page.locator(icon)).toHaveCount(1);

			await expect(page.locator(card)).toBeVisible();
			await expect(page.locator(card)).toHaveCount(1);
		}
	});

	await test.step('Test cards are displayed when fitlered by post status', async () => {
		await plannerPage.toggleFiltersButton();

		for (const filteredStatus of Object.keys(STATUS_KEYS)) {
			await plannerPage.resetSelectedFilters();
			await plannerPage.toggleFiltersButton();
			await plannerPage.filterByPostStatus(filteredStatus);
			await plannerPage.closeFilterPanel();

			const { count, icon, card } = getPostTypeSelectors(filteredStatus);

			if (count) { // Check for count only if it is displayed
				await expect(page.locator(count)).toBeVisible();
				await expect(page.locator(count)).toHaveText('1');
			}
			await expect(page.locator(icon)).toBeVisible();
			await expect(page.locator(icon)).toHaveCount(1);

			await page.waitForTimeout(1000);
			await expect(page.locator(card)).toBeVisible();
			await expect(page.locator(card)).toHaveCount(1);
		}
	});
});
