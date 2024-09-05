//This test is to validate linkedin message char limit

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');

let liAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify the LinkedIn message character limit that are above and below the 3000-character threshold.', async ({ page }) => {
	const liMsg = `${plan_create.getRandomUrl()} ${plan_create.getRandomHashTag()} Hello, I am interested in connecting with you and learning more about your work. I see that we have similar interests in the industry and would love to discuss potential opportunities. Looking forward to your response and connecting with you. Thank you!`;
	const msgWithInTheLimit = plan_create.generateRandomMessage(liMsg,2995);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_msg_char_limit', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_msg_char_limit').linkedinProfile.username;
	});

	await test.step('Login as pro test user', async () => {
		await loginPage.signInAsProUser('li_msg_char_limit');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin account from profile picker', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible();
	});

	await test.step('Write a message and verify linkedin preview', async () => {
		await composePage.writeMessage(msgWithInTheLimit);
		await page.waitForTimeout(500);
		const message = await composePage.messageArea.innerText();
		await composePage.verifyLinkedInPreview(message);
	});

	await test.step('Verify the character limit', async () => {
		await expect(composePage.messageCharCount).toHaveText('2,995 / 3,000');
	});

	await test.step('Write a message which exactly matches the linkedin char limit', async () => {
		await composePage.writeMessage(' test');
		await composePage.verifyLinkedInPreview('test');
		await expect(composePage.messageCharCount).toHaveText('3,000 / 3,000');
	});

	await test.step('Update the message which exceeds the linkedin char limit', async () => {
		await composePage.writeMessage(' TEST');
		await composePage.verifyLinkedInPreview('TEST');
		await expect(composePage.messageCharCount).toHaveText('3,005 / 3,000');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'LinkedIn\']')).toBeVisible();
	});

	await test.step('Verify the character limit after deleting few characters', async () => {
		await composePage.removeCharacters(5);
		await expect(composePage.messageCharCount).toHaveText('3,000 / 3,000');
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'LinkedIn\']')).not.toBeVisible();
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.linkedInPreviewSingleImage, 'Linkedin preview is not updated with image').toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).toHaveAttribute('src', /staging/);
	});

});
