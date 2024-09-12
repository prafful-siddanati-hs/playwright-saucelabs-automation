/* Test to verify the preview when multiplt links, hashtags & mentions are included in a message text for different networks */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');

let twProfile, fbProfile, liProfile, igProfile;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify preview with a combination of multiple links, hashtags & mentions across all networks', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	const multiLinksMsg = `Text with multiple links ${plan_create.getRandomUrl()}, ${plan_create.getRandomUrlWithSpaces()}, educative.io ${Date.now()}`;
	const linksHashtagMsg = `Text with links ${plan_create.getRandomUrl()}, hashtag ${plan_create.getRandomHashTag()} & another link ${plan_create.getRandomUrlWithSpaces()} ${Date.now()}`;
	const linksHashtagMentionMsg = `Text with links ${plan_create.getRandomUrl()}, hashtag ${plan_create.getRandomHashTag()} ${Date.now()} & a mention @talkwalker`;

	await test.step('Setup user & account', async () => {
		await addFixture.command('multi_link_hashtag_mentions', 'pro_user_composer', true, 300);
		twProfile = getObjectByName(global.fixture, 'multi_link_hashtag_mentions').twitter.username;
		fbProfile = getObjectByName(global.fixture, 'multi_link_hashtag_mentions').facebookPage.username;
		liProfile = getObjectByName(global.fixture, 'multi_link_hashtag_mentions').linkedinProfile.username;
		igProfile = getObjectByName(global.fixture, 'multi_link_hashtag_mentions').instagramBusiness.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('multi_link_hashtag_mentions');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select all account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twProfile);
		await composePage.selectSocialProfile(fbProfile);
		await composePage.selectSocialProfile(liProfile);
		await composePage.selectSocialProfile(igProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message with multiple links', async () => {
		await composePage.writeMessage(multiLinksMsg);
		await composePage.verifyTwitterPreview(multiLinksMsg);
		await composePage.verifyLinkedInPreview(multiLinksMsg);
		await composePage.verifyFacebookPreview(multiLinksMsg);
		await composePage.verifyInstagramPreview(multiLinksMsg);
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).not.toBeVisible();
		await composePage.clearMessageEditor();
	});

	await test.step('Verify preview with text containing multiple links & hashtags', async () => {
		await composePage.writeMessage(linksHashtagMsg);
		await composePage.verifyTwitterPreview(linksHashtagMsg);
		await composePage.verifyLinkedInPreview(linksHashtagMsg);
		await composePage.verifyFacebookPreview(linksHashtagMsg);
		await composePage.verifyInstagramPreview(linksHashtagMsg);
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'LinkedIn\']')).not.toBeVisible();
		await composePage.clearMessageEditor();
	});

	await test.step('Verify preview with text containing multiple links, hashtags & mentions', async () => {
		await page.waitForTimeout(500);
		await composePage.writeMessage(linksHashtagMentionMsg);
		await composePage.verifyTwitterPreview(linksHashtagMentionMsg);
		await composePage.verifyInstagramPreview(linksHashtagMentionMsg);
		await composePage.verifyLinkedInPreview(linksHashtagMentionMsg);
		await composePage.verifyFacebookPreview(linksHashtagMentionMsg);
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Instagram\']')).not.toBeVisible();
	});
});
