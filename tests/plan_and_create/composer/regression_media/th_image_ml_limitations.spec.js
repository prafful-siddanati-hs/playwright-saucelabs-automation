/* This test is to verify image limitations for Threads network*/
const {test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let thAccount = 'freshestdonut';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Validate the media library\'s image limits for Threads', async ({page}) => {
	const composeText = `test threads ${Math.floor(Math.random() * 100)}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('th_img_limit', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('th_img_limit');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select threads account social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(thAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyThreadsPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeText);
		await composePage.verifyThreadsPreview(composeText);
	});

	await test.step('Upload 10 images from media library and verify its preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.selectFreeImagesInMediaLibrary();
		await composePage.attachImageFromMediaLibrary(10);
		await composePage.closeMediaLibrary();
		await expect(composePage.threadsmCarouselIndicators).toHaveCount(10);
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Attach 1 more image from media library', async () => {
		await composePage.openMediaLibrary();
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await expect(composePage.threadsmCarouselIndicators).toHaveCount(10);
		await expect(composePage.imagePublishLimit).toHaveText('warningThe first 10 media files will be publishedThreads supports 10 media files per post. You can drag files to reorder them or remove extra files.');
	});

});
