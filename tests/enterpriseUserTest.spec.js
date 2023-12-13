const { test } = require('@playwright/test');
const getFixture = require('../custom-commands/getFixture');
const tearDown = require('../custom-commands/tearDown');
const createOrg = require('../custom-commands/createOrg');
const addSocialToOrg = require('../custom-commands/addSocialToOrg');
const { LoginPage } = require("../pages/login");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Create an Enterprise user', async ({ page }) => {
    let orgName = 'playwright_org_' + Math.floor(Math.random() * 10000);
    const addFixture = new getFixture();
    const createNewOrg = new createOrg();
    const addSocialNetwork = new addSocialToOrg();
    const loginPage = new LoginPage(page);

    await addFixture.command('pw_enterprise_test', 'enterprise', false, 240);
    await addFixture.command('test_x_acc1','twitter', false, 300);
    await addFixture.command('test_x_acc2','twitter',false,240);
    await createNewOrg.command(orgName);
    await addSocialNetwork.command('test_x_acc1');
    await addSocialNetwork.command('test_x_acc2');

    //await page.waitForTimeout(2000);
    //TODO:Implement signInSkipOnboarding() similar to Nightwatch

    await page.waitForTimeout(2000);
});
