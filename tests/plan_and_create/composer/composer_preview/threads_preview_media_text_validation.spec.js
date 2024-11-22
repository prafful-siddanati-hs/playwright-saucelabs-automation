//This test is to validate the threads preview validations for media, text and link

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {plan_create} = require('../../../../globals');
let thAccount = 'freshestdonut';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Threads preview validations for media, text and link settings', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const hashtag = 'test';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pw_th_preview_media', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('pw_th_preview_media');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select threads account from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(thAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
	});

	await test.step('Write a message and verify threads preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyThreadsPreview(composeBasicText);
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.threadsPreviewSingleImage, 'Threads preview is updated with image').toBeVisible();
		await expect(composePage.threadsPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.threadsPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload giphy and verify its preview', async () => {
		let filePath = 'test_data/publisher/giphy/giphy_1.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy', filePath);
		await expect(composePage.threadsPreviewSingleImage, 'Threads preview is updated with giphy').toBeVisible();
		await expect(composePage.threadsPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.threadsPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload video and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos/');
		await expect(composePage.threadsPreviewSingleVideo, 'Threads preview is updated with video').toBeVisible();
		await expect(composePage.videoRemoveButton).toBeVisible();
		await composePage.videoRemoveButton.click();
		await expect(composePage.threadsPreviewSingleVideo).not.toBeVisible();
	});

	await test.step('Attach image from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyThreadsImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.threadsPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Attach gif from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.searchMediaLibrary('owl');
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyThreadsImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.threadsPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Enter hashtag to compose message and verify its preview', async () => {
		await composePage.writeMessage(` #${hashtag}`);
		await composePage.verifyThreadsPreview(hashtag);
	});

	await test.step('Enter mention to compose message and verify its preview', async () => {
		await composePage.writeMessage(' @mention');
		await composePage.verifyThreadsPreview('@mention');
	});

});
