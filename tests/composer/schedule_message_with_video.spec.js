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

test('Schedule message with video using composer', async ({ page }) => {
    let orgName = 'schedule_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Schedule New Compose Message With Video! ${Date.now()}`;
    let accounts = {
        twitter: []
    };
    accounts.twitter.push("twitter_schedule_video"); //Push no.of Twitter accounts to enterprise user

    const loginPage = new LoginPage(page);
    const userSetUp = new SetUpEnterpriseUser();
    const composePage = new ComposePage(page);

    await userSetUp.setUpEnterpriseUser(orgName, 'pw_send_now_video', accounts);
    await loginPage.signInSkipOnboarding('pw_send_now_video');

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, `${accounts.twitter}`).username);
    await composePage.writeMessage(composeText);
    await composePage.verifyTwitterPreview(composeText);
    await composePage.uploadFile('test_data/publisher/videos/video.mp4');
    await composePage.verifyTwitterVideoPreview();
    await composePage.selectMessageScheduleDate();
});
