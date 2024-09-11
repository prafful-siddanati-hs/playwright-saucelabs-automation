/* Test to verify character limit validation is checked when mentions are added at the end of text */
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName, plan_create } = require('../../../../globals');

let twProfile, liProfile;

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify character limit validation is checked when mentions are added at the end of text', async ({ page }) => {
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const twMessageToLimit = plan_create.generateRandomMessage('Test twitter character limit of 280 characters including a mention 😀 ', 275);
	const liMessageToLimit = plan_create.generateRandomMessage('Test linkedin character limit of 3000 characters including a mention 😀 ', 2995);

	await test.step('Setup user & account', async () => {
		await addFixture.command('mention_char_limit', 'pro_user_composer', true, 300);
		twProfile = getObjectByName(global.fixture, 'mention_char_limit').twitter.username;
		liProfile = getObjectByName(global.fixture, 'mention_char_limit').linkedinProfile.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('mention_char_limit');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select all account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(twProfile);
		await composePage.selectSocialProfile(liProfile);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(composePage.emptyLinkedInPreview).toBeVisible();
	});

	await test.step('Verify character limit validation for linkedin with mention', async () => {
		await expect(composePage.linkedInTab).toBeVisible();
		await composePage.linkedInTab.click();
		await composePage.messageArea.fill(`${liMessageToLimit} @${plan_create.getLinkedinMention()}`);
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'LinkedIn\']')).toBeVisible();
	});

	await test.step('Verify character limit validation for twitter with mention', async () => {
		await expect(composePage.twitterTab).toBeVisible();
		await composePage.twitterTab.click();
		await composePage.messageArea.fill(`${twMessageToLimit} @${plan_create.getTwitterMentions()}`);
		await expect(page.locator('//*[(@role="alert")]//*[text()="Your text exceeds the character limit for "]/following-sibling::span[text()=\'Twitter\']')).toBeVisible();
	});
});
