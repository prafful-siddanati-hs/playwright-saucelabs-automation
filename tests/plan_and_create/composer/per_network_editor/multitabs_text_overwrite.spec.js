//This test is to verify overwrite the message across all networks
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName} = require('../../../../globals');
let fbAccount, twAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify message overwrite the initial content to all accounts', async ({ page }) => {
	const fbText = 'FB message';
	const twText = 'TW message';
	const initialPost = 'Original message';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('msg_overwrite', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'msg_overwrite').facebookPage.username;
		twAccount = getObjectByName(global.fixture, 'msg_overwrite').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('msg_overwrite');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter and facebook accounts from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Go to facebook tab and write a message', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.writeMessage(fbText);
		await composePage.verifyFacebookPreview(fbText);
	});

	await test.step('Go to twitter tab and write a message', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.writeMessage(twText);
		await composePage.verifyTwitterPreview(twText);
	});

	await test.step('Go to your post tab and write a message', async () => {
		await expect(composePage.yourPostTab).toBeVisible();
		await composePage.yourPostTab.click();
		await composePage.writeMessage(initialPost);
		await composePage.verifyTwitterPreview(twText);
		await composePage.verifyFacebookPreview(fbText);
	});

	await test.step('Go back to facebook tab and overwrite message with your post tab', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(fbText);
		await expect(composePage.restoreOriginalPost).toBeVisible();
		await composePage.restoreOriginalPost.click();
		await expect(composePage.messageArea).toHaveText(initialPost);
		await composePage.verifyFacebookPreview(initialPost);
	});

	await test.step('Go back to twitter tab and overwrite message with your post tab', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(twText);
		await expect(composePage.restoreOriginalPost).toBeVisible();
		await composePage.restoreOriginalPost.click();
		await expect(composePage.messageArea).toHaveText(initialPost);
		await composePage.verifyTwitterPreview(initialPost);
	});

});
