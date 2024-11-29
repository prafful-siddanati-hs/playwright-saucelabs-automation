const { test } = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {getObjectByName} = require('../../../../globals');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { formatISO, addHours } = require('date-fns');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
const {SetUpEnterpriseUser} = require('../../../../custom-commands/setUpEnterpriseUser');
const {LoginPage} = require('../../../../pages/login');

let enterpriseUserMemberId, enterpriseUserFacebookPage, enterpriseUserTwitter;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled message & post filtering in week view', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const createScheduleMessage = new scheduleV3Message();

	let accounts = {
		twitter: ['tw_planner_basic'],
		plan_create_facebookpage: ['fb_planner_basic']
	};

	let orgName = 'planner_basic_org_' + Math.floor(Math.random() * 10000);
	const message = `Planner New Compose Message! ${Date.now()}`;
	const scheduleTime = addHours(new Date(), 1);

	await test.step('Setup test user and accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName,'pw_planner_basic', accounts);
		enterpriseUserMemberId = global.member[0].memberId;
		enterpriseUserFacebookPage = getObjectByName(global.fixture, 'fb_planner_basic').socialProfile.username;
		enterpriseUserTwitter = getObjectByName(global.fixture, 'tw_planner_basic').socialProfile.username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_planner_basic');
	});

	await test.step('Schedule a post for enterprise user', async () => {
		await createScheduleMessage.command(
			parseInt(global.member[0].memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, `${accounts.twitter}`).socialProfile.socialProfileId,
						text: message,
						scheduledSendTime: formatISO(scheduleTime)
					}
				]
			}
		);
	});

	await test.step('Dismiss enterprise user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(enterpriseUserMemberId);
		await plannerPage.hideRecommendedTimes(enterpriseUserMemberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
		await plannerPage.switchToExpandedView(global.member[0].memberId);
	});

	await test.step('Verify scheduled message in week view', async () => {
		await plannerPage.verifyScheduledMessage(message, scheduleTime.getHours());
	});

	await test.step('Ensure post is not displayed when filtered by facebook', async () => {
		await plannerPage.toggleFiltersButton();
		await plannerPage.filterBySocialProfile(enterpriseUserFacebookPage);
		await plannerPage.closeFilterPanel();
		await plannerPage.weekViewPostCountHeader(0); //Check count to ensure no card is visible
	});

	await test.step('Verify post is present when filtered by twitter', async () => {
		await plannerPage.resetSelectedFilters();
		await plannerPage.toggleFiltersButton();
		await plannerPage.filterBySocialProfile(enterpriseUserTwitter);
		await plannerPage.closeFilterPanel();
		await plannerPage.weekViewPostCountHeader(1); //Check count to ensure card is visible
	});

	await test.step('Ensure post is not displayed when filtered by Drafts', async () => {
		await plannerPage.toggleFiltersButton();
		await plannerPage.filterByPostStatus('Drafts');
		await plannerPage.closeFilterPanel();
		await plannerPage.weekViewPostCountHeader(0); //Check count to ensure no card is visible
	});

	await test.step('Reset both filters and verify post is visible', async () => {
		await plannerPage.resetSelectedFilters();
		await plannerPage.weekViewPostCountHeader(1); //Check count to ensure card is visible
	});

	await test.step('Verify message details in planner preview pane', async () => {
		await plannerPage.showPreviewPane(message);
		await plannerPage.verifyTextInPreviewPane(message);
	});
});
