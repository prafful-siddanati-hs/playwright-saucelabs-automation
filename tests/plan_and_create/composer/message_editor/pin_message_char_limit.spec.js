//This test is to validate pinterest message char limit

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
const {plan_create} = require('../../../../globals');
const {PinPage} = require('../../../../pages/planandcreate/pin');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify the pinterest message character limit that are above and below the 500-character threshold', async ({ page }) => {
	const pinMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} Hey everyone! 🌟 I’m doing a quick test to see how this message looks on Pinterest. If you’re seeing this, it means I’m checking formatting, spacing, and all the little details to make sure everything looks great when I share my upcoming content. 📸✨`;
	const msgWithInTheLimit = plan_create.generateRandomMessage(pinMsg,495);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const pinPage = new PinPage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pin_mes_char_limit', 'enterprise_user_composer', true, 300);
	});

	await test.step('Login as enterprise test user', async () => {
		await loginPage.signInSkipOnboarding('pin_mes_char_limit');
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
		await page.keyboard.press('Escape');
		await pinPage.messageArea.click();
		await pinPage.messageArea.fill(msgWithInTheLimit);
		await expect(page.locator('.vk-Loader')).toHaveCount(0);
		await pinPage.writeWebsiteUrl('bbc.com');
	});

	await test.step('Verify pin preview', async () => {
		await pinPage.verifyPinPreview(msgWithInTheLimit, 'bbc.com');
	});

	await test.step('Verify the character limit', async () => {
		await expect(pinPage.messageCharCount.first()).toHaveText(' 495 / 500');
	});

	await test.step('Add a few characters to exceed the limit', async () => {
		await pinPage.writePinMessage(' test ');
		await expect(pinPage.messageCharCount).toHaveText('501 / 500');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Pinterest\']')).toBeVisible();
	});

	await test.step('Adjust text to match exact limit', async () => {
		await pinPage.removeCharacters(1);
		await expect(pinPage.messageCharCount).toHaveText('500 / 500');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Pinterest\']')).not.toBeVisible();
	});

});
