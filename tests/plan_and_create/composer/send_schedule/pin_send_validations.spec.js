const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {PinPage} = require('../../../../pages/planandcreate/pin');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {plan_create} = require('../../../../globals');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send pinterest message using composer', async ({ page }) => {
	const pinText =  `Send Pin ${plan_create.getRandomUrl()} ${plan_create.getRandomEmoji()} ${Math.floor(Math.random() * 1000)}`;

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const pinPage = new PinPage(page);
	const composePage = new ComposePage(page);

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
	//
	// await test.step('Upload an image', async () => {
	// 	await pinPage.uploadImageFile('test_data/publisher/images');
	// });
	//
	// await test.step('Write a pin message and website url', async () => {
	// 	await pinPage.writePinMessage(pinText);
	// 	await pinPage.writeWebsiteUrl('bbc.com');
	// });
	//
	// await test.step('Verify pin preview', async () => {
	// 	await pinPage.verifyPinPreview(pinText, 'bbc.com');
	// });

	await test.step('Send pin message with link and text and verify error messages', async () => {
		await pinPage.postNowButton.click();
		await expect(page.locator('(//*[@role="alert"])[1]')).toHaveText('errorOops! You haven\'t added any textPinterest requires text to be included');
		await expect(page.locator('(//*[@role="alert"])[2]')).toHaveText('errorOops! Image is missingPinterest requires at least one image to post');
	});

	await test.step('Upload an gif', async () => {
		await composePage.uploadMediaFile('test_data/publisher/giphy', 'test_data/publisher/giphy/giphy_1.gif');
		await page.waitForTimeout(1000);
	});

	await test.step('Send pin message with gif only and verify error messages', async () => {
		await pinPage.postNowButton.click();
		await expect(page.locator('(//*[@role="alert"])[1]')).toHaveText('errorOops! You haven\'t added a websitePinterest requires a link to be added to your Pin.');
		await expect(page.locator('(//*[@role="alert"])[2]')).toHaveText('errorOops! You haven\'t added any textPinterest requires text to be included');
	});

	await test.step('Remove gif and Upload an image', async () => {
		await pinPage.imageRemoveButton.click();
		await pinPage.uploadImageFile('test_data/publisher/images');
		await page.waitForTimeout(1000);
	});

	await test.step('Send pin message with image only and verify error messages', async () => {
		await pinPage.postNowButton.click();
		await expect(page.locator('(//*[@role="alert"])[1]')).toHaveText('errorOops! You haven\'t added a websitePinterest requires a link to be added to your Pin.');
		await expect(page.locator('(//*[@role="alert"])[2]')).toHaveText('errorOops! You haven\'t added any textPinterest requires text to be included');
	});

	await test.step('Write a pin message', async () => {
		await pinPage.writePinMessage(pinText);
	});

	await test.step('Send pin message with image, text and verify error messages', async () => {
		await pinPage.postNowButton.click();
		await expect(page.locator('(//*[@role="alert"])[1]')).toHaveText('errorOops! You haven\'t added a websitePinterest requires a link to be added to your Pin.');
	});

	await test.step('Write a website url and send message', async () => {
		await pinPage.writeWebsiteUrl('bbc.com');
	});

	await test.step('Verify pin preview', async () => {
		await pinPage.verifyPinPreview(pinText, 'bbc.com');
	});

	await test.step('Send pin message from composer', async () => {
		await pinPage.sendNow();
	});

});
