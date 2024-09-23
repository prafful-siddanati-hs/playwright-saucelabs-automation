/* Test to verify mixed media limitations for facebook network */
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s mixed media limits for Facebook', async ({page}) => {
	const mediaText = `Mixed media from ML  ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('fb_mixed_media_limit', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'fb_mixed_media_limit').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('fb_mixed_media_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyFacebookPreview(mediaText);
	});

	await test.step('Upload more than 20 images from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(21);
		await composePage.closeMediaLibrary();
		await expect(page.getByText('+17'), '17 media items attached').toBeVisible();
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(4);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Upload a few giphy files and verify there is no errors/info banners', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(5);
		await composePage.closeMediaLibrary();
		await expect(page.getByText('+22'), '26 media items attached').toBeVisible();
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(4);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});
});
