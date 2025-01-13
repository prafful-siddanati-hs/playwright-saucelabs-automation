const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const createUser = require('../../../../custom-commands/createUser');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Edit image using composer', async ({ page }) => {
	const messageText = `Message within limit ${Math.floor(Math.random() * 100)} `;
	const addFixture = new getFixture();
	const createNewUser = new createUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await createNewUser.command('edit_image', 'professional');
		await addFixture.command('fb_edit_image','plan_create_facebookpage', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('edit_image');
	});

	await test.step('Click on new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify facebook account is displayed on social network picker', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'fb_edit_image').username);
	});

	await test.step('Upload an image to the message', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/owly-snowboard.jpg');
		await expect(composePage.facebookPreviewSingleImage).toBeVisible();
	});

	await test.step('Verify image is updated on preview', async () => {
		await expect(composePage.facebookPreviewSingleImage).toHaveCount(1);
	});

	await test.step('Select edit image option, edit image and save the changes', async () => {
		await page.click('.rc-Composer .vk-MediaAttachmentThumbnailCard .vk-EditImage', {
			force: true,  // Forces the click even if the element is hidden or disabled
		});

		await expect(composePage.imageOnImageEditor).toBeVisible();
		await expect(composePage.stickerCanvas).toBeVisible();
		await composePage.stickerCanvas.click();
		await expect(composePage.emoticonsButton).toBeVisible();
		await composePage.emoticonsButton.click();
		await composePage.emoticonOnStickerList.click();
		await expect(composePage.emoticonActions).toBeVisible();
		await composePage.saveButtonOnImageEditor.click();
	});

	await test.step('Type a message', async () => {
		await composePage.writeMessage(messageText);
	});

	await test.step('Verify the compose message and image are updated in the preview', async () => {
		await composePage.verifyFacebookPreview(messageText);
		await expect(composePage.facebookPreviewSingleImage).toBeVisible();
		await expect(composePage.facebookPreviewSingleImage).toHaveCount(1);
	});

	await test.step('Click Post Now button', async () => {
		await expect(composePage.postNowButton).toBeVisible();
		await composePage.postNowButton.click();
		await expect(composePage.composeScreen).not.toBeVisible();
		await page.waitForTimeout(1000);
	});
});
