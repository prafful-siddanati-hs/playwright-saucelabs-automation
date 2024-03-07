const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {ComposePage} = require('../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../globals');
const {LoginPage} = require('../../../pages/login');
const getFixture = require('../../../custom-commands/getFixture');
let profile;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send instagram reel message using composer', async ({ page }) => {
	const sendText = 'Send IGB' + ' ' + Math.floor(Math.random() * 1000);

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('Igb_reel_send', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'Igb_reel_send').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('Igb_reel_send');
		await expect(page.getByRole('heading', { name: 'Welcome back,' })).toBeVisible();
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select IGB account from social network picker', async () => {
		await composePage.selectSocialProfile(profile);
		await composePage.verifySocialProfileSelected(profile);
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyInstagramPreview(sendText);
	});

	await test.step('Upload video file', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos');
	});

	await test.step('Verify video and text preview', async () => {
		await composePage.verifyInstagramReelVideoPreview();
		await composePage.verifyInstagramReelPreview(sendText);
	});

	await test.step('Send message to IGB as reel', async () => {
		await composePage.sendNow();
	});

});
