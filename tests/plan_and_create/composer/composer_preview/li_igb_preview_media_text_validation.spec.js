//This test is to validate the LinkedIn and instagram preview validations for media, text and link

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const getFixture = require('../../../../custom-commands/getFixture');
const {getObjectByName, plan_create} = require('../../../../globals');
let liAccount, igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Linkedin and instagram preview validations for media, text and link settings', async ({ page }) => {
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const hashtag = 'preview';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_igb_preview_media', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_igb_preview_media').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'li_igb_preview_media').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('li_igb_preview_media');
	});

	await test.step('Open composer from global navigator', async () => {
		await composePage.selectComposeButton();
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
	});

	await test.step('Select instagram and linkedin accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible({timeout: 5000});
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify instagram and linkedin preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyInstagramPreview(composeBasicText);
		await composePage.verifyLinkedInPreview(composeBasicText);
	});

	await test.step('Enter hashtag to compose message and verify its preview', async () => {
		await composePage.writeMessage(` #${hashtag}`);
		await composePage.verifyInstagramHashtagPreview(hashtag);
		await composePage.verifyLinkedInHashtagPreview(hashtag);
	});

	await test.step('Enter mention to compose message and verify its preview', async () => {
		await composePage.writeMessage(' @mention');
		await composePage.verifyInstagramPreview('@mention');
		await composePage.verifyLinkedInPreview('@mention');
	});

	await test.step('Upload single image and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.linkedInPreviewSingleImage, 'Linkedin preview is updated with image').toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.instagramPreviewSingleImage, 'Instagram preview is updated with image').toBeVisible();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.linkedInPreviewSingleImage).not.toBeVisible();
		await expect(composePage.instagramPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload giphy and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/giphy');
		await expect(composePage.linkedInPreviewSingleImage, 'Linkedin preview is updated with giphy').toBeVisible({timeout: 5000});
		await expect(composePage.linkedInPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.instagramPreviewSingleImage, 'Instagram preview is updated with image').toBeVisible();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.linkedInPreviewSingleImage).not.toBeVisible();
		await expect(composePage.instagramPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload video and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos/');
		await page.waitForTimeout(1000);
		await expect(composePage.linkedInPreviewSingleVideo, 'Linkedin preview is updated with video').toBeVisible();
		await expect(composePage.instagramReelPreviewSingleVideo, 'Instagram preview is updated with video').toBeVisible();
		await expect(composePage.videoRemoveButton).toBeVisible();
		await composePage.videoRemoveButton.click();
		await expect(composePage.linkedInPreviewSingleVideo).not.toBeVisible();
		await expect(composePage.instagramReelPreviewSingleVideo).not.toBeVisible();
	});

	await test.step('Attach image from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyLinkedInImagePreview();
		await composePage.verifyInstagramImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.instagramPreviewSingleImage).not.toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Attach gif from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyLinkedInImagePreview();
		await composePage.verifyInstagramImagePreview();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.linkedInPreviewSingleImage).not.toBeVisible();
		await expect(composePage.instagramPreviewSingleImage).not.toBeVisible();
	});

});
