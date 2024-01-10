const { test, expect} = require('@playwright/test');
const getFixture = require('../../custom-commands/getFixture');
const tearDown = require('../../custom-commands/tearDown');
const createOrg = require('../../custom-commands/createOrg');
const addSocialToOrg = require('../../custom-commands/addSocialToOrg');
const { LoginPage } = require("../../pages/login");
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Send now message using composer', async ({ page }) => {
    let orgName = 'send_now_image_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Publish New Compose Message! ${Date.now()}`;
    const addFixture = new getFixture();
    const createNewOrg = new createOrg();
    const addSocialNetwork = new addSocialToOrg();
    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);
    await addFixture.command('pw_send_now', 'enterprise', false, 300);
    await addFixture.command('twitter_send','twitter', false, 300);
    await createNewOrg.command(orgName);
    await addSocialNetwork.command('twitter_send');

    await loginPage.signInSkipOnboarding('pw_send_now');
    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'twitter_send').username);
    await composePage.writeMessage(composeText);
    await composePage.uploadFile('tests/composer/owly-snowboard.jpg');
    await composePage.verifyTwitterImagePreview();
    await composePage.verifyTwitterPreview(composeText);
    await composePage.sendNow();
});
