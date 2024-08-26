/* Test to send IG first comments when multiple SN are selected */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const getFixture = require('../../../../custom-commands/getFixture');
let liAccount, igbAccount, fbpAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send IG first comment with multiple social networks', async ({ page }) => {
	const sendText = 'Multiple SN with IG comment ' + Math.floor(Math.random() * 1000);
	const firstCommentText = 'Comment only for IG #igFirstComment';

	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('igb_first_comment_multi_sn', 'pro_user_composer', true, 300);
		liAccount = getObjectByName(global.fixture, 'igb_first_comment_multi_sn').linkedinProfile.username;
		igbAccount = getObjectByName(global.fixture, 'igb_first_comment_multi_sn').instagramBusiness.username;
		fbpAccount = getObjectByName(global.fixture, 'igb_first_comment_multi_sn').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('igb_first_comment_multi_sn');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select instagram and linkedin accounts from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(liAccount);
		await composePage.selectSocialProfile(igbAccount);
		await composePage.selectSocialProfile(fbpAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible({timeout: 5000});
		await expect(composePage.emptyInstagramPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message and verify each SN preview', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyInstagramPreview(sendText);
		await composePage.verifyLinkedInPreview(sendText);
		await composePage.verifyFacebookPreview(sendText);
	});

	await test.step('Upload media to the post', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images');
		await expect(composePage.mediaOverLay).toBeVisible();
	});

	await test.step('Verify first comment is not present for Facebook', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await expect(composePage.firstCommentHeader).not.toBeVisible();
	});

	await test.step('Verify first comment is not present for LinkedIn', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await expect(composePage.firstCommentHeader).not.toBeVisible();
	});

	await test.step('Verify first comment is present for Instagram', async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await expect(composePage.firstCommentHeader).toBeVisible();
	});

	await test.step('Add first comment', async () => {
		await expect(composePage.firstCommentSubHeader).toBeVisible();
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
