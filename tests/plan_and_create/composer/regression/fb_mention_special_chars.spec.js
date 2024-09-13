//This test is to verify adding mention with special characters to facebook message
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

test('Verify adding text with mention using special characters to facebook message', async ({ page }) => {
	const composeText = `Mention with special characters ${plan_create.getRandomUrl()} `;
	const fbMention = plan_create.getFaceBookPageMention();
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const fbAccount = 'HS FB Page';

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('mention_special', 'linkedin_enterprise', true, 300);
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signInAsProUser('mention_special');
	});

	await test.step('Select compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook page from social network picker', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.searchSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
		await expect(composePage.emptyFacebookPreview).toBeVisible();
	});

	await test.step('Write a message with mention', async () => {
		await composePage.writeMessage(`${composeText}@${fbMention} `);
		await composePage.verifyFacebookPreview(`${composeText}@${fbMention}`);
	});

	await test.step('Select and link the mention', async () => {
		await composePage.selectMention(fbMention);
	});

	await test.step('Verify facebook mention in preview', async () => {
		await composePage.verifyFacebookMentionPreview(fbMention);
	});

});
