const { test } = require('@playwright/test');
const fs = require('fs');
const { formatISO, addHours } = require('date-fns');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {LoginPage} = require("../../pages/login");
const scheduleV3Message = require("../custom-commands/scheduleV3Message");

function readJson(fileName) {
  let rawData = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(rawData)
}

test('Schedule a message via API', async ({ page }) => {
    let testData = readJson('fixtures/accounts.json')
    
    const now = new Date();
    const scheduleTime = addHours(now, 24);
    const scheduleText = `This is scheduled via API in PlayWright ${now}`;

    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);

    await loginPage.login(user[2].email, user[2].password);

    const data = await scheduleV3Message(
        parseInt(testData[2].memberId, 10),
        {
            messages: [
                {
                    socialProfileId: testData[2].socialProfileId,
                    text: scheduleText,
                    scheduledSendTime: formatISO(scheduleTime)
                }
            ]
        });
    console.log(data)

    await page.getByLabel('Planner', { exact: true }).click();
    await page.getByText(scheduleText).click();

    await page.getByTestId('DeleteButton').click();
    await page.getByRole('button', { name: 'Delete post' }).click();
    await page.waitForTimeout(2000);

    await page.close();
});
