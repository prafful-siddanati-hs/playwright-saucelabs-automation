const { test } = require('@playwright/test');
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

test('Send now message with image using composer', async ({page}) => {
	const composeText = 'Send Image '+ + Math.floor(Math.random() * 1000);
	let orgName = 'send_now_org_image' + Math.floor(Math.random() * 10000);
	let accounts = {
		plan_create_facebookpage: []
	};
	accounts.plan_create_facebookpage.push('fb_send_image'); //Push no.of Twitter accounts to enterprise user
	const loginPage = new LoginPage(page);
	const composePage = new ComposePage(page);
	const userSetUp = new SetUpEnterpriseUser();

	await userSetUp.setUpEnterpriseUser(orgName, 'pw_send_now_image', accounts);
	await loginPage.signInSkipOnboarding('pw_send_now_image');
	await composePage.selectComposeButton();
	await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'fb_send_image').username);
	await composePage.writeMessage(composeText);
	await composePage.uploadMediaFile('test_data/publisher/images');
	await composePage.verifyFacebookImagePreview();
	await composePage.verifyFacebookPreview(composeText);
	await composePage.sendNow();
});
