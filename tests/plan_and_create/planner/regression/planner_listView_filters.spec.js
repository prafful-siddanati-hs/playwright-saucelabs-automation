const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser.js');
const getFixture = require('../../../../custom-commands/getFixture.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const {formatISO, addMinutes} = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, twAccount, twProfileType, fbAccount, fbProfileType, messageScheduleTime, testData;
const NUMBER_OF_MESSAGES_TO_SCHEDULE = 2;
const TOTAL_POSTS_ON_LIST_VIEW = 6;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that planner list view filters work as expected', async ({ page }) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('planner_filters_user', 'professional');
		await addFixture.command('fb_planner_filters', 'plan_create_facebookpage', true, 300);
		await addFixture.command('tw_planner_filters', 'twitter', true, 300);
		memberId = global.member[0].memberId;
		twAccount = getObjectByName(global.fixture, 'tw_planner_filters').socialProfile.username;
		fbAccount = getObjectByName(global.fixture, 'fb_planner_filters').socialProfile.username;
		twProfileType = getObjectByName(global.fixture, 'tw_planner_filters').socialProfile.type;
		fbProfileType = getObjectByName(global.fixture, 'fb_planner_filters').socialProfile.type;
		testData = {
			postNowText: {
				[twProfileType]: `Post now message for ${twAccount} ${formatISO(new Date())}`,
				[fbProfileType]: `Post now message for ${fbAccount} ${formatISO(new Date())}`
			},
			scheduledText: {
				[twProfileType]: `Scheduled message for ${twAccount} ${Date.now()}`,
				[fbProfileType]: `Scheduled message for ${fbAccount} ${new Date()}`
			}
		};
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('planner_filters_user');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step(`Create scheduled messages for ${fbAccount} & ${twAccount}`, async () => {
		for (let i = 0; i < NUMBER_OF_MESSAGES_TO_SCHEDULE; i++) {
			messageScheduleTime = addMinutes(new Date(), i + 11);
			await createScheduleMessage.command(
				parseInt(memberId, 10),
				{
					messages: [
						{
							socialProfileId: getObjectByName(global.fixture, 'fb_planner_filters').socialProfile.socialProfileId,
							text: testData.scheduledText[fbProfileType],
							scheduledSendTime: formatISO(messageScheduleTime)
						},
						{
							socialProfileId: getObjectByName(global.fixture, 'tw_planner_filters').socialProfile.socialProfileId,
							text: testData.scheduledText[twProfileType],
							scheduledSendTime: formatISO(messageScheduleTime)
						}
					]
				}
			);
		}
	});

	await test.step(`Create post now messages for ${fbAccount} & ${twAccount}`, async () => {
		testData.postNowText[twProfileType] = `Post now message for ${twAccount} ${formatISO(new Date())}`;
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'fb_planner_filters').socialProfile.socialProfileId,
						text: testData.postNowText[fbProfileType]
					},
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_planner_filters').socialProfile.socialProfileId,
						text: testData.postNowText[twProfileType]
					},
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

	await test.step('Verify messages in week view', async () => {
		await plannerPage.weekViewPostCountHeader(6); // Ensure all posts are visible
		await plannerPage.verifyScheduledMessage(testData.postNowText[twProfileType], twAccount);
	});

	await test.step('Verify details on preview pane', async () => {
		await plannerPage.showPreviewPane(testData.postNowText[twProfileType]);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Published');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
	});

	await test.step('Switch to planner list view', async () => {
		await plannerPage.selectListView();
	});

	await test.step('Verify messages & count on list view by post type', async () => {
		const postCountSelector = page.locator(`//*[contains(@class,"vk-ListViewCardListContentCount") and contains(text(),"${TOTAL_POSTS_ON_LIST_VIEW} posts")]`, { locateStrategy: 'xpath' });
		await expect(plannerPage.postVolumeCalendarContainer).toBeVisible();
		await expect(postCountSelector).toBeVisible();
		await expect(plannerPage.listViewCards).toHaveCount(TOTAL_POSTS_ON_LIST_VIEW/2); // Total cards visible on screen without scrolling
	});

	await test.step('Verify list view day containers are visible', async () => {
		await expect(plannerPage.listViewDayContainer).toHaveCount(2);
	});

	await test.step('Verify \'Published\' post only has duplicate action', async () => {
		await plannerPage.clickListViewDayCard(testData.postNowText[twProfileType], twAccount);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Published');
		await expect(plannerPage.listViewEditAction).not.toBeVisible();
		await expect(plannerPage.listViewDeleteAction).not.toBeVisible();
		await expect(plannerPage.listViewDuplicateAction).toBeVisible();
	});

	await test.step('Verify messages are filtered correctly by post status', async () => {
		await plannerPage.toggleFiltersButton();
		await plannerPage.filterByPostStatus('Scheduled');
		await plannerPage.closeFilterPanel();
		await plannerPage.verifyScheduledMessageNotPresent(testData.postNowText[twProfileType], twAccount);
		await plannerPage.verifyScheduledMessageNotPresent(testData.postNowText[fbProfileType], fbAccount);
		await plannerPage.resetSelectedFilters();
		await plannerPage.toggleFiltersButton();
		await plannerPage.filterByPostStatus('Published');
		await plannerPage.closeFilterPanel();
		await plannerPage.verifyScheduledMessageNotPresent(testData.postNowText[twProfileType], twAccount);
		await plannerPage.verifyScheduledMessageNotPresent(testData.postNowText[fbProfileType], fbAccount);
		await expect(plannerPage.listViewCards).toHaveCount(TOTAL_POSTS_ON_LIST_VIEW - 4); // Ensure all Scheduled posts are filtered out
	});
});
