/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to twitter */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let twitterAccount;
const REPLACEMENT_MODAL_HEADER = 'Select the media you want to add';
const TWITTER_MIXED_MEDIA_INFO = 'Tweets can\'t include different media types. You can attach images or a video.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for twitter', async ({page}) => {
	const mediaText = `${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tw_media_upload', 'pro_user_composer', true, 300);
		twitterAccount = getObjectByName(global.fixture, 'tw_media_upload').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('tw_media_upload');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twitterAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyTwitterPreview(mediaText);
	});

	await test.step('Upload a mix of image and giphy file and verify the error', async () => {
		let giphyFile = 'test_data/publisher/giphy/stay_cool.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy', giphyFile);
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.mediaReplacementModal).toBeVisible();
		await expect(page.getByRole('heading', { name: REPLACEMENT_MODAL_HEADER })).toBeVisible();
		await expect(page.getByText(TWITTER_MIXED_MEDIA_INFO)).toBeVisible();
		await expect(composePage.mediaReplacementModalCancelButton).toBeVisible();
		await composePage.mediaReplacementModalCancelButton.click();
	});

	await test.step('Uploda a GIF of size more than 5MB and verify the error message', async () => {
		let largeGiphy = 'test_data/publisher/giphy/OrbitAnimation.gif';
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewSingleImage).not.toBeVisible();
		await composePage.uploadMediaFile('test_data/publisher/giphy/', largeGiphy);
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with image').toBeVisible();
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeTwitter supports images up to 5 MB. Your file is 7.2 MB.');
	});

	await test.step('Remove attached giphy file', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.twitterPreviewSingleImage).not.toBeVisible();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Verify there is no error when image of size more than 5MB is uploaded', async () => {
		let largeImage = 'test_data/publisher/images/LargeLandscape.jpg';
		await composePage.uploadMediaFile('test_data/publisher/images/', largeImage);
		await expect(composePage.twitterPreviewSingleImage, 'Twitter preview is updated with image').toBeVisible();
		await expect(composePage.twitterPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});
});
