const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");
const {SetUpAndLoginAsEnterpriseUser} = require("../setUpAndLoginAsEnterpriseUser");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Send now message using composer', async ({ page }) => {
    let orgName = 'send_now_image_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    let accounts = new Map();
    accounts.set("twitter", 'twitter_send_image');

    const userLogin = new SetUpAndLoginAsEnterpriseUser();
    const composePage = new ComposePage(page);

    await userLogin.setUpAndLoginAsEnterpriseUser(orgName, page, 'pw_send_now_image', accounts);


    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'twitter_send_image').username);
    await composePage.writeMessage(composeText);
    await composePage.uploadFile('tests/composer/owly-snowboard.jpg');
    await composePage.verifyTwitterImagePreview();
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});
