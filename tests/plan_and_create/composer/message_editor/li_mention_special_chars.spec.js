//This test is to verify adding mention with special characters to linkedin  message
const { test, expect } = require('@playwright/test');
const getFixture = require('../../../../custom-commands/getFixture');
const tearDown = require('../../../../custom-commands/tearDown');
const { LoginPage } = require('../../../../pages/login');
const { ComposePage } = require('../../../../pages/planandcreate/compose');
const { plan_create} = require('../../../../globals');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Verify adding text with mention using special characters to linkedin message', async ({ page }) => {
	const messageText = `Li Mention with special characters ${plan_create.getRandomUrl()} `;
	const liMention = plan_create.getRandomLIMention();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const liAccount = 'Nima Taheri';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('li_mention_special', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('li_mention_special');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select linkedin page from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(liAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(page.locator('.vk-ComposerModal .vk-LinkedInPreview')).toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(`${messageText}@${liMention} `);
		await composePage.verifyLinkedInPreview(`${messageText}@${liMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(liMention);
	});

	await test.step('Verify linkedIn mention in preview', async () => {
		await composePage.verifyLinkedInMentionPreview(liMention);
	});

});
