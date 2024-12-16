//Test to create a draft and scheduled posts and then edit both of them
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture.js');
const { getObjectByName } = require('../../../../globals.js');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require('../../../../pages/login.js');
const { DraftsPage } = require('../../../../pages/planandcreate/drafts.js');
const { PlannerPage } = require('../../../../pages/planandcreate/planner.js');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const tearDown = require('../../../../custom-commands/tearDown.js');

let memberId, twitterAccount, facebookPage;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify scheduled & draft post can be edited from planner', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const draftsPage = new DraftsPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const composePage = new ComposePage(page);

	let scheduleTime  = addHours(new Date(), 2);
	let scheduledText = 'Scheduled post to edit ' + Math.floor(Math.random() * 1000);
	let editScheduledText = ' edit with additional text';
	let editDraftText = ' edit draft with additional text';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('draft_edit', 'plan_create_enterprise', false, 300);
		await addFixture.command('tw_draft_edit', 'twitter', true, 300);
		await addFixture.command('fb_draft_edit', 'plan_create_facebookpage', true, 300);
		memberId = global.member[0].memberId;
		twitterAccount = getObjectByName(global.fixture, 'tw_draft_edit').socialProfile.username;
		facebookPage = getObjectByName(global.fixture, 'fb_draft_edit').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInSkipOnboarding('draft_edit');
	});

	await test.step('Dismiss new user onboarding modal', async () => {
		await page.evaluate(() => {
			hs.memberActionHistory.postScheduledOrSent = true;
			hs.memberActionHistory.hasDismissedPlannerRecommendedTimesFirstRunPopover = true;
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideRecommendedTimes(memberId);
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Deleting residual drafts', async () => {
		await draftsPage.deleteDraftsViaApi(memberId);
	});

	await test.step(`Schedule a post for ${twitterAccount}`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_draft_edit').socialProfile.socialProfileId,
						text: scheduledText,
						scheduledSendTime: formatISO(scheduleTime),
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.verifyScheduledMessage(scheduledText);
	});

	await test.step('Open twitter post to duplicate', async () => {
		await plannerPage.showPreviewPane(scheduledText);
		await plannerPage.duplicateFromPreviewPane(scheduledText);
	});

	await test.step('Verify message content on composer when duplicating', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyTwitterPreview(scheduledText);
	});

	await test.step(`Remove twitter and select ${facebookPage}`, async () => {
		await expect(composePage.clearAccountsButton).toBeVisible();
		await composePage.clearAccountsButton.click();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(facebookPage);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await composePage.verifyFacebookPreview(scheduledText);
	});

	await test.step('Save the post as a draft', async () => {
		await composePage.saveDraft();
	});

	await test.step('Open twitter post to edit', async () => {
		await plannerPage.showPreviewPane(scheduledText, twitterAccount);
		await plannerPage.editFromPreviewPane(scheduledText);
	});

	await test.step('Verify preview on composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyTwitterPreview(scheduledText);
	});

	await test.step('Edit the message', async () => {
		await composePage.writeMessage(editScheduledText);
		await composePage.verifyTwitterPreview(scheduledText.concat(editScheduledText));
	});

	await test.step('Save the edits made to the post', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify the message was edited', async () => {
		await plannerPage.verifyScheduledMessage(scheduledText.concat(editScheduledText), twitterAccount);
	});

	await test.step('Open facebook draft to edit', async () => {
		await plannerPage.showPreviewPane(scheduledText, facebookPage);
		await plannerPage.editFromPreviewPane(scheduledText);
	});

	await test.step('Verify facebook draft preview on composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyFacebookPreview(scheduledText);
	});

	await test.step('Edit the facebook draft', async () => {
		await composePage.writeMessage(editDraftText);
		await composePage.verifyFacebookPreview(scheduledText.concat(editDraftText));
	});

	await test.step('Schedule the facebook draft', async () => {
		await expect(composePage.scheduleButton).toBeVisible();
		await composePage.scheduleButton.hover();
		await composePage.scheduleButton.click();
	});

	await test.step('Verify the facebook scheduled post on planner', async () => {
		await plannerPage.verifyScheduledMessage(scheduledText.concat(editDraftText), facebookPage);
	});

	await test.step('Delete the scheduled post', async () => {
		await plannerPage.showPreviewPane(scheduledText.concat(editDraftText), facebookPage);
		await plannerPage.deleteFromPreviewPane();
		await plannerPage.verifyScheduledMessageNotPresent(scheduledText.concat(editDraftText), facebookPage);
	});
});
