const { test, expect} = require('@playwright/test');
const createUser = require('../custom-commands/createUser');
const getFixture = require('../custom-commands/getFixture');
const tearDown = require('../custom-commands/tearDown.js');
const {LoginPage} = require("../pages/login");
const {ComposePage} = require("../pages/planandcreate/compose");

test.afterEach(async ({ page }) => {
    const cleanUp = new tearDown();

    await cleanUp.command();
    await page.close();
});

test('Try resource locking', async ({page}) => {
    const createNewUser = new createUser();
    const addFixture = new getFixture();
    const loginPage = new LoginPage(page);

    await createNewUser.command('pw_test', 'professional');
    await addFixture.command('test1','twitter', true, 180);
    await addFixture.command('test2','twitter', true, 180);

    await page.waitForTimeout(2000);
    await loginPage.signIn('pw_test');
    await page.waitForTimeout(1000);
});
