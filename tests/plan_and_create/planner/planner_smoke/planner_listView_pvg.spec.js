//Test to verify post volume graph in planner list view
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount, snId, postNowText;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify post volume graph in planner list view', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const addSocialNetwork = new addSocialToOrg();

	let orgName = 'ListViewPVG_' + Math.floor(Math.random() * 10000);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('list_view_pvg', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_listView_pvg', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_listView_pvg');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_listView_pvg').socialProfile.username;
		snId = getObjectByName(global.fixture, 'fb_listView_pvg').socialProfile.socialProfileId;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('list_view_pvg');
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

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner & select list view', async () => {
		await plannerPage.visit();
		await plannerPage.selectListView();
	});

	await test.step('Verify post volume graph is present', async () => {
		await expect(plannerPage.postVolumeCalendarContainer).toBeVisible();
	});

	await test.step('Verify post volume graph has data', async () => {
		await expect(plannerPage.todayInListView).toBeVisible();
		await plannerPage.todayInListView.click();
		await expect(plannerPage.singlePvgBar).toBeVisible();
		await expect(plannerPage.postVolumeGraphWeek).toHaveCount(4);
	});
});
