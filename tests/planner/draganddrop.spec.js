// @ts-check
const { test } = require('@playwright/test');
const { formatISO, addHours, addDays, subDays } = require('date-fns');
const {LoginPage} = require("../../pages/login");
const {PlannerPage} = require("../../pages/planandcreate/planner");
const fs = require('fs');
const scheduleV3Message = require("../../custom-commands/scheduleV3Message");

 function readJson() {
  let rawData = fs.readFileSync('fixtures/accounts.json', 'utf-8');
  return JSON.parse(rawData);
}

test('Drag and drop card on week view', async ({ page }) => {
    const user = readJson();
    const loginPage = new LoginPage(page);
    const createScheduleMessage = new scheduleV3Message();
    const plannerPage = new PlannerPage(page);

    const scheduleTime = addHours(new Date(), 1);
    const composeText = `test drag and drop card on planner week view ${Date.now()}`;

    await loginPage.login(user[0].email, user[0].password);

    /* Create a scheduled message */
    await createScheduleMessage.command(
        parseInt(user[0].memberId, 10),
        {
            messages: [
                {
                    socialProfileId: user[0].socialProfileId,
                    text: composeText,
                    scheduledSendTime: formatISO(scheduleTime)
                }
            ]
        }
    );

  await plannerPage.dragAndDropCard(composeText);
  await page.close();
});

test('drag and drop media from side pane on week view', async ({ page }) => {
  const user = readJson();

  const loginPage = new LoginPage(page);
  const plannerPage = new PlannerPage(page);

  await loginPage.login(user[1].email, user[1].password);
  await plannerPage.dragAndDropMedia();
  await page.close();
});
