/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to Linkedin */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let liAccount;
const LINKEDIN_MIXED_MEDIA_INFO = 'LinkedIn posts can\'t include different media types. You can attach images, a video, or a PDF';
const LINKEDIN_MAX_MEDIA_LIMIT_INFO = 'LinkedIn supports 20 images per post. You can drag files to reorder them or remove extra files.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for linkedin', async ({page}) => {
	const mediaText = `${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_media_upload', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_media_upload').linkedinProfile.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('li_media_upload');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyLinkedInPreview(mediaText);
	});

	await test.step('Uploda a GIF of size more than 5MB and verify the error message', async () => {
		let largeGiphy = 'test_data/publisher/giphy/OrbitAnimation.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy/', largeGiphy);
		await expect(composePage.mediaLoadingAnimation, { delay : 1000 }).not.toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage, 'LinkedIn preview is updated with image').toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeLinkedIn supports images up to 5 MB. Your file is 7.2 MB.');
	});

	await test.step('Remove attached giphy file', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.mediaDeleteAnimation).toBeVisible();
		await expect(composePage.linkedInPreviewSingleImage).not.toBeVisible();
		await expect(composePage.mediaDeleteAnimation).not.toBeVisible();
	});

	await test.step('Upload more than 20 images and verify the info banners', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images','', 21);
		await expect(composePage.mediaLoadingAnimation).not.toBeVisible();
		await expect(page.getByText(LINKEDIN_MAX_MEDIA_LIMIT_INFO)).toBeVisible();
	});

	await test.step('Remove 1 image and verify the info banner is not displayed', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.mediaDeleteAnimation).toBeVisible();
		await expect(page.getByText(LINKEDIN_MAX_MEDIA_LIMIT_INFO)).not.toBeVisible();
		await expect(composePage.mediaDeleteAnimation).not.toBeVisible();
	});

	await test.step('Verify mixed media does not show any error when gif file is attached', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(composePage.mediaDeleteAnimation).toBeVisible();
		await page.waitForTimeout(1000);
		await composePage.uploadMediaFile('test_data/publisher/giphy', 'test_data/publisher/giphy/stay_cool.gif');
		await expect(composePage.mediaLoadingAnimation).not.toBeVisible();
		await expect(page.getByText(LINKEDIN_MAX_MEDIA_LIMIT_INFO)).not.toBeVisible();
		await expect(page.getByText(LINKEDIN_MIXED_MEDIA_INFO)).not.toBeVisible();
	});
});
