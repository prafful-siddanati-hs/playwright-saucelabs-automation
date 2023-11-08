const { test } = require('@playwright/test');
const fs = require('fs');
const {addMonths, lastDayOfMonth} = require('date-fns');
const { LoginPage } = require("../pages/login");
const createCampaign = require("../custom-commands/createCampaign");

function readJson(fileName) {
  let rawData = fs.readFileSync(fileName, 'utf-8');
  return JSON.parse(rawData)
}

test('Create campaign via API', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const createTestCampaign = new createCampaign();

    const user = readJson('fixtures/accounts.json')
    const CAMPAIGN_START_DATE = addMonths(new Date(), 1);
    const CAMPAIGN_END_DATE = lastDayOfMonth(CAMPAIGN_START_DATE);
    const campaignName = `Campaign via API in PlayWright ${Date.now()}`;

    let apiAuthorizationValue = await loginPage.login(user[3].email, user[3].password).then(() => {
         let apiAuthorization = loginPage.cookie.find(({name}) => name === "apiAuthorization");
        return apiAuthorization.value;
    });

    /* Create test campaign */
    await createTestCampaign.command(
        parseInt(user[3].memberId, 10),
        {
            orgId: user[3].orgId,
            name: campaignName,
            dateFrom: CAMPAIGN_START_DATE,
            dateTo: CAMPAIGN_END_DATE,
            description: 'Test Campaign',
        },
        apiAuthorizationValue
        );

    await page.close();
});
