/* Test to verify that instagram does not support alt-text for any media types */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let fbAccount, twAccount, liAccount, igAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify that instagram does not support alt-text for any media types', async ({page}) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('alt_text_sn_validation', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'alt_text_sn_validation').facebookPage.username;
		twAccount = getObjectByName(global.fixture, 'alt_text_sn_validation').twitter.username;
		liAccount = getObjectByName(global.fixture, 'alt_text_sn_validation').linkedinProfile.username;
		igAccount = getObjectByName(global.fixture, 'alt_text_sn_validation').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('alt_text_sn_validation');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select all social networks dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Upload an external image file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', 'test_data/publisher/images/Art.png');
	});

	await test.step('Verify alt-text option is present for uploaded image', async () => {
		await page.getByLabel('Art.png').hover();
		await expect(composePage.editImageButton).toBeVisible();
		await expect(composePage.altTextButton).toBeVisible();
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step('Upload an image from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
	});

	await test.step(`Verify alt-text option is present for ${fbAccount}`, async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(2);
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).toHaveCount(2);
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step(`Verify alt-text option is present for ${twAccount}`, async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await expect(composePage.twitterPreviewMediaContainer).toHaveCount(2);
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).toHaveCount(2);
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step(`Verify alt-text option is present for ${liAccount}`, async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await expect(composePage.linkedInPreviewMediaContainer).toHaveCount(2);
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).toHaveCount(2);
		await expect(composePage.editVideoButton).not.toBeVisible();
	});

	await test.step(`Verify alt-text option is not present for ${igAccount}`, async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await composePage.verifyInstagramImagePreview();
		await expect(composePage.editImageButton).toHaveCount(2);
		await expect(composePage.altTextButton).not.toBeVisible();
		await expect(composePage.editVideoButton).not.toBeVisible();
	});
});
