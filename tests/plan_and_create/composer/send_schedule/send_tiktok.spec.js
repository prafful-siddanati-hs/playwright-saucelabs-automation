/* Test to validate and send a post to Tiktok */
const { test, expect} = require('@playwright/test');
const createUser = require('../../../../custom-commands/createUser');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { getObjectByName } = require('../../../../globals');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');

let titkokAccount;
const TIKTOK_UNSUPPORTED_FILE_TYPE_ERROR = 'This file type isn\'t supported by TikTok Business';
const TIKTOK_UNSUPPORTED_FILE_TYPE_INFO = 'You can only publish videos to TikTok Business.';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send a post to Tiktok', async ({ page }) => {
	const sendTiktokText = 'Want to create scroll-stopping content? Schedule it for the best time with @Hootsuite now! www.hootsuite.com #ContentCreation #Hootsuite 🚀';

	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createNewUser = new createUser();
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('postNow_tiktok', 'professional');
		await addFixture.command('postNow_tiktok','tiktok', true, 300);
		titkokAccount = getObjectByName(global.fixture, 'postNow_tiktok').socialProfile.username;
	});

	await test.step('Login as professional user', async () => {
		await loginPage.signInAsProUser('postNow_tiktok');
	});

	await test.step('Dismiss new user onboarding modals', async () => {
		await page.evaluate(() => {
			return (hs.memberExtras.hasSeenNewComposerOnboarding = true);
		});
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step(`Verify ${titkokAccount} is selected`, async () => {
		await composePage.verifySocialProfileSelected(titkokAccount);
	});

	await test.step('Write a message with hashtags & mentions', async () => {
		await composePage.messageArea.fill(sendTiktokText);
		await composePage.verifyTiktokPreview(sendTiktokText);
	});

	await test.step('Try to post it to Tiktok', async () => {
		await expect(composePage.postNowButton).toBeVisible();
		await composePage.postNowButton.click();
		await expect(composePage.tiktokMediaAreaErrorTitle).toBeVisible();
		await expect(composePage.tiktokMediaTextAreaErrorDescription).toBeVisible();
	});

	await test.step('Attach an image to the post', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(page.getByText(TIKTOK_UNSUPPORTED_FILE_TYPE_ERROR)).toBeVisible();
		await expect(page.getByText(TIKTOK_UNSUPPORTED_FILE_TYPE_INFO)).toBeVisible();
		await expect(composePage.imageRemoveButton).toBeVisible();
		await composePage.imageRemoveButton.click();
		await page.waitForTimeout(2000);
	});

	await test.step('Remove the image and attach a video', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos', 'test_data/publisher/videos/tiktok_video.mp4');
		await expect(composePage.tiktokVideoPreview).toBeVisible();
		await expect(composePage.imagePublishLimit).not.toBeVisible();
	});

	await test.step('Verify all tiktok parameters are visible', async () => {
		await expect(composePage.tiktokEngagementPanel).toBeVisible();
		await expect(page.locator('[data-testid="ds-visual-switch"]')).toHaveCount(3);
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
