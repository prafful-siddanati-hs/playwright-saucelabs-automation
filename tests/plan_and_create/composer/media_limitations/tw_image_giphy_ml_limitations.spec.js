/* This test is to verify image and giphy limitations for twitter network*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
let twitterAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s image and GIF limits for Twitter', async ({page}) => {
	const mediaText = `${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('img_gif_limit', 'pro_user_composer', true, 300);
		twitterAccount = getObjectByName(global.fixture, 'img_gif_limit').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('img_gif_limit');
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

	await test.step('Upload more than one giphy from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(2);
		await expect(composePage.twitterPreviewMediaContainer).toBeHidden(2);
		await expect(composePage.imagePublishLimit).toHaveText('errorOops! It seems like you got a bit carried away with GIFsTwitter has a limit of one animated image per tweet.');
	});

	await test.step('Remove attached 1 giphy and attach 1 image from media library', async () => {
		await page.locator('(//*[contains(@class, "vk-ComposerModal")]//*[contains(@class, "imageThumbnail")]//*[contains(@class, "vk-MediaThumbnailDelete")])[1]').click();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await expect(composePage.twitterPreviewMediaContainer).toBeHidden(2);
		await expect(composePage.imagePublishLimit).toHaveText('errorYou can\'t add a GIF and other image typesTwitter only supports attaching a GIF or still images, not both.');
	});

	await test.step('Remove attached giphy and attach 3 more images from media library', async () => {
		await page.locator('(//*[contains(@class, "vk-ComposerModal")]//*[contains(@class, "imageThumbnail")]//*[contains(@class, "vk-MediaThumbnailDelete")])[1]').click();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
		await composePage.attachImageFromMediaLibrary(3);
		await expect(composePage.twitterPreviewMediaContainer).toBeHidden(4);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Attach one more image from media library and verify twitter image limitation error', async () => {
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.twitterPreviewMediaContainer).toHaveCount(4);
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first 4 images will be publishedTwitter supports 4 images per post. You can drag files to reorder them or remove extra files.');
	});

});
