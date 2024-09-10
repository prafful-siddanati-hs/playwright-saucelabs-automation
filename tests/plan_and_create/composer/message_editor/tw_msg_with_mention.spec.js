const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { getObjectByName } = require('../../../../globals');
const assert = require('assert');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify twitter message with mentions', async ({ page }) => {
	const mentionsText = '@mentionTest ';
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & account', async () => {
		await addFixture.command('tw_mention', 'pro_user_composer', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('tw_mention');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select twitter account from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(getObjectByName(global.fixture, 'tw_mention').twitter.username);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyTwitterPreview).toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(mentionsText);
		await composePage.verifyTwitterPreview(mentionsText);
		await expect(composePage.mentionsList).not.toBeVisible();
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

});
