const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../../pages/planandcreate/planner');
let memberId, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that the user can select recently used profile to send/schedule message from composer', async ({ page }) => {
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('composer_basic', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'composer_basic').twitter.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('composer_basic');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account from recently user network pill', async () => {
		const pillSelector= `//*[contains(@class, "vk-ComposerModal")]//*[contains(@class, "vk-SocialNetworkPillsContainer")]//*[@title="${twAccount}"]`;
		await expect(page.locator(pillSelector)).toBeVisible();
		await page.locator(pillSelector).click();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
	});

	await test.step('Schedule the messages', async () => {
		await composePage.schedule();
	});

	await test.step('Delete the scheduled messages', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
		await page.waitForTimeout(500);
	});
});
