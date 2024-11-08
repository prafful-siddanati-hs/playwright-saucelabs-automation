//This test is to verify that the mention validations are working as expected for per network editing
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

test('Verify mention validations for facebook and twitter profiles', async ({ page }) => {
	const mentionsText = 'BrandonEats';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('per_network_mention', 'plan_create_facebookpage_mentions', true, 300);
		fbAccount = getObjectByName(global.fixture, 'per_network_mention').facebookPage.username;
		twAccount = getObjectByName(global.fixture, 'per_network_mention').twitter.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('per_network_mention');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage('@' + mentionsText);
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

	await test.step('Verify composer preview after selecting profiles', async () => {
		await composePage.verifyTwitterPreview(mentionsText);
		await composePage.verifyFacebookPreview(mentionsText);
	});

	await test.step('Verify unlink mention warning message for facebook', async () => {
		await expect(page.locator(('//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"]//p'))).toHaveText('You have an unlinked Facebook mention. Select the mention and then select a Page from the list.');
	});

	await test.step('Select twitter tab', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.verifyTwitterPreview(mentionsText);
	});

	await test.step('Select facebook tab and link mention', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookPreview(mentionsText);
		await composePage.messageArea.click();
		await composePage.selectMention(mentionsText);
		await composePage.verifyFacebookMentionPreview(mentionsText);
		await expect(composePage.messageAreaFBCompleteMention).toBeVisible(); // Verify mention is linked on message editor
	});

	await test.step('Again select twitter tab and verify still mention is plan text for twitter', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();

		const element = await page.$('.vk-ComposerModal .vk-TwitterPreview .vk-ContentBody p');

		const isLink = await element.evaluate(el => el.tagName === 'A');
		expect(isLink).toBe(false);
	});

	await test.step('Update twitter message and verify its preview', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.writeMessage(' update');
		await composePage.verifyTwitterPreview(' update');
	});

	await test.step('Again select facebook tab and verify there are no changes applied to facebook message', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyFacebookMentionPreview(mentionsText);
		await expect(composePage.messageAreaFBCompleteMention).toBeVisible(); // Verify mention is linked on message editor
	});
});
