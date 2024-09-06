/* Test to verify the boundary conditions of maximum character limits allowed for a twitter post */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');

let twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify composer message editor for twitter\'s 280 characters limit', async ({ page }) => {
	const twMsg = `Test twitter character limit of 280 characters including a hashtag${plan_create.getRandomHashTag()} and url that takes up 24 characters`;
	const msgWithInTheLimit = `${plan_create.getRandomUrl()} `.concat(plan_create.generateRandomMessage(twMsg,251));
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tw_char_limit', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'tw_char_limit').twitter.username;
	});

	await test.step('Login as test user', async () => {
		await loginPage.signInAsProUser('tw_char_limit');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-TwitterPreview')).toBeVisible();
	});

	await test.step('Write a message that is within the allowed limit', async () => {
		const message = await composePage.messageArea.innerText();
		await composePage.writeMessage(msgWithInTheLimit);
		await page.waitForTimeout(500);
		await composePage.verifyTwitterPreview(message);
	});

	await test.step('Verify the character count', async () => {
		await expect(composePage.messageCharCount).toHaveText('275 / 280');
	});

	await test.step('Add a few characters to exceed the limit', async () => {
		await composePage.writeMessage(' extra');
		await expect(composePage.messageCharCount).toHaveText('281 / 280');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).toBeVisible();
	});

	await test.step('Adjust text to match exact limit', async () => {
		await composePage.removeCharacters(1);
		await expect(composePage.messageCharCount).toHaveText('280 / 280');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).not.toBeVisible();
	});

	await test.step('Verify character count is not affected when image is uploaded', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.twitterSingleImagePreview).toBeVisible();
		await expect(composePage.messageCharCount).toHaveText('280 / 280');
	});
});
