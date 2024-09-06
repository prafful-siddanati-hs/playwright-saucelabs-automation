//This test is to validate instagram message char limit
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');

let igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify the instagram message character limit that are above and below the 2,200-character threshold.', async ({ page }) => {
	const liMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} Hey everyone! 🌟 I’m doing a quick test to see how this message looks on Instagram. If you’re seeing this, it means I’m checking formatting, spacing, and all the little details to make sure everything looks great when I share my upcoming content. 📸✨`;
	const msgWithInTheLimit = plan_create.generateRandomMessage(liMsg,2195);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_msg_char_limit', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igb_msg_char_limit').instagramBusiness.username;
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('igb_msg_char_limit');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select instagram account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify instagram preview', async () => {
		await composePage.writeMessage(msgWithInTheLimit);
		await page.waitForTimeout(500);
		const message = await composePage.messageArea.innerText();
		await composePage.verifyInstagramPreview(message);
	});

	await test.step('Verify the character limit', async () => {
		await expect(composePage.messageCharCount.first()).toHaveText('2,195 / 2,200');
	});

	await test.step('Write a message which exactly matches the instagram char limit', async () => {
		await composePage.writeMessage(' test');
		await composePage.verifyInstagramPreview('test');
		await expect(composePage.messageCharCount).toHaveText('2,200 / 2,200');
	});

	await test.step('Update the message which exceeds the instagram char limit', async () => {
		await composePage.writeMessage(' TEST');
		await composePage.verifyInstagramPreview('TEST');
		await expect(composePage.messageCharCount).toHaveText('2,205 / 2,200');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Instagram\']')).toBeVisible();
	});

	await test.step('Verify the character limit after deleting few characters', async () => {
		await composePage.removeCharacters(5);
		await expect(composePage.messageCharCount).toHaveText('2,200 / 2,200');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Instagram\']')).not.toBeVisible();
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.instagramPreviewSingleImage, 'Instagram preview is not updated with image').toBeVisible();
	});

});
