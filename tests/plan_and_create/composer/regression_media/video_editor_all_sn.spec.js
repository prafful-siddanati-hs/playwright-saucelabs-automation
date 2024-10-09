/* Test to verify video editor works for all networks */
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

test('Verify video editor functions for all networks', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('all_sn_video_editor', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('all_sn_video_editor');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select 4 different types of social networks', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile('DevtestCo'); // LinkedIn
		await composePage.searchSocialProfile('freshestdonut'); // Threads
		await composePage.searchSocialProfile('hoot_igb'); // Instagram
		await composePage.searchSocialProfile('nimataheri89'); // Tiktok
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyTiktokPreview).toBeVisible();
	});

	await test.step('Upload a video file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos', 'test_data/publisher/videos/tiktok_video.mp4');
		await expect(composePage.linkedInCompanyPreviewSingleVideo).toBeVisible();
		await expect(composePage.instagramReelPreviewSingleVideo).toBeVisible();
		await expect(composePage.threadsPreviewSingleVideo).toBeVisible();
		await expect(composePage.tiktokVideoPreview).toBeVisible();
	});

	await test.step('Verify edit video option is present', async () => {
		await page.getByLabel('tiktok_video.mp4').hover();
		await page.waitForTimeout(1000);
		await expect(composePage.editImageButton).not.toBeVisible();
		await expect(composePage.altTextButton).not.toBeVisible();
		await expect(composePage.videoSettingsButton).toBeVisible();
		await expect(composePage.editVideoButton).toBeVisible();
		await composePage.editVideoButton.click();
	});

	await test.step('Edit uploaded video from video editor', async () => {
		let videoSticker = page.getByLabel('imgly_sticker_emoticons_alien');
		await expect(composePage.videoEditorCanvas).toBeVisible();
		await expect(composePage.videoEditorStickers).toBeVisible();
		await composePage.videoEditorStickers.click();
		await expect(videoSticker).toBeVisible();
		await videoSticker.click();
		await expect(composePage.imageEditorSaveButton).toBeVisible();
		await composePage.imageEditorSaveButton.click();
		await expect(composePage.videoEditorCanvas).not.toBeVisible();
	});
});
