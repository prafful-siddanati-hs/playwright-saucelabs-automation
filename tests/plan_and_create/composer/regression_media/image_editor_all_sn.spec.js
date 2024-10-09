/* Test to verify image editor works for all networks */
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

test('Verify image editor functions for all networks', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('all_sn_image_editor', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('all_sn_image_editor');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select 4 different types of social networks', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile('DevtestCo'); // LinkedIn
		await composePage.searchSocialProfile('CharlesClassOwl'); //Twitter
		await composePage.searchSocialProfile('freshestdonut'); //Threads
		await composePage.searchSocialProfile('hoot_igb'); //Instagram
		await expect(composePage.postToWrapper).toBeVisible();
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Upload an external image file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Art.png');
	});

	await test.step('Verify edit image option is present for uploaded image', async () => {
		await page.getByLabel('Art.png').hover();
		await expect(composePage.editImageButton).toBeVisible();
		await expect(composePage.altTextButton).toBeVisible();
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step('Upload an image from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
	});

	await test.step('Verify edit image option is present for image from media library', async () => {
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).toHaveCount(2);
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step('Edit uploaded image from image editor', async () => {
		await page.getByLabel('Art.png').hover();
		await page.waitForTimeout(1000);
		await composePage.editImageButton.first().click();
		await expect(composePage.imageEditorCanvas).toBeVisible();
		await expect(composePage.imageEditorStickers).toBeVisible();
		await composePage.imageEditorStickers.click();
		await expect(composePage.emoticonStickers).toBeVisible();
		await composePage.emoticonStickers.click();
		await composePage.grinEmoticonSticker.click();
		await expect(composePage.imageEditorSaveButton).toBeVisible();
		await composePage.imageEditorSaveButton.click();
		await expect(composePage.imageEditorCanvas).not.toBeVisible();
	});

	await test.step('Edit image from media library', async () => {
		await composePage.mediaOverLay.last().hover();
		await page.waitForTimeout(1000);
		await composePage.editImageButton.last().click();
		await expect(composePage.imageEditorCanvas).toBeVisible();
		await expect(composePage.imageEditorStickers).toBeVisible();
		await composePage.imageEditorStickers.click();
		await expect(composePage.emoticonStickers).toBeVisible();
		await composePage.emoticonStickers.click();
		await composePage.grinEmoticonSticker.click();
		await expect(composePage.imageEditorSaveButton).toBeVisible();
		await composePage.imageEditorSaveButton.click();
		await expect(composePage.imageEditorCanvas).not.toBeVisible();
	});
});
