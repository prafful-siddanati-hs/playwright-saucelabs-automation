const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
let fbAccount, twAccount;

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

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('clear_accounts', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'clear_accounts').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'clear_accounts').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('clear_accounts');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & twitter account', async () => {
		await expect(composePage.clearAccountsButton).not.toBeVisible();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyFacebookPreview(composeBasicText);
	});

	await test.step('Clear selected social accounts and verify its preview', async () => {
		await expect(composePage.clearAccountsButton).toBeVisible();
		await composePage.clearAccountsButton.click();
		await expect(composePage.clearAccountsButton).not.toBeVisible();
		await expect(composePage.genericPreviewText).toHaveText(composeBasicText);
		await expect(composePage.genericProfileName).toHaveText('Your account');
		await expect(composePage.emptyTwitterPreview).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).not.toBeVisible();
	});
});
