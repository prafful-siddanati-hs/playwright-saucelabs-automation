/* Test to verify boundary condition of character limits for twitter message by editing & duplicating a scheduled post */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');
const {formatISO, addHours} = require('date-fns');
const scheduleV3Message = require('../../../../custom-commands/scheduleV3Message');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');

let memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that the 280-character threshold works as expected for edit twitter message', async ({ page }) => {
	let twMsg = `Test twitter character limit of 280 characters including a hashtag ${plan_create.getRandomHashTag()} and url that takes up 24 characters`;
	const scheduledText = `${plan_create.getRandomUrl()} `.concat(plan_create.generateRandomMessage(twMsg,251));

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleTime = addHours(new Date(), 1);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('edit_tw_msg_char_limit', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('edit_tw_msg_char_limit');
	});

	await test.step('Delete residual scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

	await test.step('Schedule a message via API', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'edit_tw_msg_char_limit').twitter.id),
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
		await plannerPage.showPreviewPane(scheduledText);
		await plannerPage.verifyTextInPreviewPane(scheduledText);
	});

	await test.step('Duplicate the scheduled post', async () => {
		await page.waitForTimeout(2000);
		await plannerPage.duplicateFromPreviewPane();
	});

	await test.step('Verify preview on composer', async () => {
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyTwitterPreview(scheduledText);
	});

	await test.step('Verify the character count', async () => {
		await expect(composePage.messageCharCount).toHaveText('275 / 280');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).not.toBeVisible();
	});

	await test.step('Add additional characters to exceed the limit', async () => {
		const message = await composePage.messageArea.innerText();
		await composePage.writeMessage(' extra');
		await page.waitForTimeout(500);
		await composePage.verifyTwitterPreview(message);
	});

	await test.step('Verify error message for the character count exceed its limit', async () => {
		await expect(composePage.messageCharCount).toHaveText('281 / 280');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).toBeVisible();
	});

	await test.step('Remove characters to till error is not shown', async () => {
		await composePage.removeCharacters(1);
		await expect(composePage.messageCharCount).toHaveText('280 / 280');
	});

	await test.step('Schedule the duplicate message', async () => {
		await composePage.scheduleDuplicateMessage();
	});

	await test.step('Delete the scheduled message', async () => {
		await plannerPage.deleteFromPreviewPane();
	});
});