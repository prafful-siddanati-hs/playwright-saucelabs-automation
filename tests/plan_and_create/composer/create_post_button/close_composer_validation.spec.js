const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
let twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Composer close button validations', async ({ page }) => {
	const composeBasicText = `${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('composer_basic', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'composer_basic').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('composer_basic');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
		await composePage.verifyComposerModal();
	});

	await test.step('Select twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Close composer after selecting twitter profile', async () => {
		await composePage.exitComposer();
		await expect(composePage.composeScreen).not.toBeVisible();
	});

	await test.step('Open composer again', async () => {
		await composePage.selectComposeButton();
		await composePage.verifyComposerModal();
	});

	await test.step('Select again twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
	});

	await test.step('Upload an image from media library and verify preview', async () => {
		await composePage.openMediaLibrary();
		await composePage.searchMediaLibrary(plan_create.mediaSearchTerms());
		await composePage.attachImageFromMediaLibrary(1);
		await composePage.closeMediaLibrary();
		await composePage.verifyTwitterImagePreview();
	});

	await test.step('close composer after entering text', async () => {
		await composePage.exitComposer();
	});

	await test.step('Verify save as draft pop up modal', async () => {
		await expect(composePage.saveDraftModalTitle).toHaveText('Save a draft?');
		await expect(composePage.discardPost).toBeVisible();
		await composePage.discardPost.click();
	});

	await test.step('Open composer again', async () => {
		await composePage.selectComposeButton();
		await composePage.verifyComposerModal();
	});

	await test.step('Select again twitter account for the last time', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
	});

	await test.step('Upload a video', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos', 'test_data/publisher/videos/video.mp4', 1);
		await expect(composePage.twitterVideoPreviewSelector).toBeVisible();
	});

	await test.step('close composer after uploading video', async () => {
		await composePage.exitComposer();
	});

	await test.step('Verify save as draft pop up modal for the last time', async () => {
		await expect(composePage.saveDraftModalTitle).toHaveText('Save a draft?');
		await expect(composePage.discardPost).toBeVisible();
		await composePage.discardPost.click();
	});
});
