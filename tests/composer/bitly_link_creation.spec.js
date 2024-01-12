const { test, expect} = require('@playwright/test');
const tearDown = require('../../custom-commands/tearDown');
const {MemberOverViewPage} = require("../../pages/memberOverview");
const {LinkPresetsManagePage} = require("../../pages/planandcreate/linkPresetsManage");
const {SetUpAndLoginAsEnterpriseUser} = require("../setUpAndLoginAsEnterpriseUser")

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Bitly link shortener creation', async ({ page }) => {
    let orgName = 'Bitly_org_' + Math.floor(Math.random() * 10000);
    let accounts = new Map();
    accounts.set("twitter", 'twitter_bit_ly');

    const memberPage = new MemberOverViewPage(page);
    const linkPresetsManagePage = new LinkPresetsManagePage(page);
    const userLogin = new SetUpAndLoginAsEnterpriseUser();

    await userLogin.setUpAndLoginAsEnterpriseUser(orgName, page, 'bitly', accounts);

    await memberPage.visitMember();
    await memberPage.selectLinkSettingButton();
    await linkPresetsManagePage.selectShortenerProvider('Bit.ly')
    await linkPresetsManagePage.createBitlyShortener(`New Bit.ly ${Date.now()}`)
});
