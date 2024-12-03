//Test to verify the maximum character limits for a edit linkedin post
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

test('Verify that the 3000-character threshold works as expected for edit linkedin message', async ({ page }) => {
	let originalText = `Li test ${Date.now()}`;
	const liMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} Hello, I am interested in connecting with you and learning more about your work. I see that we have similar interests in the industry and would love to discuss potential opportunities. Looking forward to your response and connecting with you. Thank you!`;
	const msgAboveTheLimit = plan_create.generateRandomMessage(liMsg,3001);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createScheduleMessage = new scheduleV3Message();
	const scheduleTime = addHours(new Date(), 1);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('edit_li_msg_char_limit', 'pro_user_composer', true, 300);
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('edit_li_msg_char_limit');
	});

	await test.step('Schedule a message via API', async () => {
		await createScheduleMessage.command(
			parseInt(memberId, 10),
			{
				messages: [
					{
						socialProfileId: parseInt(getObjectByName(global.fixture, 'edit_li_msg_char_limit').linkedinProfile.id),
						text: originalText,
						scheduledSendTime: formatISO(scheduleTime),
					}
				]
			}
		);
	});

	await test.step('Hide native posts & recommended times', async () => {
		await plannerPage.hideNativePosts(memberId);
		await plannerPage.hideRecommendedTimes(memberId);
	});

	await test.step('Navigate to planner', async () => {
		await plannerPage.visit();
	});

	await test.step('Verify scheduled message', async () => {
		await plannerPage.verifyScheduledMessage(originalText, getObjectByName(global.fixture, 'edit_li_msg_char_limit').linkedinProfile.username);
		await plannerPage.showPreviewPane(originalText);
	});

	await test.step('Open message from planner preview pane', async () => {
		await plannerPage.editFromPreviewPane();
		await expect(composePage.composeScreen).toBeVisible();
		await composePage.verifyLinkedInPreview(originalText);
	});

	await test.step('Edit message', async () => {
		await composePage.clearMessageEditor();
		await expect(page.locator('.vk-Loader')).toHaveCount(0);
		await page.keyboard.press('Escape');
		await composePage.messageArea.click();
		await composePage.messageArea.fill(msgAboveTheLimit);
		await expect(page.locator('.vk-Loader')).toHaveCount(0);
		const message = await composePage.messageArea.innerText();
		await composePage.verifyLinkedInPreview(message);
	});

	await test.step('Verify error message for the character count exceed its limit', async () => {
		await expect(composePage.messageCharCount).toHaveText('3,001 / 3,000');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'LinkedIn\']')).toBeVisible();
	});

	await test.step('Delete created scheduled messages via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});

});
