const { test, expect } = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const getFixture = require('../../../custom-commands/getFixture');
const { LoginPage } = require('../../../pages/login');
const { getObjectByName, plan_create } = require('../../../globals');
const { ComposePage } = require('../../../pages/planandcreate/compose');
let fbAccount;

/* Test to verfy link previews on composer. */
test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test.skip('Verify link preview on composer', async ({ page }) => {
	const url = plan_create.getRandomUrl();
	const messageText = `Link previews ${url} ${Math.floor(Math.random() * 100)} `;
	const addFixture = new getFixture();
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);

	await test.step('Setup user & accounts', async () => {
		await addFixture.command('link_preview', 'pro_user_composer', true, 300);
		fbAccount = getObjectByName(global.fixture, 'link_preview').facebookPage.username;
	});

	await test.step('Login as pro user', async () => {
		await loginPage.signIn('link_preview');
	});

	await test.step('Select new compose button', async () => {
		await composePage.selectComposeButton();
	});

	await test.step('Select facebook from social network dropdown', async () => {
		await composePage.profileDropDown.click();
		await expect(composePage.snContentItems).toBeVisible();
		await composePage.selectSocialProfile(fbAccount);
		await composePage.postToWrapper.click();
		await expect(composePage.profileListItemTitle).not.toBeVisible();
	});

	await test.step('Write a message with link', async () => {
		await composePage.writeMessage(messageText);
	});

	await test.step('Verify facebook link preview', async () => {
		await composePage.verifyLinkInFacebookPagePreview(url);
		await expect(composePage.facebookLinkPreviewTitle).toBeVisible();
		await expect(composePage.facebookLinkPreviewSource).toContainText(url);
	});

	await test.step('Close composer', async () => {
		await composePage.closeComposer();
	});
});
