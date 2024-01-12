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

test('Schedule message using composer', async ({ page }) => {
    let orgName = 'schedule_org_' + Math.floor(Math.random() * 10000);
    const composeText = `Schedule New Compose Message With Video! ${Date.now()}`;
    let accounts = new Map();
    accounts.set("twitter", 'twitter_schedule_video');

    const userLogin = new SetUpAndLoginAsEnterpriseUser();
    const composePage = new ComposePage(page);

    await userLogin.setUpAndLoginAsEnterpriseUser(orgName, page, 'pw_send_now', accounts);

    await composePage.selectComposeButton();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'twitter_schedule_video').username);
    await composePage.writeMessage(composeText);
    await composePage.verifyTwitterPreview(composeText);
    await composePage.uploadFile('tests/composer/video.mp4');
    await composePage.verifyTwitterVideoPreview();
    await composePage.selectMessageScheduleDate();
});
