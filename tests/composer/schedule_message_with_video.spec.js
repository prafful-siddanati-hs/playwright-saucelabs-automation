const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {getObjectByName} = require("../../globals");
const {SetUpEnterpriseUser} = require("../../custom-commands/setUpEnterpriseUser");
const {LoginPage} = require("../../pages/login");
const createUser = require("../../custom-commands/createUser");
const getFixture = require("../../custom-commands/getFixture");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test.skip('Schedule message with video using composer', async ({ page }) => {
    const composeText = 'Video '+ + Math.floor(Math.random() * 1000);

    const createNewUser = new createUser();
    const addFixture = new getFixture();
    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);

    await createNewUser.command('pw_send_now_video', 'professional');
    await addFixture.command('schedule_video','plan_create_facebookpage', true, 180);

    await loginPage.signIn('pw_send_now_video');
    await composePage.selectComposeButton();
    await composePage.exitButton.click();
    await composePage.verifySocialProfileSelected(getObjectByName(global.fixture, 'schedule_video').username);
    await composePage.writeMessage(composeText);
    await composePage.verifyFacebookPreview(composeText);
    await composePage.uploadFile('test_data/publisher/videos/video_2.mp4');
    await composePage.verifyFacebookVideoPreview();
    await composePage.selectMessageScheduleDate();
});
