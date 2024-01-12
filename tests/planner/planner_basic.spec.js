const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {getObjectByName} = require("../../globals");
const scheduleV3Message = require("../../custom-commands/scheduleV3Message");
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const {PlannerPage} = require("../../pages/planandcreate/planner");
const {SetUpAndLoginAsEnterpriseUser} = require("../setUpAndLoginAsEnterpriseUser");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Verify scheduled message in week view', async ({ page }) => {
    let orgName = 'planner_basic_org_' + Math.floor(Math.random() * 10000);
    const message = `Planner New Compose Message! ${Date.now()}`;
    const scheduleTime = addHours(new Date(), 1);
    let accounts = new Map();
    accounts.set("twitter", 'twitter_msg');
    const createScheduleMessage = new scheduleV3Message();
    const userLogin = new SetUpAndLoginAsEnterpriseUser();
    const plannerPage = new PlannerPage(page);

    await userLogin.setUpAndLoginAsEnterpriseUser(orgName, page, 'pw_send_now', accounts);

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

