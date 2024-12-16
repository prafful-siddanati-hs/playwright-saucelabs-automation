/* Test to verify message cards with link, tags, media are correctly displayed on planner */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const createOrg = require('../../../../custom-commands/createOrg.js');
const addSocialToOrg = require('../../../../custom-commands/addSocialToOrg.js');
const { getObjectByName, plan_create } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const { formatISO, startOfDay, addDays } = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const { CreateTag } = require('../../../../custom-commands/createTag.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, orgId, fbAccount, twAccount, createdTag;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify message cards with link, tags, media are correctly displayed on planner', async ({ page }) => {
	const addFixture = new getFixture();
	const createNewOrg = new createOrg();
	const addSocialNetwork = new addSocialToOrg();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const createTag = new CreateTag();

	let orgName = 'MessageCards_' + Math.floor(Math.random() * 10000);
	let twImageMessage = 'Twitter post with image ' + Math.floor(Math.random() * 10000);
	let twLinkImageMessage = `Twitter post with link & image ${plan_create.getRandomUrl()} ` + Math.floor(Math.random() * 10000);
	let fbVideoMessage = 'Facebook post with video ' + Math.floor(Math.random() * 10000);
	let fbTagsMessage = 'Facebook post with tag ' + Math.floor(Math.random() * 10000);
	let scheduleDate = startOfDay(addDays(new Date(), 1));
	let messageTag = 'PlaywrightTestTag';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('mixed_message_cards', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_messageCards', 'twitter', false, 300);
		await addFixture.command('fb_messageCards', 'plan_create_facebookpage', false, 300);
		await createNewOrg.command(orgName);
		await addSocialNetwork.command('tw_messageCards');
		await addSocialNetwork.command('fb_messageCards');
		memberId = global.member[0].memberId;
		orgId = global.organization[0].id;
		twAccount = getObjectByName(global.fixture, 'tw_messageCards').socialProfile.username;
		fbAccount = getObjectByName(global.fixture, 'fb_messageCards').socialProfile.username;
		createdTag = await createTag.createTag(messageTag,'', orgId, memberId);
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('mixed_message_cards');
	});

	await test.step(`Schedule a ${twAccount} image message`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_messageCards').socialProfile.socialProfileId,
						text: twImageMessage,
						scheduledSendTime: formatISO(scheduleDate),
						mediaUrls: [{ url: plan_create.image_url}]
					}
				]
			}
		);
	});

	await test.step(`Schedule a ${twAccount} link and image message`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_messageCards').socialProfile.socialProfileId,
						text: twLinkImageMessage,
						scheduledSendTime: formatISO(scheduleDate),
						mediaUrls: [{ url: plan_create.image_url}],
					}
				]
			}
		);
	});

	await test.step(`Schedule a ${fbAccount} video message`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'fb_messageCards').socialProfile.socialProfileId,
						text: fbVideoMessage,
						scheduledSendTime: formatISO(scheduleDate),
						mediaUrls: [{ url: plan_create.video_url}]
					}
				]
			}
		);
	});

	await test.step(`Schedule a ${fbAccount} tags message`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'fb_messageCards').socialProfile.socialProfileId,
						text: fbTagsMessage,
						scheduledSendTime: formatISO(scheduleDate),
						tagIds: [createdTag.id]
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
		await plannerPage.weekViewPostCountHeader(4); // Check count to ensure all cards are present
	});

	await test.step('Verify twitter post with image on preview pane', async () => {
		await plannerPage.showPreviewPane(twImageMessage);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(twImageMessage);
		await expect(plannerPage.twitterPreviewMedia).toBeVisible();
	});

	await test.step('Verify twitter post with link and image on preview pane', async () => {
		await plannerPage.showPreviewPane(twLinkImageMessage);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Twitter');
		await expect(plannerPage.twitterPreviewSocialProfile).toContainText(twAccount);
		await expect(plannerPage.twitterPreviewMessageText).toHaveText(twLinkImageMessage);
		await expect(plannerPage.twitterPreviewMedia).toBeVisible();
	});

	await test.step('Verify facebook post with video on preview pane', async () => {
		await plannerPage.showPreviewPane(fbVideoMessage);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
		await expect(plannerPage.facebookPreviewMessageText).toHaveText(fbVideoMessage);
		await expect(plannerPage.facebookPreviewVideo).toBeVisible();
	});

	await test.step('Verify facebook post with tags on preview pane', async () => {
		await plannerPage.showPreviewPane(fbTagsMessage);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('Facebook');
		await expect(plannerPage.facebookPreviewSocialProfile).toContainText(fbAccount);
		await expect(plannerPage.facebookPreviewMessageText).toHaveText(fbTagsMessage);
		await expect(plannerPage.messageTags).toContainText(createdTag.name);
	});
});
