const { test, expect} = require('@playwright/test');
const getFixture = require('../../custom-commands/getFixture');
const tearDown = require('../../custom-commands/tearDown');
const createOrg = require('../../custom-commands/createOrg');
const addSocialToOrg = require('../../custom-commands/addSocialToOrg');
const { LoginPage } = require("../../pages/login");
const {getObjectByName} = require("../../globals");
const scheduleV3Message = require("../../custom-commands/scheduleV3Message");
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const {PlannerPage} = require("../../pages/planandcreate/planner");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Verify scheduled message in week view', async ({ page }) => {
    let orgName = 'planner_basic_org_' + Math.floor(Math.random() * 10000);
    const message = `Planner New Compose Message! ${Date.now()}`;
    const scheduleTime = addHours(new Date(), 1);

    const addFixture = new getFixture();
    const createNewOrg = new createOrg();
    const addSocialNetwork = new addSocialToOrg();
    const loginPage = new LoginPage(page);
    const plannerPage = new PlannerPage(page);
    const createScheduleMessage = new scheduleV3Message();
    await addFixture.command('planner_basic', 'enterprise', false, 300);
    await addFixture.command('twitter_msg','twitter', false, 300);
    await createNewOrg.command(orgName);
    await addSocialNetwork.command('twitter_msg');
    await loginPage.signInSkipOnboarding('planner_basic');

    /* Create a scheduled message */
    await createScheduleMessage.command(
        parseInt(global.member[0].memberId, 10),
        {
            messages: [
                {
                    socialProfileId: getObjectByName(global.fixture, 'twitter_msg').socialProfile.socialProfileId,
                    text: message,
                    scheduledSendTime: formatISO(scheduleTime)
                }
            ]
        }
    );

    await plannerPage.visit();
    await plannerPage.verifyScheduledMessage(message);
    await plannerPage.showPreviewPane(message);
});

