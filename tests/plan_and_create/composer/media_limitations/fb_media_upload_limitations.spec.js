/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to Facebook */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for facebook page', async ({page}) => {
	const mediaText = `No limit FB media upload ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('fb_media_limit', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'fb_media_limit').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('fb_media_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyFacebookPreview(mediaText);
	});

	await test.step('Upload a GIF of size greater than 8 MB and verify the error', async () => {
		let largeGiphy = 'test_data/publisher/giphy/starsLargeGIF.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy/', largeGiphy);
		await expect(composePage.facebookPreviewSingleImage, 'Facebook preview is updated with image').toBeVisible();
		await expect(composePage.facebookPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeFacebook Page supports images up to 8 MB. Your file is 13.1 MB.');
	});

	await test.step('Remove attached giphy file', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.facebookPreviewSingleImage).not.toBeVisible();
	});

	await test.step('Upload more than 20 images and verify the no errors/info banners are displayed', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images','', 25);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
		await expect(page.getByText('+21'), '25 media items attached').toBeVisible();
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(4);
	});

	await test.step('Upload a few giphy files and verify there is no errors/info banners', async () => {
		let giphyFile = 'test_data/publisher/giphy/OrbitAnimation.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy/', giphyFile, 3);
		await expect(page.getByText('+24'), '28 media items attached').toBeVisible();
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(4);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});
});
