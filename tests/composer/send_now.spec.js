const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");
const {SetUpEnterpriseUser} = require("../../custom-commands/setUpEnterpriseUser")
const {LoginPage} = require("../../pages/login");

/** @type {import('@playwright/test').Page} */
let page;
test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
});

test.afterAll(async () => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Send now message using composer', async ({}) => {
    let orgName = 'send_now_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    let accounts = {
        twitter: []
    };
    accounts.twitter.push("twitter_send"); //Push no.of Twitter accounts to enterprise user

    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);
    const userSetUp = new SetUpEnterpriseUser();

    await userSetUp.setUpEnterpriseUser(orgName, 'pw_send_now', accounts);
    await loginPage.signInSkipOnboarding('pw_send_now');

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.twitter}`).username);
    await composePage.writeMessage(composeText);
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});

test('Send now message with image using composer', async ({}) => {
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    const composePage = new ComposePage(page);

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'twitter_send').username);
    await composePage.writeMessage(composeText);
    await composePage.uploadFile('test_data/publisher/images/owly-snowboard.jpg');
    await composePage.verifyTwitterImagePreview();
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});

