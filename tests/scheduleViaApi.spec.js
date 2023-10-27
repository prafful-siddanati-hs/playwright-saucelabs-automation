const { test } = require('@playwright/test');
const fs = require('fs');
const { formatISO, addHours } = require('date-fns');
const { LoginPage } = require("../pages/login");
const scheduleV3Message = require("../custom-commands/scheduleV3Message");

function readJson(fileName) {
  let rawData = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(rawData)
}

test('Schedule a message via API', async ({ page }) => {
    const createScheduleMessage = new scheduleV3Message();

    const user = readJson('fixtures/accounts.json')
    
    const now = new Date();
    const scheduleTime = addHours(now, 24);
    const scheduleText = `This is scheduled via API in PlayWright ${scheduleTime}`;
    console.log(scheduleTime)

    const loginPage = new LoginPage(page);

    await createScheduleMessage.command(
        parseInt(user[2].memberId, 10),
        {
            messages: [
                {
                    socialProfileId: user[2].socialProfileId,
                    text: scheduleText,
                    scheduledSendTime: formatISO(scheduleTime)
                }
            ]
        });

    await loginPage.login(user[2].email, user[2].password);

    await page.getByLabel('Planner', { exact: true }).click();
    await page.getByText(scheduleText).click();

    await page.getByTestId('DeleteButton').click();
    await page.getByRole('button', { name: 'Delete post' }).click();
    await page.waitForTimeout(2000);

    await page.close();
});
