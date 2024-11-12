/* Test to validate and send post with text, links & multiple images to Twitter & Facebook */
const { test, expect} = require('@playwright/test');
const tearDown = require('../../../../custom-commands/tearDown');
const {ComposePage} = require('../../../../pages/planandcreate/compose');
const {getObjectByName, plan_create} = require('../../../../globals');
const {LoginPage} = require('../../../../pages/login');
const createUser = require('../../../../custom-commands/createUser');
const addUserToOrg = require('../../../../custom-commands/addUserToOrg');
const {SetUpEnterpriseUser} = require('../../../../custom-commands/setUpEnterpriseUser');
const modifySocialProfilePermissions = require('../../../../custom-commands/modifySocialProfilePermissions');

const SHORTENER = 'https://ow.ly';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send twitter and facebook post with text, multiple images and one time approver', async ({ page }) => {
	let orgName = 'Send_Flex_' + Math.floor(Math.random() * 10000);
	const sendText = `Post now tw & fb with multiple images & ${plan_create.getRandomUrl()} ` + Math.floor(Math.random() * 1000);
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const createNewUser = new createUser();
	const addUserToNewOrg = new addUserToOrg();
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const updateSNPermissions = new modifySocialProfilePermissions();

	let accounts = {
		twitter: [],
		plan_create_facebookpage: []
	};

	accounts.twitter.push('pw_tw');
	accounts.plan_create_facebookpage.push('pw_fb');

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'tw_fb_send_multiple_images', accounts);
		await createNewUser.command('pw_limited_user');
		await addUserToNewOrg.command('pw_limited_user', orgName);
		await updateSNPermissions.command('SN_LIMITED', 'pw_tw', 'pw_limited_user');
		await updateSNPermissions.command('SN_LIMITED', 'pw_fb', 'pw_limited_user');
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInSkipOnboarding('tw_fb_send_multiple_images');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter and facebook from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, `${accounts.twitter}`).username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, `${accounts.plan_create_facebookpage}`).username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Select twitter tab and upload 2 images to twitter', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.uploadMediaFile('test_data/publisher/images', '', 2);
	});

	await test.step('Write a message and verify preview & validation', async () => {
		await composePage.writeMessage(sendText);
		await composePage.verifyTwitterPreview(sendText);
		await expect(composePage.twitterPreviewMediaContainer).toHaveCount(2);
	});

	await test.step('Shorten the link and verify the preview', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkInTwitterPreview(SHORTENER);
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Select facebook tab and add only text to facebook', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.writeMessage(sendText);
		await composePage.verifyFacebookPreview(sendText);
	});

	await test.step('Upload 2 images to facebook', async () => {
		await composePage.uploadMediaFile('test_data/publisher/images', '', 2);
		await expect(composePage.facebookPreviewMediaContainer).toHaveCount(2);
	});

	await test.step('Shorten the link and verify preview for instagram', async () => {
		await composePage.selectShortenWithOwlyButton();
		await composePage.verifyLinkInFacebookPagePreview(SHORTENER);
		await expect(composePage.clearOwlyShorteningButton).toBeVisible();
	});

	await test.step('Select one time approver', async () => {
		await composePage.selectOneTimeApprover('pw_limited_user');
	});

	await test.step('Send the post', async () => {
		await composePage.sendNow();
	});
});
