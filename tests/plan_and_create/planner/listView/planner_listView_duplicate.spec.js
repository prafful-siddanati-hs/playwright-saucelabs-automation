//Test to duplicate a post from list view
const { test, expect } = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { formatISO, addMinutes } = require('date-fns');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccountName;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify duplicate post from planner list view', async ({ page }) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);

	let scheduledText = 'Duplicate from #listView';
	let duplicatedText = '--more text for duplicated post';

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('listView_duplicate', 'professional');
		await addFixture.command('fb_listView_duplicate', 'plan_create_facebookpage', true, 300);
		memberId = global.member[0].memberId;
		fbAccountName = getObjectByName(global.fixture, 'fb_listView_duplicate').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('listView_duplicate');
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			hs.memberActionHistory.postScheduledOrSent = true;
			hs.memberActionHistory.hasDismissedPlannerRecommendedTimesFirstRunPopover = true;
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Create scheduled message', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'fb_listView_duplicate').socialProfile.socialProfileId, 10),
						text: scheduledText,
						scheduledSendTime: formatISO(addMinutes(new Date(), 20)),
					},
				],
			}
		);
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
		await expect(plannerPage.listViewCards).toHaveCount(1);
		await plannerPage.verifyScheduledMessage(scheduledText);
	});

	await test.step('Duplicate post from list view', async () => {
		await plannerPage.clickListViewDayCard(scheduledText, fbAccountName);
		await expect(plannerPage.listViewMoreActions).toBeVisible();
		await plannerPage.listViewMoreActions.click();
		await expect(plannerPage.moveToDraftsFromMoreActionsItems).toBeVisible();
		await plannerPage.duplicateFromMoreActionsItems.click();
	});

	await test.step('Type additional text & add media to the scheduled message', async () => {
		await composePage.writeMessage(duplicatedText);
		await composePage.verifyFacebookPreview(duplicatedText);
	});

	await test.step('Schedule the duplicated post', async () => {
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Verify new card in list view', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(plannerPage.listViewCards).toHaveCount(2);
		await plannerPage.showPreviewPane(scheduledText.concat(duplicatedText));
		await expect(plannerPage.detailPane).toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccountName);
	});
});
