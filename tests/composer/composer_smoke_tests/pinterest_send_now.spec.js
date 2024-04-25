const { test} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {PinPage} = require('../../../pages/planandcreate/pin');
const {LoginPage} = require('../../../pages/login');
const getFixture = require('../../../custom-commands/getFixture');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test.skip('Send pinterest message using composer', async ({ page }) => {
	const pinText =  'Send Pin ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const pinPage = new PinPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pin_send', 'enterprise_user_composer', true, 300);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pin_send');
	});

	await test.step('Select pin button from global navigator', async () => {
		await pinPage.selectPinButton();
	});

	await test.step('Select first board from social network picker', async () => {
		await pinPage.selectFirstPinBoard();
	});

	await test.step('Upload an image', async () => {
		await pinPage.uploadImageFile('test_data/publisher/images');
	});

	await test.step('Write a pin message and website url', async () => {
		await pinPage.writePinMessage(pinText);
		await pinPage.writeWebsiteUrl('bbc.com');
	});

	await test.step('Verify pin preview', async () => {
		await pinPage.verifyPinPreview(pinText, 'bbc.com');
	});

	await test.step('Send pin message from composer', async () => {
		await pinPage.sendNow();
	});

});
