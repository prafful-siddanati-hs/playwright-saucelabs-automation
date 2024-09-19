/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to Threads */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let thAccount = 'freshestdonut';
const THREADS_MAX_MEDIA_LIMIT_INFO = 'Threads supports 10 media files per post. You can drag files to reorder them or remove extra files.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for Threads', async ({page}) => {
	const composeText = `Threads media upload ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('th_media_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('th_media_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select threads account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(thAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyThreadsPreview(composeText);
	});

	await test.step('Upload a GIF of size greater than 8 MB and verify the error', async () => {
		let largeGiphy = 'test_data/publisher/giphy/starsLargeGIF.gif';
		await composePage.uploadMediaFile('test_data/publisher/giphy/', largeGiphy);
		await expect(composePage.threadsPreviewSingleImage, 'Threads preview is updated with image').toBeVisible();
		await expect(composePage.threadsPreviewSingleImage).toHaveAttribute('src', /staging/);
		await expect(composePage.imagePublishLimit).toHaveText('errorImage file size is too largeThreads supports images up to 8 MB. Your file is 13.1 MB.');
	});

	await test.step('Upload GIF of size less than 8 MB and verify no error', async () => {
		let giphyFile = 'test_data/publisher/giphy/OrbitAnimation.gif';
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await composePage.uploadMediaFile('test_data/publisher/giphy/', giphyFile);
		await expect(composePage.threadsPreviewSingleImage, 'Threads preview is updated with image').toBeVisible();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Upload more than 10 media files and verify the info banners', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images','', 8);
		await composePage.uploadMediaFile('test_data/publisher/giphy', '', 2);
		await expect(page.getByText(THREADS_MAX_MEDIA_LIMIT_INFO)).toBeVisible();
	});

	await test.step('Verify media limit info is not shown afer removing a media file', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await expect(page.getByText(THREADS_MAX_MEDIA_LIMIT_INFO)).not.toBeVisible();
	});
});
