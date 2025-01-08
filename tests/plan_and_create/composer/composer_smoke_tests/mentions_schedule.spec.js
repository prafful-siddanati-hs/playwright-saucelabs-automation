const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');
const {PlannerPage} = require('../../../../pages/planandcreate/planner');
let linkedInAccount, memberId;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

/* Test to schedule a message with mentions */
test('Schedule a message with mentions', async ({ page }) => {
	const mentionsText = 'Mention & schedule ';
	const liMention = plan_create.getLinkedinMention();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('mentions_schedule', 'pro_user_composer', true, 300);
		linkedInAccount = getObjectByName(global.fixture, 'mentions_schedule').linkedinProfile.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('mentions_schedule');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select LinkedIn account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(linkedInAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview'), 'Empty linkedin preview is not displayed').toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(`${mentionsText} `);
		await composePage.messageArea.pressSequentially(`@${liMention}`);
		await page.waitForTimeout(500); // Wait for the mention to be added
		await composePage.verifyLinkedInPreview(`${mentionsText}@${liMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(liMention);
		await page.waitForTimeout(1000);
	});

	await test.step('Verify linkedIn mention in preview', async () => {
		await composePage.verifyLinkedInMentionPreview(liMention);
		await page.waitForTimeout(500);
	});

	await test.step('Schedule the message', async () => {
		await composePage.schedule();
	});

	await test.step('Delete scheduled message via API', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});
});
