//This test is to validate the twitter preview validations for media, text and link
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

test('Twitter preview validations for media, text and link settings', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const hashtag = 'test';

	await test.step('Setup user & twitter account', async () => {
		await addFixture.command('twitter_preview_media', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'twitter_preview_media').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('twitter_preview_media');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select twitter from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with image').toBeVisible();
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload giphy and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/giphy');
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with giphy').toBeVisible({timeout: 5000});
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload video and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos/');
		await expect(composePage.twitterPreviewSingleVideo, 'Twitter preview is updated with video').toBeVisible();
		await expect(composePage.videoRemoveButton).toBeVisible();
		await composePage.videoRemoveButton.click();
		await expect(composePage.twitterPreviewSingleVideo).not.toBeVisible();
	});

	await test.step('Attach image from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyTwitterImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewMediaContainer).not.toBeVisible();
	});

	await test.step('Attach gif from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyTwitterImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewMediaContainer).not.toBeVisible();
	});

	await test.step('Enter hashtag to compose message and verify its preview', async () => {
		await composePage.writeMessage(` #${hashtag}`);
		await composePage.verifyHashtagInTwitterPreview(hashtag);
	});

	await test.step('Enter mention to compose message and verify its preview', async () => {
		await composePage.writeMessage(' @mention');
		await composePage.verifyTwitterPreview('@mention');
	});

});
