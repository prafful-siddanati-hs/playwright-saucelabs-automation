/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to Instagram business - story & post*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let igbAccount;
const INSTAGTRAM_POST_MAX_MEDIA_LIMIT_INFO = 'Instagram supports 10 media files per post. You can drag files to reorder them or remove extra files.';
const INSTAGTRAM_STORY_MAX_MEDIA_LIMIT_INFO = 'Instagram supports 10 media files per story. You can drag files to reorder them or remove extra files.';
const IG_STORY_DIRECT_PUBLISHING_INFO = 'The Instagram direct publishing workflow only supports one media file per story. You can drag files to reorder them or remove extra files.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for Instagram business', async ({page}) => {
	const mediaText = `IG Post & Story media upload ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_media_upload', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igb_media_upload').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_media_upload');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select instagram account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyInstagramPreview(mediaText);
	});

	await test.step('Upload a GIF of size greater than 8 MB and verify the error', async () => {
		let largeGiphy = 'test_data/publisher/giphy/starsLargeGIF.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy/', largeGiphy);
		await expect(composePage.instagramPreviewSingleImage, 'Instagram post preview is updated with image').toBeVisible();
		await expect(composePage.instagramPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeInstagram posts supports images up to 8 MB. Your file is 13.1 MB.');
	});

	await test.step('Verify story with direct publishing also shows an error', async () => {
		await expect(composePage.igToggleDropdown).toBeVisible();
		await composePage.igToggleDropdown.click();
		await expect(composePage.igStoryToggleDropdown).toBeVisible();
		await composePage.igStoryToggleDropdown.click();
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeInstagram posts supports images up to 8 MB. Your file is 13.1 MB.');
	});

	await test.step('Verify mobile publishing does not show GIF size error', async () => {
		await expect(composePage.instagramDualSwitch).toBeVisible();
		await composePage.instagramDualSwitch.click();
		await expect(composePage.closeMobileSetUpPopUp).toBeVisible();
		await composePage.closeMobileSetUpPopUp.click();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Upload GIF of size less than 8 MB and verify no error', async () => {
		let giphyFile = 'test_data/publisher/giphy/OrbitAnimation.gif';
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await composePage.uploadMediaFile('test_data/publisher/giphy/', giphyFile);
		await expect(composePage.instagramStoryPreviewSingleImage, 'Instagram story preview is updated with image').toBeVisible();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Upload more than 10 media files and verify the info banners', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images','', 8);
		await composePage.uploadMediaFile('test_data/publisher/giphy','', 2);
		await expect(page.getByText(INSTAGTRAM_STORY_MAX_MEDIA_LIMIT_INFO)).toBeVisible();
	});

	await test.step('Remove 1 media file', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(page.getByText(INSTAGTRAM_STORY_MAX_MEDIA_LIMIT_INFO)).not.toBeVisible();
	});

	await test.step('Verify story direct publishing limitation info', async () => {
		await expect(composePage.instagramDualSwitch).toBeVisible();
		await composePage.instagramDualSwitch.click();
		await expect(page.getByText(IG_STORY_DIRECT_PUBLISHING_INFO)).toBeVisible();
	});

	await test.step('Switch back to instagram post type', async () => {
		await expect(composePage.igToggleDropdown).toBeVisible();
		await composePage.igToggleDropdown.click();
		await expect(composePage.igPostToggleDropdown).toBeVisible();
		await composePage.igPostToggleDropdown.click();
		await expect(composePage.instagramCarouselIndicators).toHaveCount(10);
	});

	await test.step('Upload 1 more image to verify post media limit info', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(page.getByText(INSTAGTRAM_POST_MAX_MEDIA_LIMIT_INFO)).toBeVisible();
		await expect(page.getByText(IG_STORY_DIRECT_PUBLISHING_INFO)).not.toBeVisible();
	});
});
