const { test, expect} = require('@playwright/test');
const {ComposePage} = require("../../pages/planandcreate/compose");
const {LoginPage} = require("../../pages/login");
const fs = require('fs');

function readJson() {
    let rawData = fs.readFileSync('fixtures/accounts.json', 'utf-8');
    return JSON.parse(rawData);
}
test('Media upload', async ({ page }) => {
    const user = readJson();

    const loginPage = new LoginPage(page);
    const composePage = new ComposePage(page);

    await loginPage.login(user[2].email, user[2].password);
    await composePage.selectComposeButton();
    await composePage.uploadFile('tests/composer/owly-snowboard.jpg')
    await composePage.selectSocialProfile('Composer3H');
    await expect(composePage.twitterPreviewSingleImage).toBeVisible;
    await page.waitForTimeout(1000);
    await page.close();
  });
