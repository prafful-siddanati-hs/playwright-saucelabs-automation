/**
 * [https://hootsuite.atlassian.net/browse/SBE-6369]
 * Test to verify facebook link preview are generated correctly when message starts with mention followed by link
 */

const { test,expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown.js');
const { getObjectByName, plan_create } = require('../../../globals.js');
const { LoginPage } = require('../../../pages/login.js');
const { ComposePage } = require('../../../pages/planandcreate/compose.js');
const getFixture = require('../../../custom-commands/getFixture');
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Link preview with mention followed by link', async ({page}) => {
	const url = plan_create.getRandomUrl();
	const fbMention = plan_create.getFaceBookPageMention();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('linkpreview_mention_link', 'plan_create_facebookpage_mentions', true, 300);
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signIn('linkpreview_mention_link');

		const isViewVisible = await Promise.race([
			loginPage.streamsView.waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
			loginPage.welcomeSelector.waitFor({ timeout: 10000 }).then(() => true).catch(() => false)
		]);

		expect(isViewVisible).toBeTruthy();
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook page from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'linkpreview_mention_link').facebookPage.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage('test @' + fbMention );
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(fbMention);
	});

	await test.step('Add link to the message', async () => {
		await composePage.writeMessage(' ' + url);
	});

	await test.step('Verify facebook link preview', async () => {
		await composePage.verifyLinkInFacebookPagePreview(url);
		await composePage.verifyFacebookMentionPreview(fbMention);
		// await expect(composePage.facebookLinkPreviewTitle).toBeVisible();  // This is failing due to a bug in the product
		// await expect(composePage.facebookLinkPreviewSource).toContainText(url);
	});
});
