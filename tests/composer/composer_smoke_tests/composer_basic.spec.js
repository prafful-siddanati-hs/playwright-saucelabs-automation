const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName, plan_create } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');
const { PlannerPage } = require('../../../pages/planandcreate/planner');
let memberId, fbAccount, liAccount;

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
		await addFixture.command('composer_basic', 'enterprise_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'composer_basic').linkedinCompany.username;
		fbAccount = getObjectByName(global.fixture, 'composer_basic').facebookPage.username;
		memberId = global.member[0].memberId;
		console.log(memberId);
	});

	await test.step('Login as an enterprise user', async () => {
		await loginPage.signIn('composer_basic');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & linkedin account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeBasicText);
	});

	await test.step('Verify preview for each network tab', async () => {
		await composePage.verifyGenericPreview(composeBasicText);
		await expect(composePage.linkedInTab).toBeVisible();
		composePage.linkedInTab.click();
		await composePage.verifyLinkedInPreview(composeBasicText);
		await expect(composePage.facebookPageTab).toBeVisible();
		composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(composeBasicText);
	});

	await test.step('Schedule the messages', async () => {
		await composePage.schedule();
	});

	await test.step('Delete the scheduled messages', async () => {
		await plannerPage.deleteScheduleMessagesViaAPI(memberId);
	});
});
