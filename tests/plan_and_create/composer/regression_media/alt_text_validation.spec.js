/* Test to verify that video files do not support alt-text */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that video files do not support alt-text', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('alt_text_validation', 'pro_user_composer', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('alt_text_validation');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Upload a video file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos', 'test_data/publisher/videos/video_1.mp4');
		await expect(composePage.genericVideoPreview).toBeVisible();
		await page.getByLabel('video_1.mp4').click();
	});

	await test.step('Verify alt-text option is not present for video file', async () => {
		await expect(composePage.editVideoButton).toBeVisible();
		await expect(composePage.altTextButton).not.toBeVisible();
		await expect(composePage.editImageButton).not.toBeVisible();
	});

	await test.step('Remove & upload an image file', async () => {
		await expect(composePage.videoRemoveButton).toBeVisible();
		await composePage.videoRemoveButton.click();
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Art.png');
		await composePage.verifyGenericImagePreview();
	});

	await test.step('Verify alt-text option is present for image file', async () => {
		await page.getByLabel('Art.png').click();
		await expect(composePage.editImageButton).toBeVisible();
		await expect(composePage.altTextButton).toBeVisible();
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step('Upload a GIF file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/giphy', 'test_data/publisher/giphy/giphy_1.gif');
		await composePage.verifyGenericImagePreview();
		await page.getByLabel('giphy_1.gif').click();
	});

	await test.step('Verify alt-text option is present for GIF', async () => {
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).toHaveCount(2);
		await expect(composePage.editVideoButton).not.toBeVisible();
	});
});
