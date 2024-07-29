const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName, plan_create } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../pages/planandcreate/planner');
let memberId, fbAccount, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Composer basic validations', async ({ page }) => {
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const plannerPage = new PlannerPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('composer_basic', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'composer_basic').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'composer_basic').facebookPage.username;
		memberId = global.member[0].memberId;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('composer_basic');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyFacebookPreview(composeBasicText);
		await page.waitForTimeout(2000);
	});

	await test.step('Verify preview for each network tab', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(composeBasicText);
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(composeBasicText);
	});

	await test.step('Schedule the messages', async () => {
		await composePage.schedule();
	});

	await test.step('Delete the scheduled messages', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});
});
