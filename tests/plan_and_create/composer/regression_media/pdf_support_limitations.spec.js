/* This test is to verify PDF validations for all networks */
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

test('Verify PDF validations for all networks', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('pdf_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('pdf_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter, facebook, instagram, threads and tiktok accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile('Da Clerb');
		await composePage.searchSocialProfile('BridgeWang4');
		await composePage.searchSocialProfile('anotherowlmail');
		await composePage.searchSocialProfile('freshestdonut');
		await composePage.searchSocialProfile('nimataheri89');
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
		await expect(composePage.emptyTiktokPreview).toBeVisible();
	});

	await test.step('Upload 1 PDF file via media upload and verify its preview', async () => {
		await composePage.uploadMediaFile('test_data/publisher/pdfs');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[1]')).toHaveText('errorThis file type isn\'t supported for Facebook Page postsUpload an image or video instead');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[2]')).toHaveText('errorThis file type isn\'t supported for TweetsUpload an image or video instead');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[3]')).toHaveText('errorThis file type isn\'t supported for Instagram Business postsUpload an image or video instead');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[4]')).toHaveText('errorThis file type isn\'t supported for Threads postsUpload an image or video instead');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"])[5]')).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

});
