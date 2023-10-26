const { test } = require('@playwright/test');
const fs = require('fs');
const { formatISO, addHours } = require('date-fns');
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

    await page.goto('login/');
    await page.getByRole('textbox', { name: 'Please enter a valid email address' }).fill(testData[2].email)
    await page.locator('#loginPasswordInput').fill(testData[2].password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await page.waitForTimeout(2000);

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
