/* This test is to verify mixed media limitations for instagram network*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let igbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s mixed media limits for Instagram', async ({page}) => {
	const mediaText = `${plan_create.getComposeMessage()} ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_mixed_limit', 'pro_user_composer', true, 300);
		igbAccount = getObjectByName(global.fixture, 'igb_mixed_limit').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_mixed_limit');
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

	await test.step('Write a message', async () => {
		await composePage.writeMessage(mediaText);
		await composePage.verifyInstagramPreview(mediaText);
	});

	await test.step('Upload 5 gif\'s and images from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(5);
		await composePage.selectGiphyInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(5);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramCarouselIndicators).toHaveCount(10);
	});

	await test.step('Attach 1 more giphy from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.instagramCarouselIndicators).toHaveCount(10);
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first 10 media files will be publishedInstagram supports 10 media files per post. You can drag files to reorder them or remove extra files.');
	});

});
