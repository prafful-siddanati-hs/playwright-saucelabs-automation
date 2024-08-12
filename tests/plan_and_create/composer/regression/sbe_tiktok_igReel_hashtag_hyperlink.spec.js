/**
 * [https://hootsuite.atlassian.net/browse/SBE-6261]
 * Test to check that Tiktok & IB Reels hashtags are hyperlinked correctly.
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../../../pages/login.js');
const { ComposePage } = require('../../../../pages/planandcreate/compose.js');
const getFixture = require('../../../../custom-commands/getFixture.js');
const tearDown = require('../../../../custom-commands/tearDown.js');
let tiktokProfile = 'plancreate01';
let igReelProfile = 'hoot_igb';

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Tiktok & IG Reels hashtags are hyperlinked', async ({ page }) => {
	const hashtag = 'lululemon';
	const messageWithHashtags = `Tiktok & IG Reels hashtags hyperlinked #${hashtag} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('tiktok_igReel_hashtag_hyperlink', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('tiktok_igReel_hashtag_hyperlink');
	});

	await test.step('Open composer', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Verify generic preview base layout on composer', async () => {
		await expect(composePage.genericPreviewText).toBeVisible();
	});

	await test.step('Select Tiktok & IG Reels networks', async () => {
		await composePage.profileDropDown.hover();
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(tiktokProfile);
		await composePage.selectSocialProfile(igReelProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message hashtag', async () => {
		await composePage.writeMessage(messageWithHashtags);
	});

	await test.step('Upload a video', async () => {
		await composePage.uploadMediaFile('test_data/publisher/videos');
	});

	await test.step('Verify Tiktok hasgtag is hyperlnked', async () => {
		await expect(composePage.tiktokTab).toBeVisible();
		await composePage.tiktokTab.click();
		await composePage.verifyTiktokHashtagPreview(hashtag);
	});

	await test.step('Verify IG Reels hashtag is hyperlinked', async () => {
		await expect(composePage.instagramTab).toBeVisible();
		await composePage.instagramTab.click();
		await composePage.verifyInstagramHashtagPreview(hashtag);
	});
});
