/**
 * [https://hootsuite.atlassian.net/browse/SBE-5690]
 * Test to verify that the user is able to close the composer and save the edits.
 */
const { test,expect } = require('@playwright/test');
const { LoginPage } = require('../../../pages/login');
const { PlannerPage } = require('../../../pages/planandcreate/planner');
const scheduleV3Message = require('../../../custom-commands/scheduleV3Message');
const createUser = require('../../../custom-commands/createUser');
const getFixture = require('../../../custom-commands/getFixture');
const tearDown = require('../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../globals');
const { formatISO, addHours } = require('date-fns');
const { ComposePage } = require('../../../pages/planandcreate/compose');
let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Close composer and save edits', async ({page}) => {
	let originalText = `Save edits while closing ${Date.now()}`;
	let editedText = originalText.concat('--edited');
	const scheduleTime = addHours(new Date(), 1);
	const createNewUser = new createUser();
	const addFixture = new getFixture();
	const createScheduleMessage = new scheduleV3Message();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const composePage = new ComposePage(page);


	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('save_edit_on_close', 'professional');
		await addFixture.command('tw_save_edit','twitter', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('save_edit_on_close');
	});

	await test.step('Schedule a message', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: getObjectByName(global.fixture, 'tw_save_edit').socialProfile.socialProfileId,
						text: originalText,
						scheduledSendTime: formatISO(scheduleTime)
					}
				]
			}
		);
	});

	await test.step('Hide native posts', async () => {
		await plannerPage.hideNativePosts(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message', async () => {
		await plannerPage.verifyScheduledMessage(originalText);
		await plannerPage.showPreviewPane(originalText);
	});

	await test.step('Open message from planner preview pane', async () => {
		await plannerPage.editFromPreviewPane();
		await expect(composePage.exitButton).toBeVisible();
		await composePage.exitButton.click();
		await expect(composePage.composeScreen).toBeVisible();
	});

	await test.step('Edit message', async () => {
		await composePage.messageArea.click();
		await composePage.messageArea.fill(`${editedText}`);
	});

	await test.step('Close composer and save edits', async () => {
		await composePage.exitComposerButton.click();
		await composePage.saveChanges();
	});

	await test.step('Verify updated message', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(editedText);
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});
});
