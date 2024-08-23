/* Test to send an Instagram post with first comments */

const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
let profile;
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send instagram message with first comment', async ({ page }) => {
	const sendText = 'Send IGB with comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'This is the first comment #igFirstComment';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_first_comment_send', 'pro_user_composer', true, 300);
		profile = getObjectByName(global.fixture, 'igb_first_comment_send').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_first_comment_send');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select IGB account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(profile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message and verify its preview', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyInstagramPreview(sendText);
	});

	await test.step('Upload media to the post', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Add first comment', async () => {
		await expect(composePage.firstCommentHeader).toBeVisible();
		await composePage.firstCommentTextArea.click();
		await composePage.firstCommentTextArea.type(firstCommentText);
	});

	await test.step('Verify first comment in preview', async () => {
		await composePage.verifyInstagramFirstCommentPreview(firstCommentText);
	});

	await test.step('Send message to instagram with first comment', async () => {
		await composePage.sendNow();
	});
});
