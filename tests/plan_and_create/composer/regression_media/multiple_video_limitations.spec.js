/* This test is to verify multiple video limitation for twitter, linkedin and tiktok*/
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

test('Verify multiple video limitation for twitter, linkedin and tiktok', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('video_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('video_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter, linkedin and tiktok accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile('BridgeWang4');
		await composePage.searchSocialProfile('nimataheri89');
		await composePage.searchSocialProfile('Nima Taheri');
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyTiktokPreview).toBeVisible();
	});

	await test.step('Upload video file', async () => {
		await page.setInputFiles('.vk-MediaUpload input[type="file"]', 'test_data/publisher/videos/video_3.mp4');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Upload another video file', async () => {
		await page.setInputFiles('.vk-MediaUpload input[type="file"]', 'test_data/publisher/videos/video_1.mp4');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Verify its preview', async () => {
		await expect(composePage.twitterPreviewSingleVideo).toBeVisible();
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[1]')).toHaveText('errorToo many videos addedTwitter supports up to 1 video(s) per post. You\'ve added 2.');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[2]')).toHaveText('errorToo many videos addedTikTok Business supports up to 1 video(s) per post. You\'ve added 2.');
	});

	await test.step('Go to linkedin tab and verify its preview', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await expect(page.locator('//*[@aria-labelledby="message-tab-bar-linkedIn"]//*[@role="alert"]')).toHaveText('warningOnly the first video will be publishedLinkedIn supports one video per post. You can drag files to reorder them or remove extra files.');
	});

});
