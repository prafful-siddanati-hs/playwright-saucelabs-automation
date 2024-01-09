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

test('Schedule message using composer', async ({ page }) => {
    let orgName = 'send_now_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Schedule New Compose Message With Video! ${Date.now()}`;
    const addFixture = new getFixture();
    const createNewOrg = new createOrg();
    const addSocialNetwork = new addSocialToOrg();
    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);
    await addFixture.command('pw_schedule_video', 'enterprise', false, 300);
    await addFixture.command('twitter_schedule_video','twitter', false, 300);
    await createNewOrg.command(orgName);
    await addSocialNetwork.command('twitter_schedule_video');

    await loginPage.signInSkipOnboarding('pw_schedule_video');

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'twitter_schedule_video').username);
    await composePage.writeMessage(composeText);
    await composePage.verifyTwitterPreview(composeText);
    await composePage.uploadFile('tests/composer/video.mp4');
    await composePage.verifyTwitterVideoPreview();
    await composePage.selectMessageScheduleDate();
});
