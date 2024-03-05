const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require('../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../globals');
const {LoginPage} = require('../../pages/login');
const getFixture = require('../../custom-commands/getFixture');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send instagram reel message using composer', async ({ page }) => {
	const sendText = plan_create.getComposeMessage() + ' ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await addFixture.command('Igb_reel_send', 'pro_user_composer', true, 300);

	const profile = getObjectByName(global.fixture, 'Igb_reel_send').instagramBusiness.username;

	await loginPage.signIn('Igb_reel_send');
	await expect(page.getByRole('heading', { name: 'Welcome back,' })).toBeVisible();

	await composePage.selectComposeButton();
	await composePage.selectSocialProfile(profile);
	await composePage.verifySocialProfileSelected(profile);
	await composePage.writeMessage(sendText);
	await composePage.verifyInstagramPreview(sendText);
	await composePage.uploadFile('test_data/publisher/videos/video_2.mp4');
	await composePage.verifyInstagramReelVideoPreview();
	await composePage.verifyInstagramReelPreview(sendText);
	await composePage.sendNow();
});
