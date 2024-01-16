const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {MemberOverViewPage} = require("../../pages/memberOverview");
const {LinkPresetsManagePage} = require("../../pages/planandcreate/linkPresetsManage");
const {SetUpEnterpriseUser} = require("../../custom-commands/setUpEnterpriseUser")
const {LoginPage} = require("../../pages/login");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Bitly link shortener creation', async ({ page }) => {
    let orgName = 'Bit_ly_org_' + Math.floor(Math.random() * 10000);
    let accounts = {
        twitter: []
    };
    accounts.twitter.push("twitter_bit_ly"); //Push no.of Twitter accounts to enterprise user

    const loginPage = new LoginPage(page);
    const memberPage = new MemberOverViewPage(page);
    const linkPresetsManagePage = new LinkPresetsManagePage(page);
    const userSetUp = new SetUpEnterpriseUser();

    await userSetUp.setUpEnterpriseUser(orgName,'bit_ly_user', accounts);
    await loginPage.signInSkipOnboarding('bit_ly_user');

    await memberPage.visitMember();
    await memberPage.selectLinkSettingButton();
    await linkPresetsManagePage.selectShortenerProvider('Bit.ly')
    await linkPresetsManagePage.createBitlyShortener(`New Bit.ly ${Date.now()}`)
});
