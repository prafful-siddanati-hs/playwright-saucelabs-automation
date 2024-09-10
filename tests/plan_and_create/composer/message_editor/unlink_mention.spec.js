//This test is to verify that the mention is unlinked within the message across all networks
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName} = require('../../../../globals');
const assert = require('assert');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify unlink mention within the message across all networks', async ({ page }) => {
	const mentionsText = '@mentionTest';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('unlink_mention', 'pro_user_composer', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('unlink_mention');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select all account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'unlink_mention').twitter.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'unlink_mention').facebookPage.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'unlink_mention').linkedinProfile.username);
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'unlink_mention').instagramBusiness.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
		await expect(composePage.emptyInstagramPreview).toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(mentionsText);
		await composePage.verifyTwitterPreview(mentionsText);
		await composePage.verifyLinkedInPreview(mentionsText);
		await composePage.verifyFacebookPreview(mentionsText);
		await composePage.verifyInstagramPreview(mentionsText);
	});

	await test.step('Verify unlink mention warning message for facebook, instagram and linkedin', async () => {
		await expect(page.locator(('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"]//p)[1]//span//span[1]'))).toHaveText('You have unlinked mentions in your content tabs for ');
		await expect(page.locator(('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"]//p)[1]//span//span[2]'))).toHaveText('LinkedIn and Facebook');
		await expect(page.locator(('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"]//p)[1]//span//span[3]'))).toHaveText('. Select a network tab, select a mention, and then select a Page from the list.');
		await expect(page.locator('(//*[@aria-labelledby="message-tab-bar-content"]//*[@role="alert"]//p)[2]')).toHaveText('Instagram mentions will be linked when the post is published to Instagram.');
	});

	await test.step('Verify twitter mention in preview as plain text', async () => {
		const element = await page.$('.vk-ComposerModal .vk-TwitterPreview .vk-ContentBody p');

		const isBold = await element.evaluate(el => window.getComputedStyle(el).fontWeight === 'bold');
		expect(isBold).toBe(false);

		const isLink = await element.evaluate(el => el.tagName === 'A');
		expect(isLink).toBe(false);

		const color = await element.evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue('color');
		});

		const expectedColor = 'rgb(36, 31, 33)';

		assert.strictEqual(color, expectedColor, `Expected color to be ${expectedColor}, but got ${color}`);
	});

	await test.step('Verify facebook mention in preview as plain text', async () => {
		const element = await page.$('.vk-ComposerModal .vk-FacebookPreview .vk-ContentBody p');

		const isBold = await element.evaluate(el => window.getComputedStyle(el).fontWeight === 'bold');
		expect(isBold).toBe(false);

		const isLink = await element.evaluate(el => el.tagName === 'A');
		expect(isLink).toBe(false);

		const color = await element.evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue('color');
		});

		const expectedColor = 'rgb(36, 31, 33)';

		assert.strictEqual(color, expectedColor, `Expected color to be ${expectedColor}, but got ${color}`);
	});

	await test.step('Verify instagram mention in preview as plain text', async () => {
		const element = await page.$('.vk-ComposerModal .vk-InstagramPreview .vk-ContentBody p');

		const isBold = await element.evaluate(el => window.getComputedStyle(el).fontWeight === 'bold');
		expect(isBold).toBe(false);

		const isLink = await element.evaluate(el => el.tagName === 'A');
		expect(isLink).toBe(false);

		const color = await element.evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue('color');
		});

		const expectedColor = 'rgb(36, 31, 33)';

		assert.strictEqual(color, expectedColor, `Expected color to be ${expectedColor}, but got ${color}`);
	});

	await test.step('Verify linkedin mention in preview as plain text', async () => {
		const element = await page.$('.vk-ComposerModal .vk-LinkedInPreview .vk-ContentBody p');

		const isBold = await element.evaluate(el => window.getComputedStyle(el).fontWeight === 'bold');
		expect(isBold).toBe(false);

		const isLink = await element.evaluate(el => el.tagName === 'A');
		expect(isLink).toBe(false);

		const color = await element.evaluate((el) => {
			return window.getComputedStyle(el).getPropertyValue('color');
		});

		const expectedColor = 'rgb(36, 31, 33)';

		assert.strictEqual(color, expectedColor, `Expected color to be ${expectedColor}, but got ${color}`);
	});

});
