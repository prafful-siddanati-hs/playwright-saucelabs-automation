/* This test is to verify giphy limitations for LinkedIn network*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let liAccount;
const LI_MEDIA_WARNING = 'warningThe first 20 images will be publishedLinkedIn supports 20 images per post. You can drag files to reorder them or remove extra files.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s GIF limits for Linkedin', async ({page}) => {
	const mediaText = `Media warning test ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_gif_limit', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'li_gif_limit').linkedinProfile.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('li_gif_limit');
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

	await test.step('Upload 20 gif\'s from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(20);
		await composePage.closeMediaLibrary();
		await expect(composePage.linkedInPreviewMediaContainer).toHaveCount(5);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Attach 1 more giphy from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.linkedInPreviewMediaContainer).toHaveCount(5);
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first 20 images will be publishedLinkedIn supports 20 images per post. You can drag files to reorder them or remove extra files.');
	});

	await test.step('Attach 5 more images from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(5);
		await composePage.closeMediaLibrary();
		await expect(composePage.linkedInPreviewMediaContainer).toHaveCount(5);
		await composePage.verifyInstagramMediaWarningMessage(LI_MEDIA_WARNING);
	});

});
