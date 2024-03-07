const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {PinPage} = require('../../pages/planandcreate/pin');
const {getObjectByName, plan_create} = require('../../globals');
const {LoginPage} = require('../../pages/login');
const getFixture = require('../../custom-commands/getFixture');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send pinterest message using composer', async ({ page }) => {
	const pinText =  'Send Pin ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const pinPage = new PinPage(page);

	await addFixture.command('pin_send', 'enterprise_user_composer', true, 300);

	await loginPage.signIn('pin_send');
	await expect(page.getByRole('heading', { name: 'Welcome back,' })).toBeVisible();

	await pinPage.selectPinButton();
	await pinPage.selectFirstPinBoard();
	await pinPage.uploadImageFile('test_data/publisher/images');
	await pinPage.writePinMessage(pinText);
	await pinPage.writeWebsiteUrl('bbc.com');
	await pinPage.verifyPinPreview(pinText, 'bbc.com');
	await pinPage.sendNow();
});
