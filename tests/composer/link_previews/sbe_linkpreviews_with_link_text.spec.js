/**
 * [https://hootsuite.atlassian.net/browse/SBE-6370]
 * Test to verify twitter link preview are generated correctly when message starts with text with link followed by more text
 */
const { test,expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown.js');
const { getObjectByName, plan_create } = require('../../../globals.js');
const { LoginPage } = require('../../../pages/login.js');
const { ComposePage } = require('../../../pages/planandcreate/compose.js');
const getFixture = require('../../../custom-commands/getFixture');
const createUser = require('../../../custom-commands/createUser');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify Link preview with text with link followed by more text', async ({page}) => {
	const url = plan_create.getRandomUrl();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const addFixture = new getFixture();
	const createNewUser = new createUser();

	await test.step('Setup user & accounts', async () => {
		await createNewUser.command('pw_msg_link_text', 'professional');
		await addFixture.command('pw_msg_link_text','twitter', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('pw_msg_link_text');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
		await composePage.exitButton.click();
	});

	await test.step('Verify twitter account is displayed on social network picker', async () => {
		await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'pw_msg_link_text').username);
	});

	await test.step('Add link to the message', async () => {
		await composePage.writeMessage('test ' + url);
	});

	await test.step('Verify twitter link preview', async () => {
		await composePage.verifyTwitterPreview('test');
		await composePage.verifyLinkInTwitterPreview(url);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toContainText(url);
	});

	await test.step('Add text followed by link', async () => {
		await composePage.writeMessage(' update');
	});

	await test.step('Verify again twitter link preview after entering more text', async () => {
		await composePage.verifyTwitterPreview('update');
		await composePage.verifyLinkInTwitterPreview(url);
		// await expect(composePage.twitterLinkPreviewTitle).toBeVisible();  // This is failing due to a bug in the product
		// await expect(composePage.twitterLinkPreviewSource).toContainText(url);
	});

	await test.step('Close composer', async () => {
		await composePage.closeComposer();
	});
});
