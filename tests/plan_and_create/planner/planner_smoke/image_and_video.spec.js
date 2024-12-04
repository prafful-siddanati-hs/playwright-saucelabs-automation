//Test to verify image & video posts in planner
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const { getObjectByName, plan_create } = require('../../../../globals');
const { formatISO, addMinutes } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const tearDown = require('../../../../custom-commands/tearDown');

let memberId, fbAccount, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify image and video posts in planner', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();

	const imageText = `Scheduled image post ${Date.now()}`;
	const videoText = `Scheduled video post ${Date.now()}`;
	const scheduleTime = addMinutes(new Date(), 30);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('image_and_video', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'image_and_video').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'image_and_video').facebookPage.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('image_and_video');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step(`Schedule an image post for ${twAccount}`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'image_and_video').twitter.id),
						text: imageText,
						scheduledSendTime: formatISO(scheduleTime),
						mediaUrls: [
							{ url: plan_create.image_url }
						]
					}
				]
			}
		);
	});

	await test.step(`Schedule a video post for ${fbAccount}`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'image_and_video').facebookPage.id),
						text: videoText,
						scheduledSendTime: formatISO(scheduleTime),
						mediaUrls: [
							{ url: plan_create.video_url }
						]
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled image post in planner preview pane', async () => {
		await plannerPage.showPreviewPane(imageText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(imageText);
		await expect(plannerPage.twitterPreviewMedia).toBeVisible();
	});

	await test.step('Delete the twitter scheduled post', async () => {
		await plannerPage.deleteFromPreviewPane();
		await expect(plannerPage.feCallOut).not.toBeVisible();
	});

	await test.step('Verify scheduled video post in planner preview pane', async () => {
		await plannerPage.showPreviewPane(videoText);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
		await expect(plannerPage.facebookPreviewMessageText).toHaveText(videoText);
		await expect(plannerPage.facebookPreviewVideo).toBeVisible();
	});

	await test.step('Delete the facebook scheduled post', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
