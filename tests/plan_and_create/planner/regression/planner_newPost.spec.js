/* Test to verify pre scheduled & new posts are available on planner */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName } = require('../../../../globals.js');
const { formatISO, addHours, setDay } = require('date-fns');
const { LoginPage } = require('../../../../pages/login.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, fbAccount;
const NUMBER_OF_PRE_SCHEDULED_POSTS = 7;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify count of posts after creating a new post in planner', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const composePage = new ComposePage(page);

	let orgName = 'NewPost_' + Math.floor(Math.random() * 10000);
	let scheduleTime;
	let plannerScheduledText = `Scheduled post from planner ${Date.now()}`;
	let composerScheduledText = `Scheduled post from composer ${Date.now()}`;

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('new_post', 'plan_create_enterprise', false, 300);
		await addFixture.command('fb_newPost', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('fb_newPost');
		memberId = global.member[0].memberId;
		fbAccount = getObjectByName(global.fixture, 'fb_newPost').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('new_post');
	});

	await test.step('Schedule a message for each day throughout the week', async () => {
		for ( let i = 0; i < NUMBER_OF_PRE_SCHEDULED_POSTS; i++ ) {
			scheduleTime = addHours(setDay(new Date(), 7), i * 24);

			await createScheduleMessage.command(
				parseInt(memberId, 10),
				{
					messages: [{
						socialProfileId: getObjectByName(global.fixture, 'fb_newPost').socialProfile.socialProfileId,
						text: plannerScheduledText,
						scheduledSendTime: formatISO(scheduleTime),
					}]
				}
			);
		}
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
		await plannerPage.switchToExpandedView(memberId);
		await expect(plannerPage.dayMessageCounter).not.toBeVisible();
	});

	await test.step('Select new post from planner', async () => {
		await plannerPage.selectPost(plannerPage.newPost);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await composePage.verifySocialProfileSelected(fbAccount);
	});

	await test.step('Create a new post', async () => {
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await composePage.writeMessage(composerScheduledText);
	});

	await test.step('Upload an image', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images/');
		await expect(composePage.facebookPreviewSingleImage, 'Facebook preview is updated with image').toBeVisible();
		await expect(composePage.facebookPreviewSingleImage).toHaveAttribute('src', /staging/);
		await composePage.verifyFacebookPreview(composerScheduledText);
	});

	await test.step('Schedule the post', async () => {
		await expect(composePage.scheduleButton).toBeVisible();
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
		await expect(composePage.feCallOuts).toHaveCount(1);
	});

	await test.step('Switch planner to condensed view', async () => {
		await page.goto('/dashboard#/planner/view/week/condensed');
	});

	await test.step('Verify all the scheduled messages are present on planner', async () => {
		const cardCount = page.locator('.vk-Planner .vk-Week .vk-Card');
		await expect(composePage.feCallOuts).not.toBeVisible();
		await expect(cardCount).toHaveCount(NUMBER_OF_PRE_SCHEDULED_POSTS + 1);
	});

	await test.step('Vreify details of the scheduled post', async () => {
		await plannerPage.showPreviewPane(composerScheduledText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
		await expect(plannerPage.facebookPreviewMessageText).toHaveText(composerScheduledText);
	});
});
