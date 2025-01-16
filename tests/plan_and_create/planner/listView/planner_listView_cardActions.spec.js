//Test to verify card actions in planner list view
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

let memberId, liAccountName, scheduleText;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify card actions from planner list view', async ({ page }) => {
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);

	let editedScheduledText = '--adding image to original message';

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('list_view_actions', 'team3s');
		await addFixture.command('li_card_actions', 'linkedin', true, 300);
		memberId = global.member[0].memberId;
		liAccountName = getObjectByName(global.fixture, 'li_card_actions').socialProfile.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signIn('list_view_actions');
	});

	await test.step('Create scheduled message for test user', async () => {
		scheduleText = 'Verify list view card actions';
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'li_card_actions').socialProfile.socialProfileId, 10),
						text: scheduleText,
						scheduledSendTime: formatISO(addMinutes(new Date(), 15)),
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

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Switch to list view', async () => {
		await plannerPage.selectListView();
	});

	await test.step('Verify messages & count on list view by post type', async () => {
		await expect(plannerPage.postVolumeCalendarContainer).toBeVisible();
		await expect(plannerPage.listViewCards).toHaveCount(1);
		await plannerPage.verifyScheduledMessage(scheduleText);
	});

	await test.step('Verify clicking on cards opens detail pane', async () => {
		await plannerPage.showPreviewPane(scheduleText);
		await expect(plannerPage.detailPane).toBeVisible();
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.detailPaneSocialNetwork).toHaveText('LinkedIn');
		await expect(plannerPage.linkedinPreviewSocialProfile).toContainText(liAccountName);
	});

	await test.step('Verify move to drafts button in preview pane', async () => {
		await expect(plannerPage.additionalActionsButton).toBeVisible();
		await plannerPage.additionalActionsButton.click();
		await expect(plannerPage.moveToDraftsButton).toBeVisible();
	});

	await test.step('Edit the post from list view card actions', async () => {
		await plannerPage.clickListViewDayCard(scheduleText, liAccountName);
		await expect(plannerPage.listViewDeleteAction).toBeVisible();
		await expect(plannerPage.listViewEditAction).toBeVisible();
		await plannerPage.listViewEditAction.click();
	});

	await test.step('Type additional text & add media to the scheduled message', async () => {
		await composePage.writeMessage(editedScheduledText);
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Art.png');
		await composePage.verifyLinkedInImagePreview();
		await composePage.verifyLinkedInPreview(scheduleText.concat(editedScheduledText));
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited message in planner preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.clickListViewDayCard(scheduleText.concat(editedScheduledText), liAccountName);
		await expect(plannerPage.detailPaneMessageStateText).toHaveText('Scheduled');
		await expect(plannerPage.linkedinPreviewMessageText).toHaveText(scheduleText.concat(editedScheduledText));
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.clickListViewDayCard(scheduleText, liAccountName);
		await plannerPage.deleteFromListView();
		await expect(plannerPage.listViewCards).toHaveCount(0);
	});
});
