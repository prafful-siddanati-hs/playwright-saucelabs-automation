/* Test to verify that correct validations are displayed when large & mixed media files are uploaded to Tiktok */const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let tiktokProfile = 'testharp';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate uploaded media limitations for Tiktok', async ({page}) => {
	const composeText = `Tiktok media upload ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tiktok_media_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('tiktok_media_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select tiktok account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(tiktokProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTiktokPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyTiktokPreview(composeText);
	});

	await test.step('Verify error when image is uploaded', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.imagePublishLimit).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

	await test.step('Verify error when GIF is uploaded', async () => {
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await page.waitForTimeout(2000);
		await composePage.uploadMediaFile('test_data/publisher/giphy');
		await expect(composePage.imagePublishLimit).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

	await test.step('Verify there is no error when video is uploaded', async () => {
		let tiktokVideoFile = 'test_data/publisher/videos/tiktok_video.mp4';
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await composePage.uploadMediaFile('test_data/publisher/videos', tiktokVideoFile);
		await expect(composePage.tiktokVideoPreview).toBeVisible();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});
});
