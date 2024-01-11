const { test, expect} = require('@playwright/test');
const getFixture = require('../../custom-commands/getFixture');
const tearDown = require('../../custom-commands/tearDown');
const createOrg = require('../../custom-commands/createOrg');
const { LoginPage } = require("../../pages/login");
const {MemberOverViewPage} = require("../../pages/memberOverview");
const {getObjectByName} = require("../../globals");
const {LinkPresetsManagePage} = require("../../pages/planandcreate/linkPresetsManage");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Bitly link shortener creation', async ({ page }) => {
    let orgName = 'Bitly_org_' + Math.floor(Math.random() * 10000);
    const addFixture = new getFixture();
    const createNewOrg = new createOrg();
    const loginPage = new LoginPage(page);
    const memberPage = new MemberOverViewPage(page);
    const linkPresetsManagePage = new LinkPresetsManagePage(page);

    await addFixture.command('pw_send_now', 'enterprise', false, 300);
    await createNewOrg.command(orgName);

    await loginPage.signInSkipOnboarding('pw_send_now');
    await memberPage.visitMember();
    await memberPage.selectLinkSettingButton();
    await linkPresetsManagePage.selectShortenerProvider('Bit.ly')
    await linkPresetsManagePage.createBitlyShortener(`New Bit.ly ${Date.now()}`)
});
