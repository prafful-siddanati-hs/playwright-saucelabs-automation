const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");
const {SetUpAndLoginAsEnterpriseUser} = require("../setUpAndLoginAsEnterpriseUser")

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Send now message using composer', async ({ page }) => {
    let orgName = 'send_now_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    let accounts = new Map();
    accounts.set("twitter", 'twitter_send');
    const composePage = new ComposePage(page);
    const userLogin = new SetUpAndLoginAsEnterpriseUser();

    await userLogin.setUpAndLoginAsEnterpriseUser(orgName, page, 'pw_send_now', accounts);
    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.get("twitter")}`).username);
    await composePage.writeMessage(composeText);
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});
