/**
 * [https://hootsuite.atlassian.net/browse/SBE-5657]
 * Test to verify link previews are generated correctly when the link contains a space.
 */
const { test,expect } = require('@playwright/test');
const { SetUpEnterpriseUser } = require('../../../../custom-commands/setUpEnterpriseUser.js');
const tearDown = require('../../../../custom-commands/tearDown.js');
const { getObjectByName, plan_create } = require('../../../../globals.js');
const { LoginPage } = require('../../../../pages/login.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
let twAccount, fbAccount;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Link preview with space', async ({page}) => {
	let orgName = 'pw_spaced_linkPreview_' + Math.floor(Math.random() * 10000);
	const spaces_url = plan_create.getRandomUrlWithSpaces();
	const messageWithLinks = `Link with spaces ${spaces_url}  `;
	const setUpEnterpriseUser = new SetUpEnterpriseUser();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	let accounts = {
		plan_create_facebookpage: [],
		twitter: []
	};
	accounts.plan_create_facebookpage.push('fb_spaced_url');
	accounts.twitter.push('tw_space_url');

	await test.step('Setup user & accounts', async () => {
		await setUpEnterpriseUser.setUpEnterpriseUser(orgName, 'pw_linkPreview_with_space', accounts);
		twAccount = getObjectByName(global.fixture, 'tw_space_url').username;
		fbAccount = getObjectByName(global.fixture, 'fb_spaced_url').username;
	});

	await test.step('Login as enterprise user', async () => {
		await loginPage.signInSkipOnboarding('pw_linkPreview_with_space');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook & twitter from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twAccount);
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message with link', async () => {
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await composePage.writeMessage(messageWithLinks);
		await expect(composePage.genericFacebookLinkPreviewMedia).toBeVisible();
		await expect(composePage.genericTwitterLinkPreviewMedia).toBeVisible();
	});

	await test.step('Verify facebook link preview', async () => {
		await expect(composePage.facebookPageTab).toBeVisible();
		await composePage.facebookPageTab.click();
		await composePage.verifyLinkInFacebookPagePreview(spaces_url);
		await expect(composePage.facebookLinkPreviewTitle).toBeVisible();
		await expect(composePage.facebookLinkPreviewSource).toHaveText(spaces_url);
	});

	await test.step('Verify twitter link preview', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await expect(composePage.twitterLinkPreviewCustomizationInfo).toBeVisible();
		await composePage.verifyLinkInTwitterPreview(spaces_url);
		await expect(composePage.twitterLinkPreviewTitle).toBeVisible();
		await expect(composePage.twitterLinkPreviewSource).toHaveText(spaces_url);
	});
});
