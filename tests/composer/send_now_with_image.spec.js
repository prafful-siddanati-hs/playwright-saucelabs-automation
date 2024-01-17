const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");
const {SetUpEnterpriseUser} = require("../../custom-commands/setUpEnterpriseUser");
const {LoginPage} = require("../../pages/login");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Send now message using composer', async ({ page }) => {
    let orgName = 'send_now_image_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    let accounts = {
        twitter: []
    };
    accounts.twitter.push("twitter_send_image"); //Push no.of Twitter accounts to enterprise user

    const loginPage = new LoginPage(page);
    const userSetUp = new SetUpEnterpriseUser();
    const composePage = new ComposePage(page);

    await userSetUp.setUpEnterpriseUser(orgName,'pw_send_now_image', accounts);
    await loginPage.signInSkipOnboarding('pw_send_now_image');

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.twitter}`).username);
    await composePage.writeMessage(composeText);
    await composePage.uploadFile('test_data/publisher/images/owly-snowboard.jpg');
    await composePage.verifyTwitterImagePreview();
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});
