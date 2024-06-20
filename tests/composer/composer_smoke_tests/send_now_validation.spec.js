const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');

const SOCIAL_NETWORK_ERROR_TITLE = 'Oops! You forgot to select a social account';
const SOCIAL_NETWORK_ERROR_DESCRIPTION = 'Please choose one or more social accounts to publish to';
const TEXT_AREA_ERROR_TITLE = 'Oops! You haven\'t added any text';
const TEXT_AREA_ERROR_DESCRIPTION = 'Twitter requires text to be included';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send now validations', async ({ page }) => {
	const composeBasicText = 'Send ' + Math.floor(Math.random() * 10000);
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('send_validation', 'pro_user_composer', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('send_validation');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
		await page.waitForTimeout(1000);
	});

	await test.step('Click Post Now button', async () => {
		await expect(composePage.postNowButton).toBeVisible();
		await composePage.postNowButton.click();
	});

	await test.step('Verify select a social network error', async () => {
		await expect(page.getByRole('heading', { name: SOCIAL_NETWORK_ERROR_TITLE })).toBeVisible();
		await expect(page.getByText(SOCIAL_NETWORK_ERROR_DESCRIPTION)).toBeVisible();
	});

	await test.step('Select twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'send_validation').twitter.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Click Post Now button again', async () => {
		await composePage.postNowButton.click();
	});

	await test.step('Verify empty text error', async () => {
		await expect(composePage.composeTextAreaErrorTitle).toContainText(TEXT_AREA_ERROR_TITLE);
		await expect(composePage.composeTextAreaErrorDescription).toContainText(TEXT_AREA_ERROR_DESCRIPTION);
	});

	await test.step('Upload invalid video file', async () => {
		await page.setInputFiles('.vk-MediaUpload input[type="file"]', 'test_data/publisher/videos/invalid_twitter_video.mp4');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Verify invalid video error', async () => {
		await expect(composePage.mediaFirstError).toBeVisible();
		await expect(composePage.mediaSecondError).toBeVisible();
	});

	await test.step('Remove video from message', async () => {
		await composePage.videoRemoveButton.click();
		await expect(composePage.mediaOverLay).not.toBeVisible();
	});

	await test.step('Write a message and verify twitter preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
	});

	await test.step('Click Post Now button for the last time', async () => {
		await composePage.postNowButton.click();
	});

});
