/* This test is to verify image and gif limitations for instagram story*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s image and gif limits for Instagram Story', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igs_ml_limit', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igs_ml_limit').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igs_ml_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select instagram account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(igbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Select instagram story from dropdown toggle', async () => {
		await expect(composePage.igToggleDropdown).toBeVisible();
		await composePage.igToggleDropdown.click();
		await expect(composePage.igStoryToggleDropdown).toBeVisible();
		await composePage.igStoryToggleDropdown.click();
	});

	await test.step('Select 2 images from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(2);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramStoryPreviewSingleImage).toBeVisible();
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first media file will be publishedThe Instagram direct publishing workflow only supports one media file per story. You can drag files to reorder them or remove extra files.');
	});

	await test.step('Remove one image and attach 1 giphy from media library', async () => {
		await composePage.imageRemoveButton.click();
		await page.waitForTimeout(1000);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.searchMediaLibrary('owl');
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramStoryPreviewSingleImage).toBeVisible();
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first media file will be publishedThe Instagram direct publishing workflow only supports one media file per story. You can drag files to reorder them or remove extra files.');
	});

	await test.step('Remove image and attach 1 more gif from media library', async () => {
		await composePage.imageRemoveButton.click();
		await page.waitForTimeout(1000);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramStoryPreviewSingleImage).toBeVisible();
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first media file will be publishedThe Instagram direct publishing workflow only supports one media file per story. You can drag files to reorder them or remove extra files.');
	});

});
