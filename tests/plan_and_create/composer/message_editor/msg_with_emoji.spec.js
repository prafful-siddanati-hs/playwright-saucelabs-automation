//This test is to verify adding emojis to messages across all networks
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create} = require('../../../../globals');
const assert = require('assert');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that emojis from the emoji picker are added to messages across all networks', async ({ page }) => {
	const emojiText = `Emoji test ${plan_create.getRandomEmoji()} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('emoji_picker', 'pro_user_composer', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('emoji_picker');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select all accounts from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'emoji_picker').twitter.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'emoji_picker').facebookPage.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'emoji_picker').linkedinProfile.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'emoji_picker').instagramBusiness.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message with emoji', async () => {
		await composePage.writeMessage(emojiText);
		await composePage.verifyTwitterPreview(emojiText);
		await composePage.verifyFacebookPreview(emojiText);
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody p')).toContainText(emojiText);
		await composePage.verifyInstagramPreview(emojiText);
	});

	await test.step('Add emoji from emoji picker', async () => {
		await composePage.selectEmojiButton();
		await expect(composePage.firstEmojiFromList).toBeVisible();
		await composePage.firstEmojiFromList.click();
		await composePage.selectCloseEmojiPicker();
		const message = await composePage.messageArea.innerText(); // Get the message text after adding emoji
		await composePage.verifyTwitterPreview(message);
		await composePage.verifyFacebookPreview(message);
		await composePage.verifyLinkedInPreview(message);
		await composePage.verifyInstagramPreview(message);
	});

});
