/* This test is to verify image limitations for Tiktok network*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let tiktokProfile = 'nimataheri89';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s media limits for Tiktok', async ({page}) => {
	const composeText = `test threads ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tk_media_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('tk_media_limit');
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

	await test.step('Attach 1 images from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.imagePublishLimit).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

	await test.step('Attach 1 more gif from media library and verify tiktok preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.imagePublishLimit).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

	await test.step('Removed attached image and verify tiktok preview', async () => {
		await composePage.imageRemoveButton.first().click();
		await expect(composePage.imagePublishLimit).toHaveText('errorThis file type isn\'t supported by TikTok BusinessYou can only publish videos to TikTok Business.');
	});

});
