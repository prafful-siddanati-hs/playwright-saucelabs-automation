/* Test to validate and send post with video to Twitter & Facebook */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const getFixture = require('../../../../custom-commands/getFixture');
const { LoginPage } = require('../../../../pages/login');
const { getObjectByName, plan_create } = require('../../../../globals');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
let fbAccount, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send twitter and facebook post with video', async ({ page }) => {
	const composeBasicText = `Send video ${plan_create.getComposeMessage().concat(' ' + Math.floor(Math.random() * 1000))}`;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('send_video', 'pro_user_composer', true, 300);
		twAccount = getObjectByName(global.fixture, 'send_video').twitter.username;
		fbAccount = getObjectByName(global.fixture, 'send_video').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('send_video');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & twitter account', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message', async () => {
		await composePage.writeMessage(composeBasicText);
		await composePage.verifyTwitterPreview(composeBasicText);
		await composePage.verifyFacebookPreview(composeBasicText);
	});

	await test.step('Upload a video', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos', 'test_data/publisher/videos/video.mp4', 1);
		await expect(composePage.twitterVideoPreviewSelector).toBeVisible();
		await expect(composePage.facebookVideoPreviewSelector).toBeVisible();
	});

	await test.step('Send the messages to twitter and facebook with video', async () => {
		await composePage.sendNow();
	});
});
