// Test to verify basic message editing from planner
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const { getObjectByName } = require('../../../../globals');
const { formatISO, addMinutes,  } = require('date-fns');
const { LoginPage } = require('../../../../pages/login');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const tearDown = require('../../../../custom-commands/tearDown');

let memberId, liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify basic message editing from planner', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const plannerPage = new PlannerPage(page);
	const createScheduleMessage = new scheduleV3Message();
	const composePage = new ComposePage(page);

	const messageText = `Schedule post to edit ${Math.floor(Math.random() * 1000)}`;
	const editedText = ', edit with additional text';
	const scheduleTime = addMinutes(new Date(), 30);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('basic_message_edit', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'basic_message_edit').linkedinProfile.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('basic_message_edit');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step(`Schedule a message for ${liAccount}`, async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'basic_message_edit').linkedinProfile.id),
						text: messageText,
						scheduledSendTime: formatISO(scheduleTime)
					}
				]
			}
		);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message in planner preview pane', async () => {
		await plannerPage.showPreviewPane(messageText);
		await plannerPage.verifyTextInPreviewPane(messageText);
	});

	await test.step('Open message from planner preview pane', async () => {
		await plannerPage.editFromPreviewPane();
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyLinkedInPreview(messageText);
	});

	await test.step('Edit & verify preview is updated', async () => {
		await expect(page.getByTestId('preview-container').getByText(`${liAccount}`)).toBeVisible(); //Wait for preview to load
		await composePage.writeMessage(editedText);
		await composePage.verifyLinkedInPreview(messageText.concat(editedText));
	});

	await test.step('Save the edited message', async () => {
		await composePage.saveEditedMessage();
	});

	await test.step('Verify edited message in preview pane', async () => {
		await expect(composePage.feCallOuts).not.toBeVisible();
		await plannerPage.verifyTextInPreviewPane(messageText.concat(editedText)); // Verify the edited message in preview pane
	});

	await test.step('Delete the linkedin scheduled post', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});
