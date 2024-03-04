const { test, expect} = require('@playwright/test');
const tearDown = require('../../../custom-commands/tearDown');
const {ComposePage} = require('../../../pages/planandcreate/compose');
const {getObjectByName} = require('../../../globals');
const {SetUpEnterpriseUser} = require('../../../custom-commands/setUpEnterpriseUser');
const {LoginPage} = require('../../../pages/login');

test.afterEach(async ({ page }) => {
	const cleanUp = new tearDown();

	await cleanUp.command();
	await page.close();
});

test('Send now message using composer', async ({page}) => {
	let orgName = 'send_now_org_' + Math.floor(Math.random() * 10000);
	const composeText = 'Send text '+ + Math.floor(Math.random() * 1000);

	let accounts = {
		twitter: []
	};
	accounts.twitter.push('twitter_send'); //Push no.of Twitter accounts to enterprise user

	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const userSetUp = new SetUpEnterpriseUser();

	await userSetUp.setUpEnterpriseUser(orgName, 'pw_send_now', accounts);
	await loginPage.signInSkipOnboarding('pw_send_now');

	await composePage.selectComposeButton();
	await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.twitter}`).username);
	await expect(page.locator('.vk-TwitterPreview .vk-Name')).toHaveCount(1);
	await composePage.writeMessage(composeText);
	await composePage.verifyTwitterPreview(composeText);
	await composePage.sendNow();
});
